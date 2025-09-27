import React from 'react'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px] rounded-lg' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our store</p>
          <p className='text-gray-500'>G-04, Maruti Skand, Opp.CCD, Anand Vidhyanagar Road <br/>Anand, Gujarat, 388001, IN</p>
          <p className='text-gray-500'>Tel: +91 9316988930 <br/> Email: foreverclothes@gmail.com</p>
        </div>
      </div>

      <NewsletterBox/>
    </div>
  )
}

export default Contact