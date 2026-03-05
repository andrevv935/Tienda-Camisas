import React from "react"
import { NavbarMenu } from "../../assets/mockData/data.js"
import ResponsiveMenu from "./responsiveMenu.jsx"

// iconos
import { IoIosSearch } from "react-icons/io"
import { PiShoppingCartFill } from "react-icons/pi"
import { IoMenu } from "react-icons/io5"

// Configuracion de tema
import { CiSettings } from "react-icons/ci"
import { MdStyle } from "react-icons/md"


const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <nav className="text-white bg-black justify-center">
          <div className="p-4 flex justify-between items-center">
              {/* Logo section */}
              <div className="flex items-center text-2xl font-semibold">
                <p className="tracking-wider">FREEDDOM</p>
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
                <button className="text-xl hover:bg-accent-dark hover:text-black p-2 rounded-full duration-200">
                  <MdStyle />
                </button>
                <button className="text-accent-dark border-2 border-accent-dark hover:text-white hover:bg-accent-dark px-6 py-2 rounded-md duration-200 hidden md:block">
                  Login
                </button>
              </div>
              {/* Menu hamburguesa */}
              <div className="md:hidden" onClick={() => setOpen(!open)}>
                <IoMenu className="text-2xl"/>
              </div>
          </div>
      </nav>

      {/* Mobile sidebar */}
      <ResponsiveMenu />
    </>
  )
}

export default Navbar