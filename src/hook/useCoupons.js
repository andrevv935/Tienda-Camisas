import { useCallback, useEffect, useState } from 'react'
import { createCouponRequest, fetchActiveCoupons, updateCouponDiscountRequest } from '../backend/services/coupons/couponApiClient.js'

export function useCoupons() {
    const [coupons, setCoupons] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUpdatingCouponId, setIsUpdatingCouponId] = useState(null)
    const [loadErrorMessage, setLoadErrorMessage] = useState('')
    const [actionErrorMessage, setActionErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const loadCoupons = useCallback(async () => {
        setIsLoading(true)
        setLoadErrorMessage('')

        try {
            const rows = await fetchActiveCoupons()
            setCoupons(rows)
        } catch (error) {
            setLoadErrorMessage(error.message || 'No se pudieron cargar los cupones.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCoupons()
    }, [loadCoupons])

    async function createCoupon(payload) {
        setIsSubmitting(true)
        setActionErrorMessage('')
        setSuccessMessage('')

        try {
            const created = await createCouponRequest(payload)
            setSuccessMessage(`Cupón ${created.code} creado exitosamente.`)
            await loadCoupons()
            return created
        } catch (error) {
            setActionErrorMessage(error.message || 'No se pudo crear el cupón.')
            return null
        } finally {
            setIsSubmitting(false)
        }
    }

    async function updateCouponDiscount(couponId, couponDiscount) {
        setIsUpdatingCouponId(couponId)
        setActionErrorMessage('')
        setSuccessMessage('')

        try {
            const updated = await updateCouponDiscountRequest(couponId, couponDiscount)
            setSuccessMessage(`Cupón ${updated.code} actualizado correctamente.`)
            await loadCoupons()
            return updated
        } catch (error) {
            setActionErrorMessage(error.message || 'No se pudo actualizar el cupón.')
            return null
        } finally {
            setIsUpdatingCouponId(null)
        }
    }

    return {
        coupons,
        isLoading,
        isSubmitting,
        isUpdatingCouponId,
        loadErrorMessage,
        actionErrorMessage,
        successMessage,
        createCoupon,
        updateCouponDiscount,
        reloadCoupons: loadCoupons
    }
}
