// Cicla solo entre paletas asignadas a default/dark/colorblind y guarda preferencia local.
import { fetchPalettes } from '../backend/services/palettes/paletteApiClient.js'

const MODE_STORAGE_KEY = 'preferredPaletteMode'

export async function cyclePalette() {
    try {
        const palettes = await fetchPalettes()
        if (!palettes || palettes.length === 0) return

        const modePalettes = [
            { mode: 'default', palette: palettes.find((palette) => palette.is_default_active) || null },
            { mode: 'dark', palette: palettes.find((palette) => palette.is_dark_active) || null },
            { mode: 'colorblind', palette: palettes.find((palette) => palette.is_colorblind_active) || null }
        ].filter(({ palette }) => Boolean(palette))

        if (modePalettes.length === 0) return

        const currentMode = localStorage.getItem(MODE_STORAGE_KEY)
        const currentIndex = modePalettes.findIndex(({ mode }) => mode === currentMode)
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % modePalettes.length
        const nextMode = modePalettes[nextIndex].mode

        localStorage.setItem(MODE_STORAGE_KEY, nextMode)

        window.dispatchEvent(new Event('theme:refresh'))
    } catch {
        // Si la API no esta disponible, no hacemos nada.
    }
}