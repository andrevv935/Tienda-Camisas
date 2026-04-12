import { useState } from 'react'
import { useCreateProduct } from '../../hook/useCreateProduct.js'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function CreateProduct() {
    const [pendingColor, setPendingColor] = useState('#111111')
    const [selectedColors, setSelectedColors] = useState([])
    const [colorsError, setColorsError] = useState('')
    const { isSubmitting, errorMessage, successMessage, submitProduct } = useCreateProduct()

    function handleAddColor() {
        const normalized = pendingColor.toUpperCase()
        if (selectedColors.includes(normalized)) return
        setSelectedColors((prev) => [...prev, normalized])
        setColorsError('')
    }

    function handleRemoveColor(colorToRemove) {
        setSelectedColors((prev) => prev.filter((color) => color !== colorToRemove))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (selectedColors.length === 0) {
            setColorsError('Debes agregar al menos un color para el producto.')
            return
        }

        const formElement = event.currentTarget
        const formData = new FormData(formElement)
        formData.set('selectedColors', JSON.stringify(selectedColors))

        const created = await submitProduct(formData)
        if (!created) return

        formElement.reset()
        setSelectedColors([])
        setPendingColor('#111111')
        setColorsError('')
    }

    const fieldStyle = {
        borderColor: 'var(--color-accent-light)',
        backgroundColor: 'var(--color-bg-light)',
        color: 'var(--color-text-light)'
    }

    const panelStyle = {
        borderColor: 'var(--color-accent-light)',
        backgroundColor: 'var(--color-bg-light)'
    }

    return (
        <section className="max-w-5xl mx-auto p-6 rounded-xl mt-6" 
        style={{ borderColor: 'var(--color-accent-light)' }}>
            <header className="mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-accent-light)' }}>
                <h1 className="title text-3xl font-bold mb-2">Crear nuevo producto</h1>
                <p className="paragraph opacity-80">Los colores del formulario siguen la paleta activa. Los colores del producto son únicos e independientes.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!!errorMessage && (
                    <p className="paragraph text-sm" style={{ color: 'var(--color-accent-light)' }}>{errorMessage}</p>
                )}
                {!!successMessage && (
                    <p className="paragraph text-sm" style={{ color: 'var(--color-text-light)' }}>{successMessage}</p>
                )}

                <div id="productInfo" className="rounded-xl border p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-var(--color-bg-light)" style={panelStyle}>
                    <h2 className="subtitle font-bold text-xl md:col-span-2">Información general</h2>
                    <div>
                        <label htmlFor="productName" className="paragraph block text-sm font-semibold mb-1">Nombre del producto</label>
                        <input type="text" id="productName" name="productName" className="paragraph w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2" style={fieldStyle} placeholder="Ej. Camiseta de algodón" required />
                    </div>
                    <div>
                        <label htmlFor="productPrice" className="paragraph block text-sm font-semibold mb-1">Precio</label>
                        <input type="number" id="productPrice" name="productPrice" className="paragraph w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2" style={fieldStyle} placeholder="Ej. 19.99" required />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="productDescription" className="paragraph block text-sm font-semibold mb-1">Descripción del producto</label>
                        <textarea id="productDescription" name="productDescription" className="paragraph w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 min-h-24" style={fieldStyle} placeholder="Ej. Camiseta de algodón de alta calidad" />
                    </div>
                </div>

                <div id="productColors" className="rounded-xl border p-5" style={panelStyle}>
                    <h2 className="subtitle font-bold text-xl mb-3">Colores del producto</h2>
                    <label htmlFor="productColor" className="paragraph block text-sm font-semibold mb-2">Color base a agregar</label>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Colores de producto deliberadamente independientes del tema */}
                        <input
                            type="color"
                            id="productColor"
                            name="productColor"
                            value={pendingColor}
                            onChange={(event) => setPendingColor(event.target.value)}
                            className="h-10 w-10 rounded-full cursor-pointer"
                        />
                        <span className="paragraph text-sm">{pendingColor.toUpperCase()}</span>
                        <button
                            type="button"
                            onClick={handleAddColor}
                            className="paragraph px-3 py-2 rounded-md border bg-primary-light hover:bg-accent-light"
                        >
                            Agregar color
                        </button>
                    </div>

                    <p className="paragraph text-sm mt-4 mb-2">Colores seleccionados</p>
                    {!!colorsError && <p className="paragraph text-sm" style={{ color: 'var(--color-accent-light)' }}>{colorsError}</p>}
                    <div id="colorsSelected" className="flex gap-2 mt-2 flex-wrap">
                        {selectedColors.length === 0 && (
                            <span className="paragraph text-sm opacity-70">Aún no has agregado colores.</span>
                        )}
                        {selectedColors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => handleRemoveColor(color)}
                                className="h-8 w-8 rounded-full border-2 border-white shadow"
                                style={{ backgroundColor: color }}
                                title={`Quitar ${color}`}
                            />
                        ))}
                    </div>
                </div>

                <div id="productStock" className="rounded-xl border p-5" style={panelStyle}>
                    <h2 className="subtitle font-bold text-xl mb-3">Inventario por talla</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SIZES.map((size) => (
                        <div key={size}>
                            <label htmlFor={`stock${size}`} className="paragraph block text-sm font-semibold mb-1">Stock talla {size}</label>
                            <input type="number" id={`stock${size}`} name={`stock${size}`} className="paragraph w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2" style={fieldStyle} placeholder="Ej. 10" required />
                        </div>
                    ))}
                    </div>
                </div>

                <div id="productImage" className="rounded-xl border p-5" style={panelStyle}>
                    <h2 className="subtitle font-bold text-xl mb-3">Imagen del producto</h2>
                    <label htmlFor="productImageInput" className="paragraph block text-sm font-semibold mb-1">Imagen del producto</label>
                    <input type="file" id="productImageInput" name="productImageInput" className="paragraph w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2" style={fieldStyle} accept="image/*" required />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="paragraph px-5 py-2.5 rounded-md transition-colors border font-semibold bg-primary-light hover:bg-accent-light"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : 'Crear producto'}
                    </button>
                </div>
            </form>
        </section>
    )
}