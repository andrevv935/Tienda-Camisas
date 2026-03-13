import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerRequest } from '../../backend/services/auth/authApiClient.js'

function RegisterPage(){
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [errorMessage, setErrorMessage] = useState('')

    function handleChange(event) {
        const { id, value } = event.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')

        try {
            await registerRequest(formData)
            navigate('/login', { replace: true })
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo registrar el usuario')
        }
    }

    return (
        <form className='my-80 mx-auto w-88.5 p-10 text-center tracking-wide rounded bg-sky-200 flex flex-col' onSubmit={handleSubmit}>
            {!!errorMessage && <p className='paragraph text-sm text-red-700'>{errorMessage}</p>}
            <input id="name" type="text" placeholder="Your name" value={formData.name} onChange={handleChange} required />
            <input id="email" type="email" placeholder="email" value={formData.email} onChange={handleChange} required />
            <input id='password' type="password" placeholder="password" value={formData.password} onChange={handleChange} required />
            <nav>Already have an account? <Link to='/login'>login here</Link></nav>
            <button className='rounded cursor-pointer border-2 bg-blue-600' type="submit">Register</button>
        </form>
    )
}

export default RegisterPage