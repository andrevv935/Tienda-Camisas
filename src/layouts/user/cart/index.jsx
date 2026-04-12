import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../../hook/user/useCart.jsx'

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VES',
        minimumFractionDigits: 2
    }).format(amount)
}

export default function CartPage() {
    const { id = 'guest' } = useParams()
    const { items, subTotal, updateItemQuantity, removeItem, clearCart } = useCart()

    return (
        <section className='mx-auto my-8 w-[min(100%,1100px)] px-4 sm:px-6'>
            <div className='rounded-2xl border p-5 shadow-sm sm:p-8' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                <header className='mb-6 flex flex-wrap items-center justify-between gap-3'>
                    <div>
                        <h1 className='title text-3xl font-bold'>Tu carrito</h1>
                        <p className='paragraph mt-1 opacity-80'>Revisa tallas, cantidades y avanza a facturacion.</p>
                    </div>
                    {items.length > 0 && (
                        <button
                            type='button'
                            className='paragraph rounded-lg border px-4 py-2 bg-var(--color-bg-light) hover:bg-var(--color-bg-light-hover)'
                            style={{ borderColor: 'var(--color-accent-light)' }}
                            onClick={clearCart}
                        >
                            Vaciar carrito
                        </button>
                    )}
                </header>

                {items.length === 0 && (
                    <div className='rounded-xl border p-6 text-center' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                        <p className='paragraph mb-3'>Tu carrito esta vacio.</p>
                        <Link className='paragraph rounded-lg border px-4 py-2 bg-primary-light hover:bg-accent-light' style={{ borderColor: 'var(--color-accent-light)' }} to='/products'>
                            Ir a productos
                        </Link>
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        <div className='overflow-x-auto rounded-xl border' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                            <table className='min-w-full border-collapse text-left text-sm'>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                        <th className='px-4 py-3 font-semibold'>Producto</th>
                                        <th className='px-4 py-3 font-semibold'>Talla</th>
                                        <th className='px-4 py-3 font-semibold text-right'>Precio</th>
                                        <th className='px-4 py-3 font-semibold text-center'>Cantidad</th>
                                        <th className='px-4 py-3 font-semibold text-right'>Subtotal</th>
                                        <th className='px-4 py-3 font-semibold text-center'>Accion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.key} className='border-t' style={{ borderColor: 'var(--color-accent-light)' }}>
                                            <td className='px-4 py-3'>
                                                <p className='paragraph font-semibold'>{item.name}</p>
                                                <p className='paragraph text-xs opacity-70'>{item.category}</p>
                                            </td>
                                            <td className='px-4 py-3'>{item.size}</td>
                                            <td className='px-4 py-3 text-right'>{formatCurrency(item.unitPrice)}</td>
                                            <td className='px-4 py-3 text-center'>
                                                <input
                                                    type='number'
                                                    min={1}
                                                    max={item.maxStock || 999}
                                                    value={item.quantity}
                                                    onChange={(event) => updateItemQuantity(item.key, event.target.value)}
                                                    className='w-20 rounded-md border px-2 py-1 text-center'
                                                    style={{ borderColor: 'var(--color-accent-light)' }}
                                                />
                                            </td>
                                            <td className='px-4 py-3 text-right font-semibold'>{formatCurrency(item.unitPrice * item.quantity)}</td>
                                            <td className='px-4 py-3 text-center'>
                                                <button
                                                    type='button'
                                                    className='paragraph rounded-lg border px-3 py-1.5 text-sm'
                                                    style={{ borderColor: 'var(--color-accent-light)' }}
                                                    onClick={() => removeItem(item.key)}
                                                >
                                                    Quitar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                            <p className='title text-2xl font-bold'>Subtotal: {formatCurrency(subTotal)}</p>
                            <div className='flex flex-wrap gap-2'>
                                <Link className='paragraph rounded-lg border px-4 py-2' style={{ borderColor: 'var(--color-accent-light)' }} to='/products'>
                                    Seguir comprando
                                </Link>
                                <Link className='paragraph rounded-lg border px-4 py-2 font-semibold' style={{ borderColor: 'var(--color-accent-light)' }} to={`/user/${id}/billingPage`}>
                                    Ir a facturacion
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
