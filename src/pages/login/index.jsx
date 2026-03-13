import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRequest, setCurrentUser } from '../../backend/services/auth/authApiClient.js'

function LoginPage(){
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [errorMessage, setErrorMessage] = useState('')

    function handleChange(event) {
        const { id, value } = event.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')

        try {
            const user = await loginRequest(formData)
            setCurrentUser(user)

            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true })
            } else {
                navigate('/', { replace: true })
            }
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo iniciar sesion')
        }
    }

    return (
        <form className='my-80 mx-auto w-88.5 p-10 text-center tracking-wide rounded bg-sky-200 flex flex-col' onSubmit={handleSubmit}>
            {!!errorMessage && <p className='paragraph text-sm text-red-700'>{errorMessage}</p>}
            <input id='email' type="email" placeholder="email" value={formData.email} onChange={handleChange} required />
            <input id='password' type="password" placeholder="password" value={formData.password} onChange={handleChange} required />
            <nav>Don't have an account? <Link to='/register'>register here</Link></nav>
            <button className='rounded cursor-pointer border-2 bg-blue-600' type="submit">Login</button>
        </form>
    )
}

export default LoginPage