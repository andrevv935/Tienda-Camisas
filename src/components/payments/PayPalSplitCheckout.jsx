import { useEffect, useMemo, useState } from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

const SANDBOX_ACCOUNT_OPTIONS = [
    { id: 'sandbox-a', label: 'Cuenta Sandbox A' },
    { id: 'sandbox-b', label: 'Cuenta Sandbox B' },
    { id: 'sandbox-c', label: 'Cuenta Sandbox C' }
]

function parseAmount(value) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return 0
    return Math.max(0, parsed)
}

function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

export default function PayPalSplitCheckout({
    totalAmount,
    hasItems,
    onPaidAmountChange,
    onFinalize
}) {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb'

    const [rows, setRows] = useState([
        { id: 1, accountId: 'sandbox-a', amount: '', paid: false, captureId: '', payerEmail: '' },
        { id: 2, accountId: 'sandbox-b', amount: '', paid: false, captureId: '', payerEmail: '' }
    ])
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const paidAmount = useMemo(
        () => roundMoney(rows.reduce((sum, row) => sum + (row.paid ? parseAmount(row.amount) : 0), 0)),
        [rows]
    )

    useEffect(() => {
        onPaidAmountChange?.(paidAmount)
    }, [onPaidAmountChange, paidAmount])

    const remaining = roundMoney(totalAmount - paidAmount)

    function addRow() {
        const nextId = rows.length === 0
            ? 1
            : Math.max(...rows.map((row) => row.id)) + 1

        setRows((previous) => ([
            ...previous,
            { id: nextId, accountId: 'sandbox-c', amount: '', paid: false, captureId: '', payerEmail: '' }
        ]))
        setErrorMessage('')
        setSuccessMessage('')
    }

    function removeRow(rowId) {
        setRows((previous) => {
            if (previous.length <= 2) return previous
            return previous.filter((row) => row.id !== rowId)
        })
        setErrorMessage('')
        setSuccessMessage('')
    }

    function updateRow(rowId, updates) {
        setRows((previous) => previous.map((row) => {
            if (row.id !== rowId) return row

            const nextRow = { ...row, ...updates }
            if ('amount' in updates || 'accountId' in updates) {
                nextRow.paid = false
                nextRow.captureId = ''
                nextRow.payerEmail = ''
            }

            return nextRow
        }))

        setErrorMessage('')
        setSuccessMessage('')
    }

    function validateBeforeFinalize() {
        if (!hasItems) {
            return 'No hay productos en el carrito para procesar el pago.'
        }

        const paidRows = rows.filter((row) => row.paid && parseAmount(row.amount) > 0)
        if (paidRows.length < 2) {
            return 'Debes completar al menos 2 transacciones de PayPal para finalizar.'
        }

        if (Math.abs(remaining) > 0.01) {
            if (remaining > 0) return `Faltan ${remaining.toFixed(2)} USD por pagar.`
            return `Pagaste ${Math.abs(remaining).toFixed(2)} USD de mas.`
        }

        return ''
    }

    function handleFinalize() {
        const validationError = validateBeforeFinalize()
        if (validationError) {
            setErrorMessage(validationError)
            setSuccessMessage('')
            return
        }

        setErrorMessage('')
        setSuccessMessage('Pago confirmado en PayPal Sandbox. Compra finalizada.')

        const transactions = rows
            .filter((row) => row.paid)
            .map((row) => ({
                accountId: row.accountId,
                amount: parseAmount(row.amount),
                captureId: row.captureId,
                payerEmail: row.payerEmail
            }))

        onFinalize?.({
            totalAmount,
            paidAmount,
            transactions
        })
    }

    const scriptOptions = {
        'client-id': clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons'
    }

    return (
        <div className='mt-6 rounded-xl border p-4' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'color-mix(in srgb, var(--color-bg-light) 84%, var(--color-primary-light))' }}>
            <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                <h2 className='subtitle text-xl font-semibold'>PayPal Sandbox Split Payment</h2>
                <button
                    type='button'
                    className='no-print paragraph rounded-lg border px-3 py-1.5 text-sm font-semibold'
                    style={{ borderColor: 'var(--color-accent-light)' }}
                    onClick={addRow}
                >
                    Agregar transaccion
                </button>
            </div>

            <p className='paragraph mb-4 text-sm opacity-85'>
                Define montos por transaccion y completa cada pago con PayPal Sandbox. Para finalizar debes cubrir el total con minimo 2 transacciones.
            </p>

            <PayPalScriptProvider options={scriptOptions}>
                <div className='space-y-4'>
                    {rows.map((row, index) => {
                        const amountValue = parseAmount(row.amount)

                        return (
                            <div key={row.id} className='rounded-lg border p-3' style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)' }}>
                                <div className='mb-3 grid gap-2 md:grid-cols-[1fr_180px_auto] md:items-end'>
                                    <label className='paragraph text-sm'>
                                        Transaccion #{index + 1}
                                        <select
                                            className='mt-1 w-full rounded-lg border px-2 py-2 text-sm'
                                            style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-light)' }}
                                            value={row.accountId}
                                            onChange={(event) => updateRow(row.id, { accountId: event.target.value })}
                                            disabled={row.paid}
                                        >
                                            {SANDBOX_ACCOUNT_OPTIONS.map((option) => (
                                                <option key={option.id} value={option.id}>{option.label}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className='paragraph text-sm'>
                                        Monto USD
                                        <input
                                            type='number'
                                            min={0}
                                            step='0.01'
                                            value={row.amount}
                                            onChange={(event) => updateRow(row.id, { amount: event.target.value })}
                                            className='mt-1 w-full rounded-lg border px-2 py-2 text-sm'
                                            style={{ borderColor: 'var(--color-accent-light)', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-light)' }}
                                            placeholder='0.00'
                                            disabled={row.paid}
                                        />
                                    </label>

                                    <button
                                        type='button'
                                        className='no-print paragraph rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50'
                                        style={{ borderColor: 'var(--color-accent-light)' }}
                                        onClick={() => removeRow(row.id)}
                                        disabled={rows.length <= 2 || row.paid}
                                    >
                                        Quitar
                                    </button>
                                </div>

                                {row.paid ? (
                                    <div className='rounded-md border p-2 text-xs' style={{ borderColor: 'var(--color-accent-light)' }}>
                                        <p className='paragraph'>Pagado: {amountValue.toFixed(2)} USD</p>
                                        <p className='paragraph'>Captura: {row.captureId}</p>
                                        <p className='paragraph'>Comprador: {row.payerEmail || 'sin correo'}</p>
                                    </div>
                                ) : (
                                    <>
                                        {amountValue <= 0 ? (
                                            <p className='paragraph text-xs opacity-70'>Ingresa un monto mayor a 0 para habilitar PayPal.</p>
                                        ) : (
                                            <PayPalButtons
                                                style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' }}
                                                forceReRender={[amountValue, row.accountId]}
                                                disabled={!hasItems || amountValue <= 0}
                                                createOrder={(_data, actions) => actions.order.create({
                                                    intent: 'CAPTURE',
                                                    purchase_units: [
                                                        {
                                                            description: `Split payment tx #${row.id} (${row.accountId})`,
                                                            amount: {
                                                                currency_code: 'USD',
                                                                value: amountValue.toFixed(2)
                                                            }
                                                        }
                                                    ]
                                                })}
                                                onApprove={async (_data, actions) => {
                                                    const details = await actions.order.capture()
                                                    const captureId = details?.purchase_units?.[0]?.payments?.captures?.[0]?.id || 'N/A'
                                                    const payerEmail = details?.payer?.email_address || ''

                                                    updateRow(row.id, {
                                                        paid: true,
                                                        captureId,
                                                        payerEmail
                                                    })
                                                }}
                                                onError={(error) => {
                                                    const friendly = error?.message || 'Error al procesar PayPal Sandbox.'
                                                    setErrorMessage(friendly)
                                                    setSuccessMessage('')
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </PayPalScriptProvider>

            <div className='mt-4 flex flex-wrap items-center justify-between gap-2 text-sm'>
                <p className='paragraph'>Total pagado: {paidAmount.toFixed(2)} USD</p>
                <p className='paragraph'>Pendiente: {Math.max(0, remaining).toFixed(2)} USD</p>
            </div>

            <div className='mt-3'>
                <button
                    type='button'
                    className='no-print paragraph rounded-lg border px-4 py-2 text-sm font-semibold'
                    style={{ borderColor: 'var(--color-accent-light)' }}
                    onClick={handleFinalize}
                >
                    Confirmar compra
                </button>
            </div>

            {!!errorMessage && (
                <p className='paragraph mt-3 text-sm' style={{ color: 'var(--color-accent-light)' }}>{errorMessage}</p>
            )}

            {!!successMessage && (
                <p className='paragraph mt-3 text-sm'>{successMessage}</p>
            )}
        </div>
    )
}
