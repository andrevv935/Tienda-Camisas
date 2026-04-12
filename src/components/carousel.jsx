import { useEffect, useState } from 'react'
import CardContainer from './products/cardContainers'
import Arrow from './arrow'
import { products } from '../assets/mockData/products.js'

import LeftArrow from '../assets/left-arrow.png'
import RightArrow from '../assets/right-arrow.png'

function CarouselProducts(){
    const [itemsToShow, setItemsToShow] = useState(showItems())
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const handleResize = () => {
            const nextItemsToShow = showItems()

            setItemsToShow(nextItemsToShow)
            setCurrentIndex((previousIndex) => {
                if (previousIndex >= products.length) {
                    return 0
                }

                return previousIndex - (previousIndex % nextItemsToShow)
            })
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const visibleProducts = getVisibleProducts(products, currentIndex, itemsToShow)

    return (
        <>
            <div className="products flex items-center justify-center gap-3">
                <Arrow
                    className="left-arrow"
                    src={LeftArrow}
                    alt="Left arrow"
                    onClick={() => {
                        setCurrentIndex((previousIndex) =>
                            changeItems('left', previousIndex, itemsToShow, products.length)
                        )
                    }}
                />
                <div className="carousel w-full overflow-hidden">
                    <CardContainer items={visibleProducts} className="flex-nowrap justify-center gap-6" />
                </div>
                <Arrow
                    className="right-arrow"
                    src={RightArrow}
                    alt="Right arrow"
                    onClick={() => {
                        setCurrentIndex((previousIndex) =>
                            changeItems('right', previousIndex, itemsToShow, products.length)
                        )
                    }}
                />
            </div>
        </>
    )
}

// Esta función se encarga de mostrar los items del carrusel dependiendo del tamaño de la pantalla
function showItems(){
    const screenWidth = window.innerWidth;
    let itemsToShow = 1;

    if (screenWidth >= 1024) {
        itemsToShow = 3;
    } else if (screenWidth >= 768) {
        itemsToShow = 2; 
    }
    return itemsToShow;
}

// Esta funcion se encarga de que cuando se haga click en las flechas, se muestren los siguientes items del carrusel
// Si se hace click en la flecha derecha, se muestran los siguientes items, y si se hace click en la flecha izquierda, se muestran los anteriores items
function changeItems(direction, currentIndex, itemsToShow, totalProducts){
    if (totalProducts <= itemsToShow) {
        return 0;
    }

    const nextIndex = direction === 'left'
        ? currentIndex - itemsToShow
        : currentIndex + itemsToShow;

    if (nextIndex < 0) {
        return Math.max(totalProducts - itemsToShow, 0);
    }

    if (nextIndex >= totalProducts) {
        return 0;
    }

    return nextIndex;
}

function getVisibleProducts(productList, startIndex, amount){
    if (productList.length === 0) {
        return [];
    }

    const visibleProducts = [];

    for (let offset = 0; offset < amount; offset += 1) {
        const product = productList[(startIndex + offset) % productList.length];

        if (!product) {
            break;
        }

        visibleProducts.push(product);
    }

    return visibleProducts;
}

export default CarouselProducts;