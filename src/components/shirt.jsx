import { Link } from 'react-router-dom'

function ShirtView({src, alt, className=''}) {
    return (
        // <Link to='/product/:id'>
        <img className={`h-30 w-30 m-8 
            sm:h-40 sm:w-40 sm:m-10
            md:h-50 md:w-54 md:m-12 
            lg:h-60 lg:w-70 lg:m-14
            xl:h-80 xl:w-84 xl:m-16 ${className}`}
            src={src} alt={alt} />
        // </Link>
    )
}

export default ShirtView