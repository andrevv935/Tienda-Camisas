import { Outlet } from "react-router-dom"
import Menu from "./menu.jsx"

export default function UserLayout(){
    return (
        <>
            <Menu />
            <Outlet />
        </>
    )
}