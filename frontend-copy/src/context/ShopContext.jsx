import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const adminToken = "eyJhbGciOiJIUzI1NiJ9.YWRtaW5AZ21haWwuY29tQWRtaW5fMTIzNA.FmXGnJVSxdW-Y-rMtBnbkpvvtZP22xKzlZmDIlSSTzA"

    const [search,setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const [user, setUser] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, subtotal, discount, delivery, amount }
    const navigate = useNavigate();

    const addToCart = async (itemId, size) =>{
        if(!size){
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            }else{
                cartData[itemId][size] = 1;
            }
        }else{
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        //sending cart data to database
        if(token){
            try{
                await axios.post(backendUrl+'/api/cart/add',{itemId,size},{headers:{token}});
            }
            catch(error){
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const getCartCount = ()=>{
        let totalCount=0;
        for(const items in cartItems){ //item
            for(const item in cartItems[items]){ //size
                try{
                    if(cartItems[items][item]){
                        totalCount += cartItems[items][item];
                    }
                }catch(error){}
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) =>{
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        //updating cart data in database
        if(token){
            try{
                await axios.post(backendUrl+'/api/cart/update',{itemId,size,quantity},{headers:{token}});
            }
            catch(error){
                console.log(error);
                toast.error(error.message);
            }
        }
    }

    const getCartAmount=()=>{
        let totalAmount=0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=>product._id === items);
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item]>0){
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                }catch(error){}
            }
        }
        return totalAmount;
    }

    const getFinalAmount = () => {
        const subtotal = getCartAmount();
        if (appliedCoupon && appliedCoupon.subtotal === subtotal) {
            return appliedCoupon.amount;
        }
        return (subtotal === 0) ? 0 : subtotal + delivery_fee;
    }

    const applyCoupon = async (code) => {
        try{
            if(!token){
                toast.error('Please login to apply coupon');
                return null;
            }
            const subtotal = getCartAmount();
            // Block only if a coupon is applied for the same current subtotal
            if (appliedCoupon && appliedCoupon.subtotal === subtotal) {
                toast.error('A coupon is already applied. Remove it to apply another.');
                return null;
            }
            if (subtotal <= 0) {
                toast.error('Add items to cart first');
                return null;
            }
            const response = await axios.post(backendUrl+'/api/order/coupon/validate',{ code, subtotal },{headers:{token}});
            if(response.data.success){
                setAppliedCoupon(response.data.data);
                toast.success('Coupon applied');
                return response.data.data;
            }else{
                toast.error(response.data.message || 'Invalid coupon');
                setAppliedCoupon(null);
                return null;
            }
        }
        catch(error){
            console.log(error);
            toast.error(error.message);
            return null;
        }
    }

    const removeCoupon = () => {
        setAppliedCoupon(null);
    }

    const getProductData = async () =>{
        try{
            const response  = await axios.get(backendUrl+'/api/product/list',{headers:{token: adminToken}});
            console.log(response.data);
            if(response.data.success){
                setProducts(response.data.products);
            }else{
                toast.error('productData : '+response.data.message);
            }
        }
        catch(error){
            console.log(error);
            toast.error(error.message);
        }
    }

    const getUserCart = async (token) =>{
        try{
            const response = await axios.post(backendUrl+'/api/cart/get',{},{headers:{token}});
            if(response.data.success){
                setCartItems(response.data.cartData);
            }
        }
        catch(error){
            console.log(error);
            toast.error(error.message);
        }
    }

    const getUserProfile = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/user/profile', {}, {
                headers: { token }
            });
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.log(error);
            // Don't show error toast for profile fetch as it's not critical
        }
    }

    useEffect(()=>{
        getProductData();
    },[]);

    useEffect(()=>{
        if(!token && localStorage.getItem('token')){
            setToken(localStorage.getItem('token'));
            getUserCart(localStorage.getItem('token'));
            getUserProfile(localStorage.getItem('token'));
        }
    },[token]);

    // Auto-clear coupon if cart subtotal changes after applying
    useEffect(() => {
        const subtotal = getCartAmount();
        if (appliedCoupon && appliedCoupon.subtotal !== subtotal) {
            setAppliedCoupon(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItems]);

    const value = {
        products, currency, delivery_fee, 
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, getCartCount,setCartItems ,updateQuantity, getCartAmount, getFinalAmount, navigate,
        backendUrl, 
        token, setToken, user, setUser,
        appliedCoupon, applyCoupon, removeCoupon
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;