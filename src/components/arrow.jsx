function Arrow({src, alt, className = '', onClick}){
    return <img className={`w-3 h-6 my-18 mx-2
            sm:h-8 sm:my-25
            md:h-10 md:my-30 md:mx-3
            lg:my-36 lg:mx-3.5
            xl:my-50 xl:mx-4
            rounded
            hover:bg-accent-light
            cursor-pointer ${className}`.trim()}
            src={src} alt={alt} onClick={onClick} />
}

export default Arrow