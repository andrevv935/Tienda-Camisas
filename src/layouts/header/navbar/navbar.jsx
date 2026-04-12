import { React, useEffect, useState } from "react"
import ResponsiveMenu from "./responsiveMenu.jsx"
import { Link, useNavigate } from "react-router-dom"

// iconos
import { IoIosSearch } from "react-icons/io"
import { PiShoppingCartFill } from "react-icons/pi"
import { IoMenu } from "react-icons/io5"

// Configuracion de tema
import { CiSettings } from "react-icons/ci"
import { MdStyle } from "react-icons/md"

import { cyclePalette } from "../../../hook/cyclePalette.js"
import { clearCurrentUser, getCurrentUser } from "../../../backend/services/auth/authApiClient.js"
import { useCart } from '../../../hook/user/useCart.jsx'


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    setCurrentUser(null);
    clearCurrentUser();
    navigate('/', { replace: true });
    setOpen(false);
  }

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('auth:changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth:changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return (
    <>
      <nav className="bg-primary-light justify-center rounded-xl">
          <div className="p-4 flex justify-between items-center">
              {/* Logo section */}
              <div className="flex items-center text-2xl font-semibold">
                <p className="tracking-wider hover:cursor-pointer">
                  <Link to="/">FREEDDOM</Link>
                </p>
              </div>
              {/* Icons section */}
              <div className="flex items-center gap-4">
                <button className="text-xl hover:bg-accent-light p-2 rounded-full duration-200">
                  <IoIosSearch />
                </button>
                <button
                  className="relative text-xl hover:bg-accent-light p-2 rounded-full duration-200"
                  type='button'
                  onClick={() => navigate(`/user/${currentUser?.id || 'guest'}/cart`)}
                  aria-label='Abrir carrito'
                >
                  <PiShoppingCartFill />
                  {totalItems > 0 && (
                    <span className='absolute -top-1 -right-1 min-w-5 rounded-full px-1 text-center text-[10px] font-semibold bg-accent-light'>
                      {totalItems}
                    </span>
                  )}
                </button>
                <button className="cycle-palette-btn text-xl hover:bg-accent-light p-2 rounded-full duration-200" onClick={cyclePalette}>
                  <MdStyle />
                </button>
                {currentUser ? (
                  <div className="hidden md:flex items-center gap-3">
                    <span className="paragraph">{currentUser.name || currentUser.email}</span>
                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="paragraph hover:bg-accent-light px-4 py-2 rounded-md duration-200"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="paragraph border-2 border-accent-light hover:bg-accent-light px-4 py-2 rounded-md duration-200"
                    >
                      Cerrar sesion
                    </button>
                  </div>
                ) : (
                  <button className="hidden md:block paragraph border-accent-light hover:bg-accent-light px-6 py-2 rounded-md duration-200">
                    <Link to="/login">Login</Link>
                  </button>
                )}
              </div>
              {/* Menu hamburguesa */}
              <div className="hover:cursor-pointer md:hidden" onClick={() => setOpen(!open)}>
                <IoMenu className="text-2xl"/>
              </div>
          </div>
      </nav>

      {/* Mobile sidebar */}
      <ResponsiveMenu
        open={open}
        onClose={() => setOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </>
  )
}

export default Navbar