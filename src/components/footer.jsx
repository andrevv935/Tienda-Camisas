import React from 'react'
import { FaFacebook } from "react-icons/fa"
import { FaInstagram } from "react-icons/fa"
import { FaTiktok } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className='bg-[#202020] py-7 flex flex-col items-center justify-between'>
        <div className='text-white/40'>
            <div className='mb-10'>
                <div className='flex bg-bg-dark text-white w-10 h-10 rounded-full mx-auto items-center'>
                    {/* Logo */}
                    <p className='subtitle mx-auto font-medium text-xl'>F</p>
                </div>
            </div>
            <div className=''>
                <ul className='flex gap-10'>
                    <li className='paragraph'><a href="#">ABOUT</a></li>
                    <li className='paragraph'><a href="#">SHOP</a></li>
                    <li className='paragraph'><a href="#">SERVICES</a></li>
                    <li className='paragraph'><a href="#">CONTACTS</a></li>
                </ul>
            </div>
            <div className='flex gap-10 justify-center my-10'>
                <a href="#"><FaFacebook className='size-6 text-white'/></a>
                <a href="#"><FaInstagram className='size-6 text-white'/></a>
                <a href="#"><FaTiktok className='size-6 text-white'/></a>
            </div>
            <div>
                <p className='paragraph'>Daniel Laviera</p>
            </div>
        </div>
        
    
    </footer>
  )
}

export default Footer