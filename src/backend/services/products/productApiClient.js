async function parseResponse(response) {
    const data = await response.json().catch(() => null)
    if (!response.ok) {
        throw new Error(data?.message || 'Request failed')
    }

    return data
}

export async function fetchProductsRequest() {
    const response = await fetch('/api/products', {
        method: 'GET'
    })

    return parseResponse(response)
}

export async function createProductRequest(formData) {
    const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
    })

    return parseResponse(response)
}
