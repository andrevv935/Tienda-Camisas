import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login/index.jsx'
import RegisterPage from './pages/register/index.jsx';
import AdminPage from './pages/admin/index.jsx'
import HomePage from './pages/home/index.jsx'
import Header from './layouts/header/header.jsx'
import Footer from './components/footer.jsx'

function App(){
    return (
        <>
            <Header />

            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/admin' element={<AdminPage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
            </Routes>

            <Footer />
        </>
    )
}

export default App