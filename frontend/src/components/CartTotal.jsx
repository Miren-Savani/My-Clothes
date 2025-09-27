import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {
    const {currency,delivery_fee,getCartAmount,getFinalAmount,appliedCoupon,applyCoupon,removeCoupon} = useContext(ShopContext);
    const [code, setCode] = useState('');


  return (
    <div className='w-full border border-gray-250 rounded-xl px-5 py-4'>
        <div className='text-2xl'>
            <Title text1={'CART'} text2={'TOTALS'} />
        </div>

        <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency} {getCartAmount()}.00</p>
            </div>
            <hr />
            {appliedCoupon && appliedCoupon.subtotal === getCartAmount() ? (
                <>
                <div className='flex justify-between'>
                    <p>Discount ({appliedCoupon.code})</p>
                    <p>- {currency} {appliedCoupon.discount}.00</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <p>Shipping fee</p>
                    <p>{currency} {appliedCoupon.delivery}.00</p>
                </div>
                </>
            ) : (
                <div className='flex justify-between'>
                    <p>Shipping fee</p>
                    <p>{currency} {delivery_fee}.00</p>
                </div>
            )}
            <hr />
            <div className='flex justify-between'>
                <p>Total</p>
                <p>{currency} {getFinalAmount()}.00</p>
            </div>

        </div>

        <div className='mt-4 flex items-center gap-2'>
            {appliedCoupon && appliedCoupon.subtotal === getCartAmount() ? (
                <>
                <span className='text-green-600 text-sm'>Applied: {appliedCoupon.code}</span>
                <button type='button' onClick={removeCoupon} className='text-red-600 text-sm underline'>Remove</button>
                </>
            ) : (
                <>
                <input value={code} onChange={(e)=>setCode(e.target.value)} className='border border-gray-300 rounded py-1 px-2 text-sm flex-1' placeholder='Coupon code' />
                <button type='button' onClick={()=>applyCoupon(code)} className='bg-black text-white text-sm px-3 py-1 rounded'>Apply</button>
                </>
            )}
        </div>

    </div>
  )
}

export default CartTotal