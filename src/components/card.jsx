import React from 'react'

const Card = ({title, description, img}) => {
  return (
    <div className="rounded-2xl flex flex-col w-80 shadow-lg/50 relative">
        <img className='size-80 mx-auto rounded-t-2xl' src={img} alt="franela" />
        <button className="absolute right-0 m-1 place-content-center bg-black/30 rounded-full h-8 w-8 hover:bg-white/10 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#fff" className="size-5 mx-auto hover:fill-white">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
</svg></button>
        <div className="flex flex-col place-content-between bg-[#cbcbcb] h-full rounded-2xl -mt-4 p-3">
            <div>
              <h2 className="font-medium text-xl">{title}</h2>
              <p className=" mt-4">{description}</p>
            </div>
            <div className="flex place-content-between mt-8 gap-2 p-1">
              <div className=" w-1/3">
                <p className="text-xs opacity-70">PRICE</p>
                <p className="font-medium text-lg">$69.99</p>
              </div>
              <button className="bg-accent-light w-[60%] hover:bg-secondary-light rounded-lg cursor-pointer transition-all">Add to cart</button>
            </div>
        </div>
    </div>
  )
}

export default Card