import { useEffect, useState, useRef } from 'react'
import CardContainer from './products/cardContainers'
import Arrow from './arrow'
import { fetchProductsRequest } from '../backend/services/products/productApiClient.js'

import LeftArrow from '../assets/left-arrow.png'
import RightArrow from '../assets/right-arrow.png'

function safeNumber(value, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeProduct(rawProduct) {
    return {
        ...rawProduct,
        id: rawProduct?.id,
        name: String(rawProduct?.name || 'Producto sin nombre').trim(),
        description: String(rawProduct?.description || 'Sin descripcion').trim(),
        price: safeNumber(rawProduct?.price),
        imageUrl: rawProduct?.image_url || ''
    }
}

function CarouselProducts() {
    const [itemsToShow, setItemsToShow] = useState(showItems())
    const [currentIndex, setCurrentIndex] = useState(0)
    const [fetchedProducts, setFetchedProducts] = useState([])
    const productsLengthRef = useRef(0)

    useEffect(() => {
        async function load() {
            try {
                const rows = await fetchProductsRequest()
                const normalized = Array.isArray(rows) ? rows.map(normalizeProduct) : []
                setFetchedProducts(normalized)
                productsLengthRef.current = normalized.length
            } catch (e) {
                console.error(e)
            }
        }
        load()
    }, [])

    useEffect(() => {
        const handleResize = () => {
            const nextItemsToShow = showItems()

            setItemsToShow(nextItemsToShow)
            setCurrentIndex((previousIndex) => {
                if (previousIndex >= productsLengthRef.current) {
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

    const visibleProducts = getVisibleProducts(fetchedProducts, currentIndex, itemsToShow)

    return (
        <>
            <div className="products flex items-center justify-center gap-3">
                <Arrow
                    className="left-arrow"
                    src={LeftArrow}
                    alt="Left arrow"
                    onClick={() => {
                        setCurrentIndex((previousIndex) =>
                            changeItems('left', previousIndex, itemsToShow, fetchedProducts.length)
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
                            changeItems('right', previousIndex, itemsToShow, fetchedProducts.length)
                        )
                    }}
                />
            </div>
        </>
    )
}

function showItems() {
    const screenWidth = window.innerWidth;
    let itemsToShow = 1;

    if (screenWidth >= 1024) {
        itemsToShow = 3;
    } else if (screenWidth >= 768) {
        itemsToShow = 2;
    }
    return itemsToShow;
}

function changeItems(direction, currentIndex, itemsToShow, totalProducts) {
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

function getVisibleProducts(productList, startIndex, amount) {
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