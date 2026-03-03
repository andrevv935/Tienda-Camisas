import { Link } from 'react-router-dom'

function LoginPage(){
    return (
        <form className='my-80 mx-auto max-w-1/2 p-10 text-center tracking-wide rounded bg-sky-200 flex flex-col'>
            <input id='email' type="email" placeholder="email" required />
            <input id='password' type="password" placeholder="password" required />
            <nav>Don't have an account? <Link to='/register'>register here</Link></nav>
            <button className='rounded cursor-pointer border-2 bg-blue-600' type="submit">Login</button>
        </form>
    )
}

export default LoginPage