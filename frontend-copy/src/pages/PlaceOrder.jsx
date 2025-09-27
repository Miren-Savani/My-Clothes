import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
  const [method,setMethod] = useState('cod');
  const [user, setUser] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const {navigate,backendUrl,token,cartItems,setCartItems,getCartAmount,getFinalAmount,delivery_fee,products,appliedCoupon} = useContext(ShopContext);
  const [formdata,setFormData] = useState({
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    zipcode:'',
    country:'',
    phone:''
  });

  // Fetch user profile and address
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.post(backendUrl + '/api/user/profile', {}, {
          headers: { token }
        });
        if (response.data.success) {
          setUser(response.data.user);
          // If user has saved address, use it by default
          if (response.data.user.hasAddress && response.data.user.address) {
            setUseSavedAddress(true);
            setFormData({
              firstName: response.data.user.address.firstName || '',
              lastName: response.data.user.address.lastName || '',
              email: response.data.user.address.email || '',
              street: response.data.user.address.street || '',
              city: response.data.user.address.city || '',
              state: response.data.user.address.state || '',
              zipcode: response.data.user.address.zipcode || '',
              country: response.data.user.address.country || '',
              phone: response.data.user.address.phone || ''
            });
          } else {
            setShowNewAddressForm(true);
          }
        }
      } catch (error) {
        console.log(error);
        // If no saved address, show new address form
        setShowNewAddressForm(true);
      }
    };

    if (token) {
      fetchUserProfile();
    }
  }, [token, backendUrl]);

  const onChangeHandler = (event)=>{
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({...data,[name]:value}));
  }

  const handleUseSavedAddress = () => {
    if (user && user.address) {
      setFormData({
        firstName: user.address.firstName || '',
        lastName: user.address.lastName || '',
        email: user.address.email || '',
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zipcode: user.address.zipcode || '',
        country: user.address.country || '',
        phone: user.address.phone || ''
      });
      setUseSavedAddress(true);
      setShowNewAddressForm(false);
    }
  }

  const handleUseNewAddress = () => {
    setFormData({
      firstName:'',
      lastName:'',
      email:'',
      street:'',
      city:'',
      state:'',
      zipcode:'',
      country:'',
      phone:''
    });
    setUseSavedAddress(false);
    setShowNewAddressForm(true);
  }

  const onSubmitHandler = async(event)=>{
    event.preventDefault();
    try{
      let orderItems = [];
      for(const items in cartItems){
        for(const item in cartItems[items]){
          if(cartItems[items][item]>0){
            const itemInfo = structuredClone(products.find(product=>product._id===items));
            if(itemInfo){
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }
      
      const subtotal = getCartAmount();
      const amount = getFinalAmount();
      let orderData = {
        address : formdata,
        items : orderItems,
        amount,
        subtotal,
        discount : appliedCoupon && appliedCoupon.subtotal === subtotal ? appliedCoupon.discount : 0,
        couponCode : appliedCoupon && appliedCoupon.subtotal === subtotal ? appliedCoupon.code : ''
      }

      switch (method){
        //API calls for COD
        case 'cod' :
          const response = await axios.post(backendUrl+'/api/order/place',orderData,{headers:{token}});
          if(response.data.success){
            setCartItems({});
            navigate('/orders');
          }else{
            toast.error(response.data.message);
          }
          break;
        case 'stripe' :
          const responseStripe = await axios.post(backendUrl+'/api/order/stripe',orderData,{headers:{token}});
          if(responseStripe.data.success){
            const {session_url} = responseStripe.data;
            window.location.replace(session_url);
          }else{
            toast.error(responseStripe.data.message);
          }
          break;

        default :
          break;
      }
    } 
    catch(error){
      console.log(error);
      toast.error(error.message);
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-4 min-h-[80vh] border-t'>

      {/* -----------------Left side - Delivery Information---------------------- */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div>

        {/* Address Selection Options */}
        {user && user.hasAddress && user.address && (
          <div className='space-y-3 mb-4'>
            <div className='flex gap-3'>
              <button
                type="button"
                onClick={handleUseSavedAddress}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  useSavedAddress 
                    ? 'bg-green-50 border-green-300 text-green-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Use Saved Address
              </button>
              <button
                type="button"
                onClick={handleUseNewAddress}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  !useSavedAddress 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Use New Address
              </button>
            </div>

            {/* Saved Address Display */}
            {useSavedAddress && user.address && (
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <h4 className='font-medium text-gray-800 mb-2'>Saved Address</h4>
                <div className='text-sm text-gray-600 space-y-1'>
                  <p><span className='font-medium'>Name:</span> {user.address.firstName} {user.address.lastName}</p>
                  <p><span className='font-medium'>Email:</span> {user.address.email}</p>
                  <p><span className='font-medium'>Address:</span> {user.address.street}</p>
                  <p><span className='font-medium'>City:</span> {user.address.city}, {user.address.state} {user.address.zipcode}</p>
                  <p><span className='font-medium'>Country:</span> {user.address.country}</p>
                  <p><span className='font-medium'>Phone:</span> {user.address.phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Address Form - Show when using new address or no saved address */}
        {(!user || !user.hasAddress || showNewAddressForm) && (
          <div className='space-y-3'>
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} name='firstName' value={formdata.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='First name' type="text" required/>
              <input onChange={onChangeHandler} name='lastName' value={formdata.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Last name' type="text" required/>
            </div>
            <input onChange={onChangeHandler} name='email' value={formdata.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Email address' type="email" required/>
            <input onChange={onChangeHandler} name='street' value={formdata.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Street' type="text" required/>
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} name='city' value={formdata.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='City' type="text" required/>
              <input onChange={onChangeHandler} name='state' value={formdata.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='State' type="text" required/>
            </div>
            <div className='flex gap-3'>
              <input onChange={onChangeHandler} name='zipcode' value={formdata.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Zipcode' type="number" required/>
              <input onChange={onChangeHandler} name='country' value={formdata.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Country' type="text" required/>
            </div>
            <input onChange={onChangeHandler} name='phone' value={formdata.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Phone' type="number" required/>
          </div>
        )}
      </div>

      {/* ------------------------Right side - Payments----------------------- */}
      <div className='mt-8'>

        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'}/>
          {/* -----Payment Metod selection----- */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            {/* Stripe */}
            <div onClick={()=>setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='stripe'? 'bg-green-400':''}`}></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
            </div>
            {/* Razorpay */}
            <div onClick={()=>setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='razorpay'? 'bg-green-400':''}`}></p>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
            </div>
            {/* Cash on delivery */}
            <div onClick={()=>setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='cod'? 'bg-green-400':''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>
          {/* Place Order */}
          <div className='w-full text-end mt-8'> 
            <button type='submit' className='bg-black active:bg-gray-800 text-white px-16 py-3 rounded-lg text-sm'>PLACE ORDER</button>
          </div> 
          {/* Dont forget to add navigation again ---X---X---*/}

        </div>

      </div>

    </form>
  )
}

export default PlaceOrder