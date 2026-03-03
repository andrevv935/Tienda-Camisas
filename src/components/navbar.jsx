import { Link } from 'react-router-dom';

function Navbar(){
    return (
        <nav className='text-right mr-4'>
            <Link className='mr-4' to='/'>Home</Link>
            <Link to='/login'>Login</Link>
        </nav>
    )
}

export default Navbar