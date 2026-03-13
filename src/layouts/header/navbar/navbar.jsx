import { React, useEffect, useState } from "react"
import { NavbarMenu } from "../../../assets/mockData/data.js"
import ResponsiveMenu from "./responsiveMenu.jsx"
import { Link } from "react-router-dom"

// iconos
import { IoIosSearch } from "react-icons/io"
import { PiShoppingCartFill } from "react-icons/pi"
import { IoMenu } from "react-icons/io5"

// Configuracion de tema
import { CiSettings } from "react-icons/ci"
import { MdStyle } from "react-icons/md"

import { cyclePalette } from "../../../hook/cyclePalette.js"


const Navbar = () => {
  const [open, setOpen] = useState(false);
  // Si el la pantalla es de tamaño mediano o menos, el boton con la clase 'login-btn' no se muestra
  useEffect(() => {
    const handleResize = () => {
      const loginBtn = document.querySelector('.login-btn');
      if (window.innerWidth < 768) {
        loginBtn.style.display = 'none';
      } else {
        loginBtn.style.display = 'block';
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <>
      <nav className="text-white bg-black justify-center">
          <div className="p-4 flex justify-between items-center">
              {/* Logo section */}
              <div className="flex items-center text-2xl font-semibold">
                <p className="tracking-wider hover:cursor-pointer">
                  <Link to="/">FREEDDOM</Link>
                </p>
              </div>
              {/* Menu section */}
              <div className="hidden md:block">
                <ul className="flex items-center gap-6 text-white/70">
                  {NavbarMenu.map((item) => {
                    return (
                      <li key={item.id}>
                        <a href={item.link} className="inline-block font-medium py-1 px-3 hover:text-accent-dark">{item.title}</a>
                      </li>
                    )
                  })}
                </ul>
              </div>
              {/* Icons section */}
              <div className="flex items-center gap-4">
                <button className="text-xl hover:bg-accent-dark hover:text-black p-2 rounded-full duration-200">
                  <IoIosSearch />
                </button>
                <button className="text-xl hover:bg-accent-dark hover:text-black p-2 rounded-full duration-200">
                  <PiShoppingCartFill />
                </button>
                <button className="cycle-palette-btn text-xl hover:bg-accent-dark hover:text-black p-2 rounded-full duration-200" onClick={cyclePalette}>
                  <MdStyle />
                </button>
                {/*Si la pantalla es de tamaño mediano, el moton no se muestra*/}
                <button className="login-btn text-accent-dark border-2 border-accent-dark hover:text-white hover:bg-accent-dark px-6 py-2 rounded-md duration-200">
                  <Link to="/login">Login</Link>
                </button>
              </div>
              {/* Menu hamburguesa */}
              <div className="hover:cursor-pointer md:hidden" onClick={() => setOpen(!open)}>
                <IoMenu className="text-2xl"/>
              </div>
          </div>
      </nav>

      {/* Mobile sidebar */}
      <ResponsiveMenu open={open} onClose={() => setOpen(false)}/>
    </>
  )
}

export default Navbar