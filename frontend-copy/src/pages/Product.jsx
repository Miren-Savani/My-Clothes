import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products,currency,addToCart } = useContext(ShopContext);
  const [productData,setProductData] = useState(false);
  const [image,setImage] = useState('');
  const [size,setSize] = useState('');

  // Function to sort sizes in ascending order
  const sortSizes = (sizes) => {
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    return sizes.sort((a, b) => {
      return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
    });
  };

  const fetchProductData = async ()=>{
    products.map((item)=>{
      if(item._id === productId){
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    })
  }

  useEffect(()=>{
    fetchProductData();
    // Scroll to top when product page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },[products,productId])

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>

      {/* -----------------------------------Product Data------------------------------------------------ */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/* -----------------Product Images------------------ */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          {/* Small images */}
          <div className='flex flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
                <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shink-0 cursor-pointer rounded-lg' alt="images"/>
            ))}
          </div>
          {/* Big image */}
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-autosrc={image} rounded-lg' src={image} alt="" />
          </div>
        </div>

        {/* ----------------Product information------------------ */}
        <div className='flex-1'>
            <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
            <div className='flex items-center gap-1 mt-2'>
              <img src={assets.star_icon} alt="" className="w-3.5" />
              <img src={assets.star_icon} alt="" className="w-3.5" />
              <img src={assets.star_icon} alt="" className="w-3.5" />
              <img src={assets.star_icon} alt="" className="w-3.5" />
              <img src={assets.star_dull_icon} alt="" className="w-3.5" />
            </div>
            <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
            <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
            <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2 flex-wrap'>
                {sortSizes([...productData.sizes]).map((item,index)=>(
                  <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item===size? 'border-blue-400 bg-blue-50':''} rounded transition-colors duration-200 hover:bg-gray-200`} key={index}>{item}</button>
                ))}
              </div>
            </div>
            <button onClick={()=>addToCart(productData._id,size)} className='bg-gray-800 text-white px-8 py-3 text-sm active:bg-gray-700 rounded-lg'>ADD TO CART</button>
            <hr className='mt-8 sm:w-4/5'/>
            <div className='text-small text-gray-500 flex flex-col gap-1 mt-4'>
              <p>100% Original product</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
            </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------------------------------- */}

      {/* --------------------------Description & review Section--------------------------------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>Discover the perfect blend of comfort and fashion with our product. Made from high-quality fabric type, this piece offers a soft, breathable feel while ensuring durability for everyday wear. Designed with [key design features, e.g., a tailored fit, stylish patterns, or unique details], it effortlessly complements any wardrobe. Whether you're dressing up for an occasion or keeping it casual, this versatile piece is a must-have. Available in multiple colors and sizes to suit your style.</p>
          <p>Upgrade your wardrobe with our product, designed for those who appreciate both style and comfort. Crafted from premium fabric type, this piece provides a soft touch against your skin while ensuring durability and breathability. The modern fit and timeless design make it perfect for any occasion—whether you're dressing up or keeping it casual.</p>
        </div>
      </div>

      {/* ------------------------------Display related products---------------------------------------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory}/>

    </div>
  ) : <div className='opacity-0'></div>
}

export default Product