import React from 'react'
import { FaFacebook } from "react-icons/fa"
import { FaInstagram } from "react-icons/fa"
import { FaTiktok } from "react-icons/fa"

const Footer = () => {
    return (
        <footer className='app-footer bg-secondary-light py-10 px-4 w-full flex flex-col items-center justify-between border-t border-accent-light'>
            <div>
                <div className='mb-10'>
                    <div className='flex bg-primary-light w-10 h-10 rounded-full mx-auto items-center'>
                        {/* Logo */}
                        <p className='subtitle mx-auto font-medium text-xl'>F</p>
                    </div>
                </div>
                <div className='w-full px-2'>
                    <ul className='flex flex-wrap gap-4 md:gap-10 justify-center text-center'>
                        <li className='paragraph'><a href="#">ABOUT</a></li>
                        <li className='paragraph'><a href="#">SHOP</a></li>
                        <li className='paragraph'><a href="#">SERVICES</a></li>
                        <li className='paragraph'><a href="#">CONTACTS</a></li>
                    </ul>
                </div>
                <div className='flex gap-10 justify-center my-10'>
                    <a href="#"><FaFacebook className='size-6 hover:text-accent-light' /></a>
                    <a href="#"><FaInstagram className='size-6 hover:text-accent-light' /></a>
                    <a href="#"><FaTiktok className='size-6 hover:text-accent-light' /></a>
                </div>
            </div>


        </footer>
    )
}

export default Footer