async function parseResponse(response) {
    if (response.status === 204) return null

    const data = await response.json().catch(() => null)
    if (!response.ok) {
        throw new Error(data?.message || 'Request failed')
    }

    return data
}

export async function fetchPalettes() {
    const response = await fetch('/api/palettes')
    return parseResponse(response)
}

export async function createPaletteRequest(payload) {
    const response = await fetch('/api/palettes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return parseResponse(response)
}

export async function updatePaletteRequest(id, payload) {
    const response = await fetch(`/api/palettes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return parseResponse(response)
}

export async function setPaletteModeRequest(id, mode) {
    const response = await fetch(`/api/palettes/${id}/mode`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
    })

    return parseResponse(response)
}

export async function hidePaletteRequest(id) {
    const response = await fetch(`/api/palettes/${id}`, {
        method: 'DELETE'
    })

    return parseResponse(response)
}
