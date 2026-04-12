import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCoupons } from '../../hook/useCoupons.js'
import { useCart } from '../../hook/user/useCart.jsx'
import { useBillingConfig } from '../billing/BillingConfigContext.jsx'
import PayPalSplitCheckout from '../../components/payments/PayPalSplitCheckout.jsx'

const IVA_RATE = 0.16

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VES',
        minimumFractionDigits: 2
    }).format(amount)
}

export default function BillingPage({ className = '', name = 'Consumidor final', address = 'Direccion fiscal no especificada', rifClient = 'J-98765432-1' }) {
    const { id = 'guest' } = useParams()
    const { items, clearCart } = useCart()
    const { companyData, printingData } = useBillingConfig()
    const { coupons, isLoading: couponsLoading } = useCoupons()

    const [couponCode, setCouponCode] = useState('')
    const [couponError, setCouponError] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [gatewayPaidAmount, setGatewayPaidAmount] = useState(0)

    const emissionDate = new Date()
    const formattedEmissionDate = `${String(emissionDate.getDate()).padStart(2, '0')}/${String(emissionDate.getMonth() + 1).padStart(2, '0')}/${emissionDate.getFullYear()}`
    const invoiceNumber = `FRE-${emissionDate.getFullYear()}-${String(emissionDate.getTime()).slice(-6)}`

    const billingItems = useMemo(() => (
        items.map((item) => ({
            id: item.key,
            description: `${item.name} (Talla ${item.size})`,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        }))
    ), [items])

    const subTotal = billingItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    const discountRate = appliedCoupon ? Number(appliedCoupon.discount_percentage || 0) / 100 : 0
    const discountAmount = subTotal * discountRate
    const taxableAmount = Math.max(0, subTotal - discountAmount)
    const ivaAmount = taxableAmount * IVA_RATE
    const totalAmount = taxableAmount + ivaAmount

    function applyCoupon() {
        const normalizedCode = couponCode.trim().toUpperCase()
        if (!normalizedCode) {
            setCouponError('Ingresa un codigo de cupon.')
            return
        }

        const found = coupons.find((coupon) => String(coupon.code).toUpperCase() === normalizedCode)
        if (!found) {
            setCouponError('El cupon no existe o ya expiro.')
            setAppliedCoupon(null)
            return
        }

        setAppliedCoupon(found)
        setCouponError('')
    }

    function removeCoupon() {
        setAppliedCoupon(null)
        setCouponCode('')
        setCouponError('')
    }

    const controlRangeLabel = `Desde ${printingData.rangeStart} hasta ${printingData.rangeEnd}`
    const hasItems = billingItems.length > 0

    function handlePayPalFinalize() {
        clearCart()
    }

    const panelStyle = {
        borderColor: 'var(--color-accent-light)',
        backgroundColor: 'var(--color-bg-light)',
        color: 'var(--color-text-light)'
    }

    const softPanelStyle = {
        borderColor: 'var(--color-accent-light)',
        backgroundColor: 'color-mix(in srgb, var(--color-bg-light) 84%, var(--color-primary-light))',
        color: 'var(--color-text-light)'
    }

    return (
        <section className={`print-invoice mx-auto my-8 w-[min(100%,980px)] px-4 sm:px-6 ${className}`.trim()}>
            <div className='rounded-2xl border p-5 shadow-sm sm:p-8' style={panelStyle}>
                <header className='mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between' style={{ borderColor: 'var(--color-accent-light)' }}>
                    <div>
                        <p className='text-xs font-semibold uppercase tracking-[0.22em] opacity-70'>{companyData.name}</p>
                        <h1 className='mt-2 text-2xl font-bold sm:text-3xl'>Factura de venta</h1>
                        <p className='mt-1 text-sm opacity-80'>{companyData.address}</p>
                        <p className='mt-1 text-sm opacity-80'>RIF: {companyData.rif}</p>
                    </div>

                    <div className='rounded-xl border px-4 py-3 text-sm' style={softPanelStyle}>
                        <p><span className='font-semibold'>Fecha de emision:</span> {formattedEmissionDate}</p>
                        <p><span className='font-semibold'>Hora de emision:</span> {emissionDate.toLocaleTimeString('es-VE')}</p>
                        <p><span className='font-semibold'>Nro. factura:</span> {invoiceNumber}</p>
                        <p><span className='font-semibold'>Moneda:</span> Bolivar (VES)</p>
                    </div>
                </header>

                <div className='mb-6 grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-2' style={softPanelStyle}>
                    <p><span className='font-semibold'>Cliente:</span> {name}</p>
                    <p><span className='font-semibold'>Direccion:</span> {address}</p>
                    <p><span className='font-semibold'>RIF/CI:</span> {rifClient}</p>
                </div>

                <div className='mb-6 rounded-xl border p-4' style={softPanelStyle}>
                    <p className='paragraph mb-3 text-sm font-semibold'>Aplicar cupon de descuento</p>
                    <div className='flex flex-wrap items-center gap-2'>
                        <input
                            type='text'
                            value={couponCode}
                            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                            placeholder='Ej. FREEDOM20'
                            className='paragraph rounded-lg border px-3 py-2 text-sm'
                            style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-light)' }}
                        />
                        <button type='button' className='no-print paragraph rounded-lg border px-4 py-2 text-sm font-semibold' style={{ borderColor: 'var(--color-accent-light)' }} onClick={applyCoupon}>
                            Aplicar
                        </button>
                        {appliedCoupon && (
                            <button type='button' className='no-print paragraph rounded-lg border px-4 py-2 text-sm font-semibold' style={{ borderColor: 'var(--color-accent-light)' }} onClick={removeCoupon}>
                                Quitar cupon
                            </button>
                        )}
                    </div>
                    {couponsLoading && <p className='paragraph mt-2 text-xs opacity-75'>Cargando cupones activos...</p>}
                    {!!couponError && <p className='paragraph mt-2 text-xs' style={{ color: 'var(--color-accent-light)' }}>{couponError}</p>}
                    {appliedCoupon && (
                        <p className='paragraph mt-2 text-xs'>Cupon aplicado: {appliedCoupon.code} ({appliedCoupon.discount_percentage}% OFF)</p>
                    )}
                </div>

                {!hasItems && (
                    <div className='mb-6 rounded-xl border p-4 text-sm' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'color-mix(in srgb, var(--color-primary-light) 45%, var(--color-bg-light))' }}>
                        No hay productos en el carrito para facturar.{' '}
                        <Link className='underline underline-offset-2' to={`/user/${id}/cart`}>Ir al carrito</Link>
                    </div>
                )}

                <div className='overflow-x-auto rounded-xl border' style={{ borderColor: 'var(--color-accent-light)' }}>
                    <table className='min-w-full border-collapse text-left text-sm'>
                        <thead>
                            <tr style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary-light) 45%, var(--color-bg-light))' }}>
                                <th className='px-4 py-3 font-semibold'>Descripcion</th>
                                <th className='px-4 py-3 font-semibold text-center'>Cantidad</th>
                                <th className='px-4 py-3 font-semibold text-right'>Precio unitario</th>
                                <th className='px-4 py-3 font-semibold text-right'>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingItems.map((item) => {
                                const rowSubtotal = item.quantity * item.unitPrice

                                return (
                                    <tr key={item.id} className='border-t' style={{ borderColor: 'var(--color-accent-light)' }}>
                                        <td className='px-4 py-3'>{item.description}</td>
                                        <td className='px-4 py-3 text-center'>{item.quantity}</td>
                                        <td className='px-4 py-3 text-right'>{formatCurrency(item.unitPrice)}</td>
                                        <td className='px-4 py-3 text-right font-medium'>{formatCurrency(rowSubtotal)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className='mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end'>
                    <div className='rounded-xl border p-4 text-sm' style={softPanelStyle}>
                        <p className='font-semibold'>Referencia de cumplimiento informativo (Art. 7)</p>
                        <p className='mt-1'>Se muestra el precio en moneda nacional, el desglose del IVA y el monto total a pagar para una facturacion clara y verificable.</p>
                    </div>

                    <div className='w-full rounded-xl border p-4 text-sm sm:w-80' style={softPanelStyle}>
                        <div className='flex items-center justify-between py-1'>
                            <span>Subtotal</span>
                            <span>{formatCurrency(subTotal)}</span>
                        </div>
                        <div className='flex items-center justify-between py-1'>
                            <span>Descuento</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                        <div className='flex items-center justify-between py-1'>
                            <span>IVA ({Math.round(IVA_RATE * 100)}%)</span>
                            <span>{formatCurrency(ivaAmount)}</span>
                        </div>
                        <div className='flex items-center justify-between py-1'>
                            <span>Total abonado</span>
                            <span>{formatCurrency(gatewayPaidAmount)}</span>
                        </div>
                        <div className='mt-2 border-t pt-2' style={{ borderColor: 'var(--color-accent-light)' }}>
                            <div className='flex items-center justify-between text-base font-bold'>
                                <span>Total a pagar</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <PayPalSplitCheckout
                    totalAmount={totalAmount}
                    hasItems={hasItems}
                    onPaidAmountChange={setGatewayPaidAmount}
                    onFinalize={handlePayPalFinalize}
                />

                <footer className='mt-8 flex flex-wrap justify-end gap-3 border-t pt-5' style={{ borderColor: 'var(--color-accent-light)' }}>
                    <button className='no-print paragraph rounded-lg border px-4 py-2 text-sm font-semibold' style={{ borderColor: 'var(--color-accent-light)' }} onClick={() => clearCart()}>
                        Limpiar carrito
                    </button>
                    <button className='no-print paragraph rounded-lg border px-4 py-2 text-sm font-semibold' style={{ borderColor: 'var(--color-accent-light)' }} onClick={() => window.print()} disabled={!hasItems}>
                        Imprimir
                    </button>
                    <button className='no-print paragraph rounded-lg border px-4 py-2 text-sm font-semibold' style={{ borderColor: 'var(--color-accent-light)' }} /*onClick={savePDF}*/>
                        Descargar PDF
                    </button>
                </footer>

                <section className='fiscal-imprint mt-4 rounded-lg border px-4 py-3 text-[11px] leading-5' style={softPanelStyle}>
                    <p className='font-semibold uppercase tracking-wide'>Pie de imprenta SENIAT</p>
                    <p>Impreso por: {printingData.printerName} | RIF: {printingData.printerRif}</p>
                    <p>Providencia de autorizacion SENIAT: {printingData.seniatAuth}</p>
                    <p>Rango de control fiscal: {controlRangeLabel}</p>
                    <p>Fecha de elaboracion: {printingData.elaborationDate}</p>
                </section>
            </div>
        </section>
    )
}