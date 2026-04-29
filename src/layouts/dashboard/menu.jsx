import { Link } from 'react-router-dom'

export default function Menu() {
    return (
        <div className="w-full flex flex-col md:flex-row flex-wrap">
            <ul className="w-full bg-primary-light flex flex-col md:flex-row flex-wrap lg:justify-start">
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer border-b border-gray-300">
                    <Link to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer border-b border-gray-300">
                    <Link to="/admin/palettes">Paletas</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer border-b border-gray-300">
                    <Link to="/admin/fonts">Fonts</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer border-b border-gray-300">
                    <Link to="/admin/billing">Billing</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer border-b border-gray-300">
                    <Link to="/admin/loading-screen">Loading Screen</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer border-b border-gray-300">
                    <Link to="/admin/create-product">Create Product</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light hover:cursor-pointer border-b border-gray-300">
                    <Link to="/admin/create-coupon">Create Coupon</Link>
                </li>
            </ul>
        </div>
    )
}