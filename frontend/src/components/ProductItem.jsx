import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';

const ProductItem = ({id, image, name, price}) => {
    const {currency} = useContext(ShopContext);

    // Function to handle click and scroll to top
    const handleProductClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  return (
    <Link to={`/product/${id}`} className='text-gray-700 cursor-pointer' onClick={handleProductClick}>
        <div className='overflow-hidden'>
            <img className='hover:scale-110 transition ease-in-out rounded-lg' src={image[0]} alt='Product-image' />
        </div>
        <p className='pt-3 pb-1 text-sm'>{name}</p>
        <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem