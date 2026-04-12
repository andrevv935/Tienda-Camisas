import { Router } from 'express'
import { createCoupon, listActiveCoupons, updateCouponDiscount } from './couponService.js'

const router = Router()
const MINIMUM_DAYS = 3

router.get('/', async (_req, res, next) => {
    try {
        const coupons = await listActiveCoupons()
        return res.json(coupons)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { couponCode, couponExpiresAt, couponExpiresTime, couponDiscount } = req.body

        const code = String(couponCode || '').trim().toUpperCase()
        if (!code) {
            return res.status(400).json({ message: 'couponCode is required' })
        }

        const expiresAt = String(couponExpiresAt || '').trim()
        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
            return res.status(400).json({ message: 'couponExpiresAt must be a valid date in format YYYY-MM-DD' })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const minDate = new Date(today)
        minDate.setDate(minDate.getDate() + MINIMUM_DAYS)

        const selectedExpiryDate = new Date(`${expiresAt}T00:00:00`)
        if (Number.isNaN(selectedExpiryDate.getTime())) {
            return res.status(400).json({ message: 'couponExpiresAt is invalid' })
        }

        if (selectedExpiryDate < minDate) {
            return res.status(400).json({ message: `couponExpiresAt must be at least ${MINIMUM_DAYS} days after current date` })
        }

        const expiresTime = String(couponExpiresTime || '').trim()
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(expiresTime)) {
            return res.status(400).json({ message: 'couponExpiresTime must be in HH:MM format' })
        }

        const msPerDay = 24 * 60 * 60 * 1000
        const durationDays = Math.ceil((selectedExpiryDate - today) / msPerDay)

        const discountPercentage = Number(couponDiscount)
        if (!Number.isInteger(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
            return res.status(400).json({ message: 'couponDiscount must be an integer between 1 and 100' })
        }

        const created = await createCoupon({
            code,
            durationDays,
            expiresAt,
            expiresTime,
            discountPercentage
        })

        return res.status(201).json(created)
    } catch (error) {
        next(error)
    }
})

router.patch('/:id/discount', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: 'Invalid id' })
        }

        const { couponDiscount } = req.body
        const discountPercentage = Number(couponDiscount)
        if (!Number.isInteger(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
            return res.status(400).json({ message: 'couponDiscount must be an integer between 1 and 100' })
        }

        const updated = await updateCouponDiscount({ id, discountPercentage })
        if (!updated) {
            return res.status(404).json({ message: 'Active coupon not found or already expired' })
        }

        return res.json(updated)
    } catch (error) {
        next(error)
    }
})

export default router
