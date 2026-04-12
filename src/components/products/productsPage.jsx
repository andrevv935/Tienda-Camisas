import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProductsRequest } from '../../backend/services/products/productApiClient.js'
import { useCart } from '../../hook/user/useCart.jsx'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const ITEMS_PER_PAGE = 15

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
		? rawProduct.selected_colors
			.map((color) => String(color).trim().toUpperCase())
			.filter(Boolean)
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
		id: rawProduct?.id,
		name: String(rawProduct?.name || 'Producto sin nombre').trim(),
		description: String(rawProduct?.description || 'Sin descripcion').trim(),
		price: safeNumber(rawProduct?.price),
		selectedColors,
		category: buildCategory(rawProduct),
		stockBySize,
		availableSizes: SIZES.filter((size) => stockBySize[size] > 0),
		imageUrl: rawProduct?.image_url || ''
	}
}

function formatMoney(value) {
	return new Intl.NumberFormat('es-VE', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	}).format(value)
}

export default function ProductsPage() {
    const { addItem } = useCart()
	const [products, setProducts] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const [searchTerm, setSearchTerm] = useState('')
	const [selectedColor, setSelectedColor] = useState('all')
	const [selectedSize, setSelectedSize] = useState('all')
	const [minPrice, setMinPrice] = useState('')
	const [maxPrice, setMaxPrice] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
    const [selectedSizesByProduct, setSelectedSizesByProduct] = useState({})
    const [cartFeedback, setCartFeedback] = useState('')

	const loadProducts = useCallback(async () => {
		setIsLoading(true)
		setErrorMessage('')

		try {
			const responseRows = await fetchProductsRequest()
			const normalized = Array.isArray(responseRows)
				? responseRows.map(normalizeProduct)
				: []
			setProducts(normalized)
		} catch (error) {
			setErrorMessage(error.message || 'No se pudieron cargar los productos.')
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		loadProducts()

		const refreshInterval = window.setInterval(() => {
			loadProducts()
		}, 15000)

		return () => {
			window.clearInterval(refreshInterval)
		}
	}, [loadProducts])

	const availableColors = useMemo(() => {
		const colors = new Set()
		products.forEach((product) => {
			product.selectedColors.forEach((color) => colors.add(color))
		})
		return Array.from(colors)
	}, [products])

	const availableCategories = useMemo(() => {
		const categories = new Set(products.map((product) => product.category))
		return Array.from(categories)
	}, [products])

	const priceLimits = useMemo(() => {
		if (products.length === 0) {
			return { min: 0, max: 0 }
		}

		let min = Number.POSITIVE_INFINITY
		let max = Number.NEGATIVE_INFINITY

		products.forEach((product) => {
			if (product.price < min) min = product.price
			if (product.price > max) max = product.price
		})

		return {
			min: min === Number.POSITIVE_INFINITY ? 0 : min,
			max: max === Number.NEGATIVE_INFINITY ? 0 : max
		}
	}, [products])

	const filteredProducts = useMemo(() => {
		const lowerSearch = searchTerm.trim().toLowerCase()
		const hasMinFilter = minPrice !== ''
		const hasMaxFilter = maxPrice !== ''
		const parsedMinPrice = safeNumber(minPrice, Number.NEGATIVE_INFINITY)
		const parsedMaxPrice = safeNumber(maxPrice, Number.POSITIVE_INFINITY)

		return products.filter((product) => {
			const matchesSearch = !lowerSearch
				|| product.name.toLowerCase().includes(lowerSearch)
				|| product.category.toLowerCase().includes(lowerSearch)

			const matchesColor = selectedColor === 'all' || product.selectedColors.includes(selectedColor)
			const matchesSize = selectedSize === 'all' || product.availableSizes.includes(selectedSize)

			const matchesMinPrice = !hasMinFilter || product.price >= parsedMinPrice
			const matchesMaxPrice = !hasMaxFilter || product.price <= parsedMaxPrice

			return matchesSearch && matchesColor && matchesSize && matchesMinPrice && matchesMaxPrice
		})
	}, [maxPrice, minPrice, products, searchTerm, selectedColor, selectedSize])

	const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))

	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm, selectedColor, selectedSize, minPrice, maxPrice])

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const pageProducts = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
		return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)
	}, [currentPage, filteredProducts])

	function resolveSelectedSize(product) {
		return selectedSizesByProduct[product.id] || product.availableSizes[0] || ''
	}

	function handleAddToCart(product) {
		const selectedSize = resolveSelectedSize(product)
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

		setCartFeedback(result.message)
	}

	return (
		<section className="px-4 py-10 md:px-8 lg:px-12">
			<div className="mx-auto w-full max-w-7xl rounded-3xl border p-6 md:p-8"
				style={{
					borderColor: 'var(--color-accent-light)',
					background: 'color-mix(in srgb, var(--color-bg-light) 88%, var(--color-primary-light))'
				}}
			>
				<header className="mb-8">
					<h1 className="title text-3xl font-bold">Catalogo de productos</h1>
					<p className="paragraph mt-2 opacity-80">
						Explora por color, precio y talla. La busqueda solo considera nombre y categoria.
					</p>
				</header>

				<div className="grid gap-4 rounded-2xl border p-4 md:grid-cols-2 lg:grid-cols-5"
					style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}
				>
					<label className="paragraph lg:col-span-2">
						Buscar por nombre o categoria
						<input
							type="search"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Ej. Oversize, Sport, Negra"
							className="mt-1 w-full"
						/>
					</label>

					<label className="paragraph">
						Talla
						<select
							className="mt-1 w-full rounded-lg border-2 p-2"
							style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}
							value={selectedSize}
							onChange={(event) => setSelectedSize(event.target.value)}
						>
							<option value="all">Todas</option>
							{SIZES.map((size) => (
								<option key={size} value={size}>{size}</option>
							))}
						</select>
					</label>

					<label className="paragraph">
						Precio minimo
						<input
							type="number"
							min={0}
							value={minPrice}
							onChange={(event) => setMinPrice(event.target.value)}
							placeholder={String(priceLimits.min)}
							className="mt-1 w-full"
						/>
					</label>

					<label className="paragraph">
						Precio maximo
						<input
							type="number"
							min={0}
							value={maxPrice}
							onChange={(event) => setMaxPrice(event.target.value)}
							placeholder={String(priceLimits.max)}
							className="mt-1 w-full"
						/>
					</label>
				</div>

				<div className="mt-4 flex flex-wrap items-center gap-2">
					<button
						type="button"
						className={`paragraph rounded-full border px-3 py-1 text-sm bg-primary-light hover:bg-accent-primary`}
						onClick={() => setSelectedColor('all')}
					>
						Todos los colores
					</button>
					{availableColors.map((color) => (
						<button
							key={color}
							type="button"
							className={`paragraph rounded-full border px-3 py-1 text-sm`}
							style={{
								borderColor: 'var(--color-accent-light)',
								backgroundColor: selectedColor === color ? 'var(--color-primary-light)' : 'var(--color-bg-light)'
							}}
							onClick={() => setSelectedColor(color)}
						>
							<span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: color }} />
							{color}
						</button>
					))}
				</div>

				<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
					<p className="paragraph text-sm opacity-80">
						{filteredProducts.length} producto(s) encontrado(s) - pagina {currentPage} de {totalPages}
					</p>
					<button type="button" className="paragraph rounded-lg border px-3 py-1.5 text-sm bg-primary-light hover:bg-accent-light"
						onClick={loadProducts}
					>
						Actualizar productos
					</button>
				</div>

				{!!cartFeedback && (
					<p className='paragraph mt-3 text-sm'>{cartFeedback}</p>
				)}

				{availableCategories.length > 0 && (
					<p className="paragraph mt-2 text-sm opacity-70">
						Categorias disponibles: {availableCategories.join(', ')}
					</p>
				)}

				{isLoading && (
					<p className="paragraph mt-6">Cargando productos...</p>
				)}

				{!isLoading && errorMessage && (
					<p className="paragraph mt-6" style={{ color: 'var(--color-accent-light)' }}>
						{errorMessage}
					</p>
				)}

				{!isLoading && !errorMessage && pageProducts.length === 0 && (
					<p className="paragraph mt-6">No hay productos que coincidan con los filtros aplicados.</p>
				)}

				{!isLoading && !errorMessage && pageProducts.length > 0 && (
					<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{pageProducts.map((product) => (
							<article
								key={product.id}
								className="flex h-full flex-col overflow-hidden rounded-2xl border"
								style={{
									borderColor: 'var(--color-accent-light)',
									backgroundColor: 'var(--color-bg-light)'
								}}
							>
								<div className="aspect-4/3 w-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-light) 80%, var(--color-primary-light))' }}>
									{product.imageUrl ? (
										<img
											src={product.imageUrl}
											alt={product.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="paragraph flex h-full w-full items-center justify-center p-4 text-center text-sm opacity-65">
											Sin imagen
										</div>
									)}
								</div>

								<div className="flex h-full flex-col p-4">
									<div className="mb-3 flex items-start justify-between gap-3">
										<h2 className="subtitle text-xl font-semibold leading-tight">{product.name}</h2>
										<span className="paragraph rounded-full px-2 py-0.5 text-xs"
											style={{ backgroundColor: 'var(--color-bg-light)' }}
										>
											{product.category}
										</span>
									</div>

									<p className="paragraph mb-4 line-clamp-3 text-sm opacity-80">{product.description}</p>

									<div className="mt-auto space-y-3">
										<div>
											<p className="paragraph mb-1 text-xs uppercase tracking-wider opacity-65">Colores</p>
											<div className="flex flex-wrap gap-2">
												{product.selectedColors.length === 0 && (
													<span className="paragraph text-sm opacity-60">Sin colores registrados</span>
												)}
												{product.selectedColors.map((color) => (
													<span
														key={`${product.id}-${color}`}
														title={color}
														className="inline-block h-5 w-5 rounded-full border"
														style={{ backgroundColor: color, borderColor: 'var(--color-accent-light)' }}
													/>
												))}
											</div>
										</div>

										<div>
											<p className="paragraph mb-1 text-xs uppercase tracking-wider opacity-65">Tallas disponibles</p>
											{product.availableSizes.length > 0 ? (
												<select
													className='paragraph w-full rounded-lg border px-2 py-1 text-sm'
													style={{ borderColor: 'var(--color-accent-light)' }}
													value={resolveSelectedSize(product)}
													onChange={(event) => setSelectedSizesByProduct((previous) => ({
														...previous,
														[product.id]: event.target.value
													}))}
												>
													{product.availableSizes.map((size) => (
														<option key={size} value={size}>{size}</option>
													))}
												</select>
											) : (
												<p className="paragraph text-sm">Sin stock</p>
											)}
										</div>

										<p className="title text-2xl font-bold">{formatMoney(product.price)}</p>

										<button
											type='button'
											className='paragraph rounded-lg border px-3 py-2 text-sm font-semibold'
											style={{ borderColor: 'var(--color-accent-light)' }}
											disabled={product.availableSizes.length === 0}
											onClick={() => handleAddToCart(product)}
										>
											Agregar al carrito
										</button>

										<Link
											to={`/products/${product.id}`}
											className='paragraph block rounded-lg border px-3 py-2 text-center text-sm font-semibold'
											style={{ borderColor: 'var(--color-accent-light)' }}
										>
											Ver detalle
										</Link>
									</div>
								</div>
							</article>
						))}
					</div>
				)}

				<nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Paginacion de productos">
					<button
						type="button"
						className="paragraph rounded-lg border px-3 py-1.5 text-sm bg-primary-light hover:bg-accent-light"
						onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
						disabled={currentPage === 1}
					>
						Anterior
					</button>

					{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
						<button
							key={pageNumber}
							type="button"
							className="paragraph rounded-lg border px-3 py-1.5 text-sm bg-primary-light hover:bg-accent-light"
							style={{
								fontWeight: currentPage === pageNumber ? 700 : 400
							}}
							onClick={() => setCurrentPage(pageNumber)}
						>
							{pageNumber}
						</button>
					))}

					<button
						type="button"
						className="paragraph rounded-lg border px-3 py-1.5 text-sm bg-primary-light hover:bg-accent-light"
						onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
						disabled={currentPage === totalPages}
					>
						Siguiente
					</button>
				</nav>
			</div>
		</section>
	)
}
