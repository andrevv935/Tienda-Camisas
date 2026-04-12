import { Link, useParams } from 'react-router-dom'
import { getCurrentUser } from '../../backend/services/auth/authApiClient.js'

export default function UserMenu(){
    const { id } = useParams()
    const currentUser = getCurrentUser()
    const userId = id || currentUser?.id || 'guest'
    const choiceStyle = {
        backgroundColor: 'bg-primary-light',
        ':hover': {
            backgroundColor: 'bg-accent-light',
            cursor: 'pointer'
        }
    }

    return (
        <div className="user-menu w-full flex flex-row">
            <ul className="w-full bg-primary-light flex flex-row">
                <li className='subtitle p-4 hover:bg-accent-light hover:cursor-pointer'>
                    <Link to={'/'}>Home</Link>
                </li>
                <li className='subtitle p-4 hover:bg-accent-light hover:cursor-pointer'>
                    <Link to={'/products'}>Productos</Link>
                </li>
                {/*<li className="subtitle p-4 hover:bg-accent-light border-b border-gray-300">
                    <Link to={`/user/${userId}/profile`}>Perfil</Link>
                </li>*/}
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer">
                    <Link to={`/user/${userId}/cart`}>Carrito</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer">
                    <Link to={`/user/${userId}/billingPage`}>Billing</Link>
                </li>
            </ul>
        </div>
    )
}