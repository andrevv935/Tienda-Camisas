import { Link } from 'react-router-dom'
import ProductCard from '../layouts/product-card'
import Arrow from '../components/arrow'

import LeftArrow from '../assets/left-arrow.png'
import RightArrow from '../assets/right-arrow.png'

function CarouselProducts(){
    return (
        <>
        <div className="products flex flex-row">
            <Arrow src={LeftArrow} alt='Left arrow' />
            <Link className='carousel flex flex-row' to='/product/:id'>
                <ProductCard />
            </Link>
            <Arrow src={RightArrow} alt='Right arrow' />
        </div>
        </>
    )
}

export default CarouselProducts;