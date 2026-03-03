import { Link } from 'react-router-dom'

function RegisterPage(){
    return (
        <form className='my-80 mx-auto max-w-1/2 p-10 text-center tracking-wide rounded bg-sky-200 flex flex-col'>
            <input id="name" type="text" placeholder="Your name" required />
            <input id="email" type="email" placeholder="email" required />
            <input id='password' type="password" placeholder="password" required />
            <nav>Already have an account? <Link to='/login'>login here</Link></nav>
            <button className='rounded cursor-pointer border-2 bg-blue-600' type="submit">Register</button>
        </form>
    )
}

export default RegisterPage