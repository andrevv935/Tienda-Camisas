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
        <section className='min-h-[70vh] w-full px-4 py-10 flex items-center justify-center'>
            <div className='w-full max-w-4xl rounded-3xl bg-secondary-light/35 border border-accent-light/40 p-2 md:p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden'>
                    <div className='bg-primary-light p-8 md:p-10 flex flex-col justify-between'>
                        <div>
                            <p className='title uppercase tracking-[0.2em] opacity-70'>Nueva Cuenta</p>
                            <h1 className='subtitle font-bold text-4xl mt-3'>Crea tu perfil</h1>
                            <p className='paragraph mt-4 opacity-80'>Registra tu usuario para guardar configuraciones y personalizar tu experiencia.</p>
                        </div>
                        <p className='subtitle mt-8 opacity-70'>FREEDDOM</p>
                    </div>

                    <form className='bg-bg-light p-8 md:p-10 flex flex-col gap-4' onSubmit={handleSubmit}>
                        <p className='subtitle font-semibold text-2xl'>Registro</p>
                        {!!errorMessage && <p className='paragraph text-sm'>{errorMessage}</p>}

                        <label className='paragraph' htmlFor='name'>Nombre</label>
                        <input
                            id='name'
                            type='text'
                            placeholder='Tu nombre'
                            value={formData.name}
                            onChange={handleChange}
                            className='paragraph border-accent-light/60 bg-white/70'
                            required
                        />

                        <label className='paragraph' htmlFor='email'>Correo</label>
                        <input
                            id='email'
                            type='email'
                            placeholder='correo@ejemplo.com'
                            value={formData.email}
                            onChange={handleChange}
                            className='paragraph border-accent-light/60 bg-white/70'
                            required
                        />

                        <label className='paragraph' htmlFor='password'>Contraseña</label>
                        <input
                            id='password'
                            type='password'
                            placeholder='********'
                            value={formData.password}
                            onChange={handleChange}
                            className='paragraph border-accent-light/60 bg-white/70'
                            required
                        />

                        <button className='paragraph mt-2 rounded-lg border border-accent-light font-semibold' type='submit'>Crear cuenta</button>
                        <nav className='paragraph text-sm mt-2'>Ya tienes cuenta? <Link className='underline underline-offset-2 hover:opacity-80' to='/login'>Inicia sesion aqui</Link></nav>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default RegisterPage