async function parseResponse(response) {
    const raw = await response.text().catch(() => '')
    let data = null

    try {
        data = raw ? JSON.parse(raw) : null
    } catch {
        data = null
    }

    if (!response.ok) {
        const normalizedRaw = raw.trim()
        const isHtmlResponse = normalizedRaw.startsWith('<!DOCTYPE') || normalizedRaw.startsWith('<html')
        const isExpressCannotGet = /cannot\s+get\s+\/api\/coupons/i.test(normalizedRaw)
        const friendlyDefaultMessage = response.status >= 500
            ? 'El servidor de cupones no esta disponible en este momento. Intenta de nuevo en unos minutos.'
            : 'No se pudieron cargar los cupones en este momento.'

        const fallbackMessage = !normalizedRaw || isHtmlResponse || isExpressCannotGet
            ? friendlyDefaultMessage
            : normalizedRaw

        throw new Error(data?.message || fallbackMessage)
    }

    return data
}

export async function fetchActiveCoupons() {
    const response = await fetch('/api/coupons')
    return parseResponse(response)
}

export async function createCouponRequest(payload) {
    const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return parseResponse(response)
}

export async function updateCouponDiscountRequest(id, couponDiscount) {
    const response = await fetch(`/api/coupons/${id}/discount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponDiscount })
    })

    return parseResponse(response)
}
