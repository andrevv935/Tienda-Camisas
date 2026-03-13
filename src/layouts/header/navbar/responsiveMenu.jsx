import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const ResponsiveMenu = ({ open, onClose }) => {
  const handleClose = () => {
    onClose();
  }
  return (
    <AnimatePresence mode='wait'>
      {open && (
        <motion.div
        initial={{ opacity: 0, y:-100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="absolute top-12 left-0 w-full h-screen z-20"
        >
          <div className='text-xl font-semibold uppercase bg-accent-dark text-white py-10 m-6 rounded-3xl' onClick={handleClose}>
            <ul className='flex flex-col justify-center items-center gap-10 hover:cursor-pointer'>
              <li><Link to="/" onClick={handleClose}>Home</Link></li>
              <li><Link to="/products" onClick={handleClose}>Products</Link></li>
              <li><Link to="/login" onClick={handleClose}>Login</Link></li>
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ResponsiveMenu