import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CART_STORAGE_KEY = 'freeddom-cart-items'
const CartContext = createContext(null)

function readStoredCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY)
        if (!raw) return []

        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function buildKey(productId, size) {
    return `${productId}-${size}`
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => readStoredCart())

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }, [items])

    const totalItems = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    )

    const subTotal = useMemo(
        () => items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
        [items]
    )

    function addItem(payload, quantity = 1) {
        const safeQuantity = Math.max(1, Number(quantity) || 1)
        const maxStock = Math.max(0, Number(payload.maxStock) || 0)

        if (!payload.size || maxStock <= 0) {
            return { ok: false, message: 'No hay stock disponible para esta talla.' }
        }

        let result = { ok: true, message: 'Producto agregado al carrito.' }

        setItems((previousItems) => {
            const key = buildKey(payload.productId, payload.size)
            const existing = previousItems.find((item) => item.key === key)

            if (!existing) {
                const quantityToSave = Math.min(safeQuantity, maxStock)
                if (quantityToSave <= 0) {
                    result = { ok: false, message: 'No hay stock disponible para esta talla.' }
                    return previousItems
                }

                return [
                    ...previousItems,
                    {
                        key,
                        productId: payload.productId,
                        name: payload.name,
                        imageUrl: payload.imageUrl || '',
                        category: payload.category || 'General',
                        size: payload.size,
                        unitPrice: Number(payload.unitPrice) || 0,
                        quantity: quantityToSave,
                        maxStock
                    }
                ]
            }

            const nextQuantity = Math.min(existing.quantity + safeQuantity, maxStock)
            if (nextQuantity === existing.quantity) {
                result = { ok: false, message: 'Alcanzaste el stock maximo para este producto y talla.' }
                return previousItems
            }

            return previousItems.map((item) => (
                item.key === key
                    ? { ...item, quantity: nextQuantity, maxStock }
                    : item
            ))
        })

        return result
    }

    function updateItemQuantity(itemKey, nextQuantity) {
        const quantity = Math.max(0, Number(nextQuantity) || 0)

        setItems((previousItems) => {
            const found = previousItems.find((item) => item.key === itemKey)
            if (!found) return previousItems

            if (quantity <= 0) {
                return previousItems.filter((item) => item.key !== itemKey)
            }

            const safeQuantity = Math.min(quantity, found.maxStock || quantity)
            return previousItems.map((item) => (
                item.key === itemKey
                    ? { ...item, quantity: safeQuantity }
                    : item
            ))
        })
    }

    function removeItem(itemKey) {
        setItems((previousItems) => previousItems.filter((item) => item.key !== itemKey))
    }

    function clearCart() {
        setItems([])
    }

    const value = {
        items,
        totalItems,
        subTotal,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider')
    }

    return context
}
