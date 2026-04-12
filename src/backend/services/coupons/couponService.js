import sql from '../../database/db.js'

function mapCouponRow(row) {
    const now = new Date()
    const expiresAt = new Date(row.expires_at)
    const msPerDay = 24 * 60 * 60 * 1000
    const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / msPerDay))

    return {
        ...row,
        discount_percentage: Math.trunc(Number(row.discount_percentage)),
        days_left: daysLeft
    }
}

export async function createCoupon({ code, durationDays, expiresAt, expiresTime, discountPercentage }) {
    const normalizedDiscount = Math.trunc(Number(discountPercentage))

    const [created] = await sql`
        INSERT INTO coupons (
            code,
            duration_days,
            discount_percentage,
            expires_time,
            expires_at,
            status
        )
        VALUES (
            ${code},
            ${durationDays},
            ${normalizedDiscount},
            ${expiresTime}::time,
            (${expiresAt}::date + ${expiresTime}::time),
            'active'
        )
        RETURNING id, code, duration_days, discount_percentage, expires_time, expires_at, status, created_at
    `

    return mapCouponRow(created)
}

export async function listActiveCoupons() {
    await sql`
        UPDATE coupons
        SET status = 'expired', updated_at = NOW()
        WHERE is_visible = TRUE AND expires_at <= NOW() AND status <> 'expired'
    `

    const rows = await sql`
        SELECT id, code, duration_days, discount_percentage, expires_time, expires_at, status, created_at
        FROM coupons
        WHERE is_visible = TRUE AND status = 'active' AND expires_at > NOW()
        ORDER BY created_at DESC
    `

    return rows.map(mapCouponRow)
}

export async function updateCouponDiscount({ id, discountPercentage }) {
    const normalizedDiscount = Math.trunc(Number(discountPercentage))

    const [updated] = await sql`
        UPDATE coupons
        SET
            discount_percentage = ${normalizedDiscount},
            updated_at = NOW()
        WHERE id = ${id}
            AND is_visible = TRUE
            AND status = 'active'
            AND expires_at > NOW()
        RETURNING id, code, duration_days, discount_percentage, expires_time, expires_at, status, created_at
    `

    return updated ? mapCouponRow(updated) : null
}
