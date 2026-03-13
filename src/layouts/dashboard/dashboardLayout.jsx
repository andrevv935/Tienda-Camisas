import { Outlet } from 'react-router-dom'
import Menu from './menu.jsx'

function DashboardLayout(){
    return(
        <div className='dashboard-div'>
            <Menu />
            <Outlet />
        </div>
    )
}

export default DashboardLayout