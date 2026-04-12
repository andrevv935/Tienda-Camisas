import { useState } from 'react'
import { useCoupons } from '../../hook/useCoupons.js'
import { table } from 'framer-motion/client'

function formatDateISO(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default function CreateCoupon() {
    const minimumDays = 3
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    const minimumAvailableDate = new Date(currentDate)
    minimumAvailableDate.setDate(minimumAvailableDate.getDate() + minimumDays)
    const minDateValue = formatDateISO(minimumAvailableDate)

    const [editingCouponId, setEditingCouponId] = useState(null)
    const [editingDiscount, setEditingDiscount] = useState('')
    const [formData, setFormData] = useState({
        couponCode: '',
        couponExpiresAt: minDateValue,
        couponExpiresTime: '23:59',
        couponDiscount: ''
    })

    const {
        coupons,
        isLoading,
        isSubmitting,
        isUpdatingCouponId,
        loadErrorMessage,
        actionErrorMessage,
        successMessage,
        createCoupon,
        updateCouponDiscount
    } = useCoupons()

    function toIntegerDiscount(value) {
        const numeric = Number(value)
        if (!Number.isFinite(numeric)) return 0

        return Math.trunc(numeric)
    }

    function handleChange(event) {
        const { id, value } = event.target

        if (id === 'couponDiscount') {
            const onlyDigits = value.replace(/\D/g, '')
            setFormData((prev) => ({
                ...prev,
                [id]: onlyDigits
            }))
            return
        }

        setFormData((prev) => ({
            ...prev,
            [id]: value
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()

        const created = await createCoupon({
            couponCode: formData.couponCode,
            couponExpiresAt: formData.couponExpiresAt,
            couponExpiresTime: formData.couponExpiresTime,
            couponDiscount: toIntegerDiscount(formData.couponDiscount)
        })

        if (!created) return

        setFormData({
            couponCode: '',
            couponExpiresAt: minDateValue,
            couponExpiresTime: '23:59',
            couponDiscount: ''
        })
    }

    function startEdit(coupon) {
        setEditingCouponId(coupon.id)
        setEditingDiscount(String(toIntegerDiscount(coupon.discount_percentage)))
    }

    function cancelEdit() {
        setEditingCouponId(null)
        setEditingDiscount('')
    }

    async function saveDiscount(couponId) {
        const numericDiscount = toIntegerDiscount(editingDiscount)
        if (!Number.isInteger(numericDiscount) || numericDiscount <= 0 || numericDiscount > 100) return

        const updated = await updateCouponDiscount(couponId, numericDiscount)
        if (!updated) return

        cancelEdit()
    }

    const cardStyle = {
        borderColor: 'var(--color-accent-light)',
        backgroundColor: 'var(--color-bg-light)',
        color: 'var(--color-text-light)'
    }

    const tableStyle = {
        borderColor: 'var(--color-accent-light)',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-text-light)'
    }

    const fieldStyle = {
        borderColor: 'var(--color-accent-light)',
        backgroundColor: 'var(--color-bg-light)',
        color: 'var(--color-text-light)'
    }

    return (
        <section className="mt-6 mb-10 mx-6">
            <header className='mb-5'>
                <h1 className="title">Gestionar cupones</h1>
                <p className='paragraph opacity-80'>Crea cupones con fecha y hora de expiración, y administra sus descuentos.</p>
            </header>
            <div className='w-full flex flex-col gap-6 xl:flex-row'>
                <div id='createCoupon' className="rounded-xl p-5 w-full" style={cardStyle}>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <h2 className='subtitle'>Crear cupon</h2>
                        <span className="paragraph block">Crear cupon de descuento para la tienda</span>

                        {!!actionErrorMessage && <p className='paragraph mt-2'>{actionErrorMessage}</p>}
                        {!!successMessage && <p className='paragraph mt-2'>{successMessage}</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className='md:col-span-2'>
                                <label htmlFor="couponCode" className="paragraph block mb-1">Codigo del cupon</label>
                                <input
                                    type="text"
                                    id='couponCode'
                                    className="paragraph w-full border rounded-md px-3 py-2"
                                    style={fieldStyle}
                                    value={formData.couponCode}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="couponExpiresAt" className="paragraph block mb-1">Fecha de expiracion</label>
                                <input
                                    type="date"
                                    id="couponExpiresAt"
                                    className="paragraph w-full border rounded-md px-3 py-2"
                                    style={fieldStyle}
                                    value={formData.couponExpiresAt}
                                    min={minDateValue}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="couponExpiresTime" className="paragraph block mb-1">Hora de expiracion</label>
                                <input
                                    type="time"
                                    id="couponExpiresTime"
                                    className="paragraph w-full border rounded-md px-3 py-2"
                                    style={fieldStyle}
                                    value={formData.couponExpiresTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className='md:col-span-2'>
                                <label htmlFor="couponDiscount" className="paragraph block mb-1">Porcentaje del descuento</label>
                                <input
                                    type="number"
                                    id="couponDiscount"
                                    className="paragraph w-full border rounded-md px-3 py-2"
                                    style={fieldStyle}
                                    min={1}
                                    max={100}
                                    step="1"
                                    value={formData.couponDiscount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="paragraph px-4 py-2 rounded-md border"
                            style={{ borderColor: 'var(--color-accent-light)' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : 'Crear Cupon'}
                        </button>
                    </form>
                </div>

                <div id='coupons' className="rounded-xl p-5 w-full xl:w-1/2" style={tableStyle}>
                    <h2 className='subtitle'>Cupones activos</h2>
                    {isLoading && <p className='paragraph'>Cargando cupones...</p>}
                    {!isLoading && !!loadErrorMessage && <p className='paragraph'>{loadErrorMessage}</p>}
                    {!isLoading && !loadErrorMessage && coupons.length === 0 && <p className='paragraph'>No existen cupones en el sistema</p>}

                    {!isLoading && !loadErrorMessage && coupons.length > 0 && (
                        <div className='table-div overflow-x-auto mt-4 rounded-md border border-accent-light bg-bg-light'>
                            <table className='w-full text-left' style={{ minWidth: '760px' }}>
                                <thead>
                                    <tr>
                                        <th className='subtitle font-normal py-2 px-3 border-accent-light bg-primary-light whitespace-nowrap'>Codigo</th>
                                        <th className='subtitle font-normal py-2 px-3 border-accent-light bg-primary-light whitespace-nowrap'>Descuento</th>
                                        <th className='subtitle font-normal py-2 px-3 border-accent-light bg-primary-light whitespace-nowrap'>Dias restantes</th>
                                        <th className='subtitle font-normal py-2 px-3 border-accent-light bg-primary-light whitespace-nowrap'>Expira</th>
                                        <th className='subtitle font-normal py-2 px-3 border-accent-light bg-primary-light whitespace-nowrap'>Estado</th>
                                        <th className='subtitle font-normal py-2 px-3 border-accent-light bg-primary-light whitespace-nowrap'>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-accent-light bg-secondary-light'>
                                    {coupons.map((coupon, index) => (
                                        <tr key={coupon.id} className={index % 2 === 0 ? 'bg-secondary-light' : 'bg-bg-light'}>
                                            <td className='paragraph py-2 px-3 whitespace-nowrap'>{coupon.code}</td>
                                            <td className='paragraph py-2 px-3'>
                                                {editingCouponId === coupon.id ? (
                                                    <input
                                                        type='number'
                                                        className='paragraph border rounded px-2 py-1 w-28'
                                                        style={fieldStyle}
                                                        min={1}
                                                        max={100}
                                                        step='1'
                                                        value={editingDiscount}
                                                        onChange={(event) => setEditingDiscount(event.target.value.replace(/\D/g, ''))}
                                                    />
                                                ) : (
                                                    `${toIntegerDiscount(coupon.discount_percentage)}%`
                                                )}
                                            </td>
                                            <td className='paragraph py-2 px-3 whitespace-nowrap'>{coupon.days_left}</td>
                                            <td className='paragraph py-2 px-3 whitespace-nowrap'>{new Date(coupon.expires_at).toLocaleString()}</td>
                                            <td className='paragraph py-2 px-3 whitespace-nowrap'>{coupon.status}</td>
                                            <td className='py-2 px-3'>
                                                {editingCouponId === coupon.id ? (
                                                    <div className='flex items-center gap-2'>
                                                        <button
                                                            type='button'
                                                            className='paragraph rounded px-3 py-1'
                                                            disabled={isUpdatingCouponId === coupon.id}
                                                            onClick={() => saveDiscount(coupon.id)}
                                                        >
                                                            {isUpdatingCouponId === coupon.id ? 'Guardando...' : 'Guardar'}
                                                        </button>
                                                        <button
                                                            type='button'
                                                            className='paragraph rounded px-3 py-1'
                                                            onClick={cancelEdit}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type='button'
                                                        className='paragraph rounded px-3 py-1 whitespace-nowrap'
                                                        onClick={() => startEdit(coupon)}
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}