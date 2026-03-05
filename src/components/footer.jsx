import React from 'react'

const Footer = () => {
  return (
    <footer className='bg-[#202020] py-7 mt-10 flex flex-col items-center justify-between'>
        <div className='text-white/40'>
            <div className='mb-7'>
                <div className='flex bg-bg-dark text-white w-10 h-10 rounded-full mx-auto items-center'>
                    <p className='mx-auto font-medium text-xl'>F</p>
                </div>
            </div>
            <div className=''>
                <ul className='flex gap-10'>
                    <li><a href="#">ABOUT</a></li>
                    <li><a href="#">SHOP</a></li>
                    <li><a href="#">SERVICES</a></li>
                    <li><a href="#">CONTACTS</a></li>
                </ul>
            </div>
            <div className='flex gap-10 justify-center my-7'>
                <div className='bg-gray-200 w-8 h-8 rounded-full'></div>
                <div className='bg-gray-200 w-8 h-8 rounded-full'></div>
                <div className='bg-gray-200 w-8 h-8 rounded-full'></div>
            </div>
            <div>
                <p>Derechos de autor</p>
            </div>
        </div>
        
    
    </footer>
  )
}

export default Footer