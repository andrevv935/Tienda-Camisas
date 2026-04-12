import { Link } from 'react-router-dom';

import Carousel from '../../components/carousel.jsx';
import About from '../../components/about.jsx'
import Hero from '../../components/hero.jsx'

function HomePage(){
    return (
        <>
            <Hero />
            <Carousel />
            <span className="paragraph block text-center text-sm text-var(--color-text-light) mt-8">
                <Link to="/products" className="p-4 rounded bg-primary-light hover:bg-accent-light hover:underline">ver mas productos</Link>
            </span>
            <About />
        </>
    )
}

export default HomePage