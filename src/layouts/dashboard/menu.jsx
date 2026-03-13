import { Link } from 'react-router-dom'

export default function Menu(){
    return (
        <div className="w-full flex flex-row">
            <ul className="w-full bg-primary-light hover:cursor-pointer flex flex-row">
                <li className="subtitle p-4 hover:bg-accent-light border-b border-gray-300">
                    <Link to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light border-b border-gray-300">
                    <Link to="/admin/palettes">Paletas</Link>
                </li>
                <li className="subtitle p-4 hover:bg-accent-light border-b border-gray-300">
                    <Link to="/admin/fonts">Fonts</Link>
                </li>
            </ul>
        </div>
    )
}