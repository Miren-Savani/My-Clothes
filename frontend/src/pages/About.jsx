import React from 'react'
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div>
      <div className='text-2xl text-start pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px] rounded-lg' src={assets.about_img} />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Welcome to website, where fashion meets individuality and style knows no boundaries. Our mission is to empower people through fashion, offering clothing that not only makes a statement but also tells a story—yours.</p>
          <p>At website, we believe that what you wear should reflect who you are and how you feel. That’s why we curate an extensive range of clothing to suit every personality, occasion, and lifestyle. From timeless wardrobe staples to bold statement pieces, we’ve got you covered. Whether you’re dressing up for a night out, refreshing your workwear collection, or staying cozy at home, our collection is designed to blend comfort, quality, and style seamlessly.</p>
          <b className='text-gray-800'>Our Mission</b>
          <p>Our mission is to inspire confidence and empower self-expression through fashion. We are dedicated to offering high-quality, stylish clothing that reflects individuality while promoting sustainability and ethical practices.</p>
        </div>
      </div>

      <div className='text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20 rounded-xl'>
        <div className='border px-10 md:px-16 py-8 sm:py-15 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>Crafted with care and precision, our clothing combines premium materials and exceptional craftsmanship to deliver timeless quality you can trust.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-15 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>Fashion at your fingertips—shop effortlessly anytime, anywhere with our seamless online experience and fast, reliable delivery.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-15 flex flex-col gap-5'>
          <b>Exceptional customer Service:</b>
          <p className='text-gray-600'>We’re dedicated to providing a seamless shopping experience, with personalized support and prompt service to ensure your satisfaction every step of the way.</p>
        </div>
      </div>

      <NewsletterBox />

    </div>
  )
}

export default About