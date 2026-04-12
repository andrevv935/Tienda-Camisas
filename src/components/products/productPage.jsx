import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { fetchProductsRequest } from '../../backend/services/products/productApiClient.js'
import { useCart } from '../../hook/user/useCart.jsx'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function safeNumber(value, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function buildCategory(rawProduct) {
    const fromDb = rawProduct?.category || rawProduct?.product_category || rawProduct?.type
    if (typeof fromDb === 'string' && fromDb.trim()) {
        return fromDb.trim()
    }

    const lowerName = String(rawProduct?.name || '').toLowerCase()
    if (lowerName.includes('oversize')) return 'Oversize'
    if (lowerName.includes('premium')) return 'Premium'
    if (lowerName.includes('sport')) return 'Sport'
    return 'General'
}

function normalizeProduct(rawProduct) {
    const selectedColors = Array.isArray(rawProduct?.selected_colors)
        ? rawProduct.selected_colors.map((color) => String(color).trim().toUpperCase()).filter(Boolean)
        : []

    const stockBySize = {
        XS: safeNumber(rawProduct?.stock_xs),
        S: safeNumber(rawProduct?.stock_s),
        M: safeNumber(rawProduct?.stock_m),
        L: safeNumber(rawProduct?.stock_l),
        XL: safeNumber(rawProduct?.stock_xl),
        XXL: safeNumber(rawProduct?.stock_xxl)
    }

    return {
        id: Number(rawProduct?.id),
        name: String(rawProduct?.name || 'Producto sin nombre').trim(),
        description: String(rawProduct?.description || 'Sin descripcion').trim(),
        price: safeNumber(rawProduct?.price),
        imageUrl: rawProduct?.image_url || '',
        selectedColors,
        category: buildCategory(rawProduct),
        stockBySize,
        availableSizes: ALL_SIZES.filter((size) => stockBySize[size] > 0)
    }
}

function formatMoney(value) {
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value)
}

export default function ProductPage() {
    const { productId } = useParams()
    const { addItem } = useCart()

    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [feedback, setFeedback] = useState('')

    useEffect(() => {
        async function loadProducts() {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const rows = await fetchProductsRequest()
                const normalized = Array.isArray(rows) ? rows.map(normalizeProduct) : []
                setProducts(normalized)
            } catch (error) {
                setErrorMessage(error.message || 'No se pudo cargar el producto.')
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [productId])

    const product = useMemo(() => {
        const numericId = Number(productId)
        return products.find((item) => item.id === numericId) || null
    }, [productId, products])

    useEffect(() => {
        if (!product) return

        setSelectedSize(product.availableSizes[0] || '')
        setSelectedColor(product.selectedColors[0] || '')
        setFeedback('')
    }, [product])

    function handleAddToCart() {
        if (!product) return

        const maxStock = product.stockBySize[selectedSize] || 0
        const result = addItem({
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            category: product.category,
            size: selectedSize,
            unitPrice: product.price,
            maxStock
        })

        setFeedback(result.message)
    }

    if (isLoading) {
        return <p className='paragraph px-6 py-10'>Cargando producto...</p>
    }

    if (errorMessage) {
        return <p className='paragraph px-6 py-10' style={{ color: 'var(--color-accent-light)' }}>{errorMessage}</p>
    }

    if (!product) {
        return (
            <section className='px-4 py-10'>
                <div className='mx-auto max-w-3xl rounded-2xl border p-6' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                    <p className='paragraph mb-4'>Producto no encontrado.</p>
                    <Link to='/products' className='paragraph rounded-lg border px-4 py-2' style={{ borderColor: 'var(--color-accent-light)' }}>
                        Volver al catalogo
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section className='px-4 py-8 md:px-8'>
            <div className='mx-auto max-w-6xl rounded-3xl border p-4 md:p-8' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'color-mix(in srgb, var(--color-bg-light) 88%, var(--color-primary-light))' }}>
                <div className='mb-4'>
                    <Link to='/products' className='paragraph rounded-lg border px-3 py-2 text-sm' style={{ borderColor: 'var(--color-accent-light)' }}>
                        Volver al catalogo
                    </Link>
                </div>

                <div className='grid gap-6 md:grid-cols-2'>
                    <div className='rounded-2xl border p-4' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                        <div className='aspect-square w-full overflow-hidden rounded-xl' style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-light) 78%, var(--color-primary-light))' }}>
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className='h-full w-full object-cover' />
                            ) : (
                                <div className='paragraph flex h-full w-full items-center justify-center p-4 text-center'>Sin imagen disponible</div>
                            )}
                        </div>
                    </div>

                    <div className='rounded-2xl border p-5' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                        <span className='paragraph rounded-full px-3 py-1 text-xs' style={{ backgroundColor: 'var(--color-primary-light)' }}>
                            {product.category}
                        </span>
                        <h1 className='title mt-3 text-3xl font-bold'>{product.name}</h1>
                        <p className='paragraph mt-3 opacity-85'>{product.description}</p>

                        <div className='mt-6'>
                            <p className='paragraph mb-2 text-sm font-semibold'>Colores disponibles</p>
                            <div className='flex flex-wrap gap-2'>
                                {product.selectedColors.length === 0 && <span className='paragraph text-sm opacity-70'>Sin colores registrados</span>}
                                {product.selectedColors.map((color) => (
                                    <button
                                        key={color}
                                        type='button'
                                        onClick={() => setSelectedColor(color)}
                                        className='h-8 w-8 rounded-full border-2'
                                        style={{
                                            backgroundColor: color,
                                            borderColor: selectedColor === color ? 'var(--color-accent-light)' : 'var(--color-bg-light)'
                                        }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className='mt-6'>
                            <p className='paragraph mb-2 text-sm font-semibold'>Talla</p>
                            <div className='flex flex-wrap gap-2'>
                                {ALL_SIZES.map((size) => {
                                    const hasStock = product.stockBySize[size] > 0

                                    return (
                                        <button
                                            key={size}
                                            type='button'
                                            className='paragraph min-w-12 rounded-lg border px-3 py-2 text-sm'
                                            style={{
                                                borderColor: 'var(--color-accent-light)',
                                                backgroundColor: selectedSize === size ? 'var(--color-primary-light)' : 'var(--color-bg-light)',
                                                opacity: hasStock ? 1 : 0.45
                                            }}
                                            onClick={() => hasStock && setSelectedSize(size)}
                                            disabled={!hasStock}
                                        >
                                            {size}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className='mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-4' style={{ borderColor: 'var(--color-accent-light)' }}>
                            <p className='title text-3xl font-bold'>{formatMoney(product.price)}</p>
                            <button
                                type='button'
                                className='paragraph flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold'
                                style={{ borderColor: 'var(--color-accent-light)' }}
                                onClick={handleAddToCart}
                                disabled={!selectedSize}
                            >
                                <ShoppingBag className='h-4 w-4' />
                                Agregar al carrito
                            </button>
                        </div>

                        {!!feedback && <p className='paragraph mt-3 text-sm'>{feedback}</p>}
                    </div>
                </div>
            </div>
        </section>
    )
}