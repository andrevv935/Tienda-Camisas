import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createTangramFigureCycle } from '../../components/tangram/figures'

const LOADING_SCREEN_ENABLED_KEY = 'loadingScreenEnabled'
const LOADING_SCREEN_INITIAL_CYCLE_ENDS_AT_KEY = 'loadingScreenInitialCycleEndsAt'
const TANGRAM_HOLD_DURATION_MS = 2000
const TANGRAM_MORPH_DURATION_MS = 1000
const TANGRAM_CYCLE_DURATION_MS = createTangramFigureCycle().length * (TANGRAM_HOLD_DURATION_MS + TANGRAM_MORPH_DURATION_MS)

const LoadingScreenContext = createContext(null)

function getInitialEnabledValue() {
    if (typeof window === 'undefined') {
        return true
    }

    const storedValue = window.localStorage.getItem(LOADING_SCREEN_ENABLED_KEY)
    if (storedValue === null) {
        return true
    }

    return storedValue === 'true'
}

function getSessionNow() {
    // Use wall-clock time so the stored deadline survives full page reloads.
    return Date.now()
}

function getInitialTangramBlockingValue(isEnabled) {
    if (!isEnabled || typeof window === 'undefined') {
        return false
    }

    const storedEndsAt = Number(window.sessionStorage.getItem(LOADING_SCREEN_INITIAL_CYCLE_ENDS_AT_KEY))
    const now = getSessionNow()

    if (Number.isFinite(storedEndsAt) && storedEndsAt > now) {
        return true
    }

    const endsAt = now + TANGRAM_CYCLE_DURATION_MS
    window.sessionStorage.setItem(LOADING_SCREEN_INITIAL_CYCLE_ENDS_AT_KEY, String(endsAt))
    return true
}

