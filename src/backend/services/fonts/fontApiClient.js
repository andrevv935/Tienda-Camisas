async function parseResponse(response) {
    if (response.status === 204) return null

    const data = await response.json().catch(() => null)
    if (!response.ok) {
        throw new Error(data?.message || 'Request failed')
    }

    return data
}

export async function fetchFonts() {
    const response = await fetch('/api/fonts')
    return parseResponse(response)
}

export async function createFontRequest(payload) {
    const isMultipart = payload instanceof FormData

    const response = await fetch('/api/fonts', {
        method: 'POST',
        ...(isMultipart ? {} : { headers: { 'Content-Type': 'application/json' } }),
        body: isMultipart ? payload : JSON.stringify(payload)
    })

    return parseResponse(response)
}

export async function updateFontRequest(id, payload) {
    const response = await fetch(`/api/fonts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return parseResponse(response)
}

export async function activateFontSectionRequest(id, section) {
    const response = await fetch(`/api/fonts/${id}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section })
    })

    return parseResponse(response)
}

export async function hideFontRequest(id) {
    const response = await fetch(`/api/fonts/${id}`, {
        method: 'DELETE'
    })

    return parseResponse(response)
}
