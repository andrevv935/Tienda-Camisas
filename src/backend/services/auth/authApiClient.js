const AUTH_STORAGE_KEY = 'authUser'

async function parseResponse(response) {
    const data = await response.json().catch(() => null)
    if (!response.ok) {
        throw new Error(data?.message || 'Request failed')
    }

    return data
}

export async function loginRequest(payload) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return parseResponse(response)
}

export async function registerRequest(payload) {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    return parseResponse(response)
}

export function setCurrentUser(user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event('auth:changed'))
}

export function getCurrentUser() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        if (!raw) return null

        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function clearCurrentUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    window.dispatchEvent(new Event('auth:changed'))
}
