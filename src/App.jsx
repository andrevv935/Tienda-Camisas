import { useEffect } from 'react'
import { Navigate, Outlet, Routes, Route } from 'react-router-dom';
import Header from './layouts/header/header.jsx'
import Footer from './components/footer.jsx'

import LoginPage from './pages/login/index.jsx'
import RegisterPage from './pages/register/index.jsx';

import DashboardLayout from './layouts/dashboard/dashboardLayout.jsx'
import Dashboard from './layouts/dashboard/dashboard.jsx'
import Font from './layouts/dashboard/font.jsx'
import Palette from './layouts/dashboard/palette.jsx'
import CreateProduct from './layouts/dashboard/createProduct.jsx'
import CreateCoupon from './layouts/dashboard/coupon.jsx'

import UserLayout from './layouts/user/userLayout.jsx';
import BillingPage from './layouts/user/billingPage.jsx';
import CartPage from './layouts/user/cart/index.jsx';

import HomePage from './pages/home/index.jsx'
import { fetchPalettes } from './backend/services/palettes/paletteApiClient.js'
import { fetchFonts } from './backend/services/fonts/fontApiClient.js'
import { getCurrentUser } from './backend/services/auth/authApiClient.js'
import ProductsPage from './components/products/productsPage.jsx';
import ProductPage from './components/products/productPage.jsx';

import { BillingConfigProvider } from './layouts/billing/BillingConfigContext.jsx';
import BillingConfigPage from './layouts/billing/BillingConfigPage.jsx';
import { CartProvider } from './hook/user/useCart.jsx';

const MODE_STORAGE_KEY = 'preferredPaletteMode'

function RequireAdmin({ children }) {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />
    }

    return children
}

function UserLayoutGate() {
    const user = getCurrentUser()

    if (user) {
        return <UserLayout />
    }

    return <Outlet />
}

function App(){
    useEffect(() => {
        async function bootstrapGlobalTheme() {
            try {
                const [palettes, fonts] = await Promise.all([fetchPalettes(), fetchFonts()])
                const root = document.documentElement

                const defaultPalette = palettes.find((palette) => palette.is_default_active) || palettes[0] || null
                const darkPalette = palettes.find((palette) => palette.is_dark_active)
                const colorblindPalette = palettes.find((palette) => palette.is_colorblind_active)

                const paletteByMode = {
                    default: defaultPalette,
                    dark: darkPalette,
                    colorblind: colorblindPalette
                }

                const availableModes = ['default', 'dark', 'colorblind']
                    .filter((mode) => Boolean(paletteByMode[mode]))

                const storedMode = localStorage.getItem(MODE_STORAGE_KEY)
                const resolvedMode = availableModes.includes(storedMode)
                    ? storedMode
                    : (availableModes[0] || 'default')

                localStorage.setItem(MODE_STORAGE_KEY, resolvedMode)

                const activeUiPalette = paletteByMode[resolvedMode] || defaultPalette

                if (activeUiPalette?.colors) {
                    root.style.setProperty('--color-primary-light', activeUiPalette.colors.primary)
                    root.style.setProperty('--color-secondary-light', activeUiPalette.colors.secondary)
                    root.style.setProperty('--color-accent-light', activeUiPalette.colors.accent)
                    root.style.setProperty('--color-bg-light', activeUiPalette.colors.background)
                    root.style.setProperty('--color-text-light', activeUiPalette.colors.text)
                }

                if (darkPalette?.colors) {
                    root.style.setProperty('--color-primary-dark', darkPalette.colors.primary)
                    root.style.setProperty('--color-secondary-dark', darkPalette.colors.secondary)
                    root.style.setProperty('--color-accent-dark', darkPalette.colors.accent)
                    root.style.setProperty('--color-bg-dark', darkPalette.colors.background)
                    root.style.setProperty('--color-text-dark', darkPalette.colors.text)
                }

                const activeTitle = fonts.find((font) => font.is_active_title)
                const activeSubtitle = fonts.find((font) => font.is_active_subtitle)
                const activeParagraph = fonts.find((font) => font.is_active_paragraph)

                const candidateFonts = [activeTitle, activeSubtitle, activeParagraph]
                    .filter(Boolean)
                    .filter((font, index, array) => array.findIndex((otherFont) => String(otherFont.id) === String(font.id)) === index)

                await Promise.all(candidateFonts.map(async (font) => {
                    if (!font.file_url) return

                    try {
                        const face = new FontFace(font.family_name, `url(${font.file_url}) format("truetype")`)
                        await face.load()
                        document.fonts.add(face)
                    } catch {
                        // Si falla un archivo, mantenemos la fuente fallback para no romper la UI.
                    }
                }))

                root.style.setProperty('--font-title', activeTitle?.family_name || 'Rubik')
                root.style.setProperty('--font-subtitle', activeSubtitle?.family_name || 'Rubik')
                root.style.setProperty('--font-paragraph', activeParagraph?.family_name || 'Rubik')

                root.style.setProperty('--size-title', `${activeTitle?.title_size_px || 26}px`)
                root.style.setProperty('--size-subtitle', `${activeSubtitle?.subtitle_size_px || 20}px`)
                root.style.setProperty('--size-paragraph', `${activeParagraph?.paragraph_size_px || 16}px`)
            } catch {
                // Si la API no esta disponible, la app continua con los estilos base.
            }
        }

        bootstrapGlobalTheme()

        function handleThemeRefresh() {
            bootstrapGlobalTheme()
        }

        window.addEventListener('theme:refresh', handleThemeRefresh)

        return () => {
            window.removeEventListener('theme:refresh', handleThemeRefresh)
        }
    }, [])

    return (
        <BillingConfigProvider>
            <CartProvider>
                <Header />

                <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/register' element={<RegisterPage />} />
                    <Route path='/admin' element={<RequireAdmin><DashboardLayout /></RequireAdmin>}>
                        <Route path='dashboard' element={<Dashboard />} />
                        <Route path='fonts' element={<Font />} />
                        <Route path='palettes' element={<Palette />} />
                        <Route path='billing' element={<BillingConfigPage />} />
                        <Route path='create-product' element={<CreateProduct />} />
                        <Route path='create-coupon' element={<CreateCoupon />} />
                    </Route>

                    <Route element={<UserLayoutGate />}>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/products' element={<ProductsPage />} />
                        <Route path='/products/:productId' element={<ProductPage />} />

                        <Route path='/user/:id'>
                            <Route path='cart' element={<CartPage />} />
                            <Route path='billingPage' element={<BillingPage />} />
                        </Route>
                    </Route>
                </Routes>

                <Footer />
            </CartProvider>
        </BillingConfigProvider>
    )
}

export default App