export function LoadingScreenProvider({ children }) {
    const [isEnabled, setIsEnabled] = useState(getInitialEnabledValue)
    const [networkLoadingCount, setNetworkLoadingCount] = useState(0)
    const [manualLoadingCount, setManualLoadingCount] = useState(0)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isInitialTangramBlocking, setIsInitialTangramBlocking] = useState(() => getInitialTangramBlockingValue(getInitialEnabledValue()))
    const mountedRef = useRef(true)

    const startLoading = useCallback(() => {
        setManualLoadingCount((count) => count + 1)
    }, [])

    const stopLoading = useCallback(() => {
        setManualLoadingCount((count) => Math.max(0, count - 1))
    }, [])

    const withLoading = useCallback(async (action) => {
        startLoading()
        try {
            return await action()
        } finally {
            stopLoading()
        }
    }, [startLoading, stopLoading])

    const setEnabled = useCallback((value) => {
        const normalizedValue = Boolean(value)
        setIsEnabled(normalizedValue)

        if (typeof window !== 'undefined') {
            window.localStorage.setItem(LOADING_SCREEN_ENABLED_KEY, String(normalizedValue))
            if (!normalizedValue) {
                window.sessionStorage.removeItem(LOADING_SCREEN_INITIAL_CYCLE_ENDS_AT_KEY)
                setIsInitialTangramBlocking(false)
            } else {
                setIsInitialTangramBlocking(getInitialTangramBlockingValue(true))
            }
        }
    }, [])

    const toggleEnabled = useCallback(() => {
        setIsEnabled((current) => {
            const next = !current
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(LOADING_SCREEN_ENABLED_KEY, String(next))
                if (!next) {
                    window.sessionStorage.removeItem(LOADING_SCREEN_INITIAL_CYCLE_ENDS_AT_KEY)
                    setIsInitialTangramBlocking(false)
                } else {
                    setIsInitialTangramBlocking(getInitialTangramBlockingValue(true))
                }
            }
            return next
        })
    }, [])

    useEffect(() => {
        mountedRef.current = true

        function finishInitialLoading() {
            if (!mountedRef.current) {
                return
            }

            setIsInitialLoading(false)
        }

        if (document.readyState === 'complete') {
            finishInitialLoading()
        } else {
            window.addEventListener('load', finishInitialLoading)
        }

        return () => {
            mountedRef.current = false
            window.removeEventListener('load', finishInitialLoading)
        }
    }, [])

    useEffect(() => {
        if (!isEnabled || typeof window === 'undefined') {
            return undefined
        }

        const now = getSessionNow()
        const storedEndsAt = Number(window.sessionStorage.getItem(LOADING_SCREEN_INITIAL_CYCLE_ENDS_AT_KEY))

        if (!Number.isFinite(storedEndsAt) || storedEndsAt <= now) {
            window.sessionStorage.setItem(
                LOADING_SCREEN_INITIAL_CYCLE_ENDS_AT_KEY,
                String(now + TANGRAM_CYCLE_DURATION_MS),
            )
            setIsInitialTangramBlocking(true)
            const timeoutId = window.setTimeout(() => {
                if (mountedRef.current) {
                    setIsInitialTangramBlocking(false)
                }
            }, TANGRAM_CYCLE_DURATION_MS)

            return () => window.clearTimeout(timeoutId)
        }

        const remainingMs = storedEndsAt - now
        setIsInitialTangramBlocking(true)
        const timeoutId = window.setTimeout(() => {
            if (mountedRef.current) {
                setIsInitialTangramBlocking(false)
            }
        }, remainingMs)

        return () => window.clearTimeout(timeoutId)
    }, [isEnabled])

    useEffect(() => {
        const originalFetch = window.fetch
        const originalOpen = window.XMLHttpRequest.prototype.open
        const originalSend = window.XMLHttpRequest.prototype.send

        function beginNetworkLoad() {
            setNetworkLoadingCount((count) => count + 1)
        }

        function endNetworkLoad() {
            setNetworkLoadingCount((count) => Math.max(0, count - 1))
        }

        window.fetch = async (...args) => {
            beginNetworkLoad()

            try {
                return await originalFetch(...args)
            } finally {
                endNetworkLoad()
            }
        }

        window.XMLHttpRequest.prototype.open = function patchedOpen(...args) {
            this.__loadingScreenTracked = false
            return originalOpen.apply(this, args)
        }

        window.XMLHttpRequest.prototype.send = function patchedSend(...args) {
            if (!this.__loadingScreenTracked) {
                this.__loadingScreenTracked = true
                beginNetworkLoad()

                this.addEventListener('loadend', () => {
                    endNetworkLoad()
                }, { once: true })
            }

            return originalSend.apply(this, args)
        }

        return () => {
            window.fetch = originalFetch
            window.XMLHttpRequest.prototype.open = originalOpen
            window.XMLHttpRequest.prototype.send = originalSend
        }
    }, [])

    const isInitialScreenLoading = isInitialLoading || isInitialTangramBlocking
    const isSystemLoading = isInitialScreenLoading || networkLoadingCount > 0 || manualLoadingCount > 0
    const isGlobalLoadingVisible = isEnabled && isSystemLoading

    const contextValue = useMemo(() => ({
        isEnabled,
        isInitialScreenLoading,
        isSystemLoading,
        isGlobalLoadingVisible,
        setEnabled,
        toggleEnabled,
        startLoading,
        stopLoading,
        withLoading,
        networkLoadingCount,
        manualLoadingCount,
    }), [
        isEnabled,
        isInitialScreenLoading,
        isSystemLoading,
        isGlobalLoadingVisible,
        setEnabled,
        toggleEnabled,
        startLoading,
        stopLoading,
        withLoading,
        networkLoadingCount,
        manualLoadingCount,
    ])

    return (
        <LoadingScreenContext.Provider value={contextValue}>
            {children}
        </LoadingScreenContext.Provider>
    )
}

export function useLoadingScreen() {
    const context = useContext(LoadingScreenContext)

    if (!context) {
        throw new Error('useLoadingScreen must be used inside LoadingScreenProvider')
    }

    return context
}
