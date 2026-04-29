function Text({txt, className=''}){
    return <span className={`paragraph mb-40 w-40 h-16 text-center flex items-center justify-center ${className}`.trim()}>{txt}</span>
}

export default Text