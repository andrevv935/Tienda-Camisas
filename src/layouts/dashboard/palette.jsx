import { useEffect, useMemo, useState } from 'react'
import Preview from './preview.jsx'
import {
    createPaletteRequest,
    fetchPalettes,
    hidePaletteRequest,
    setPaletteModeRequest,
    updatePaletteRequest
} from '../../backend/services/palettes/paletteApiClient.js'

// Este componente es para gestionar las paletas de colores del sitio web. Permite seleccionar colores para diferentes elementos y ver una vista previa de cómo se verían esos colores en el sitio web antes de aplicarlos.
// Tambien permite guardar, editar y eliminar las paletas de colores personalizadas para usarlas en el futuro o compartirlas con otros usuarios.

export default function Palette(){
    const paletteColorOrder = ['primary', 'secondary', 'accent', 'background', 'text']

    const [paletteName, setPaletteName] = useState('')
    const [draftPalette, setDraftPalette] = useState({
        primary: '#E4A97C',
        secondary: '#6DA4AB',
        accent: '#AB886D',
        background: '#EDEDED',
        text: '#333333'
    })

    const [savedPalettes, setSavedPalettes] = useState([])
    const [selectedModes, setSelectedModes] = useState({
        light: null,
        dark: null,
        colorblind: null
    })
    const [editingPaletteId, setEditingPaletteId] = useState(null)
    const [editingDraft, setEditingDraft] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    const totalPages = Math.max(1, Math.ceil(savedPalettes.length / itemsPerPage))

    const paginatedPalettes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return savedPalettes.slice(startIndex, endIndex)
    }, [currentPage, savedPalettes])

    async function loadPalettes() {
        setIsLoading(true)
        setErrorMessage('')

        try {
            const rows = await fetchPalettes()
            setSavedPalettes(rows)

            const nextModes = {
                light: rows.find((palette) => palette.is_default_active)?.id || null,
                dark: rows.find((palette) => palette.is_dark_active)?.id || null,
                colorblind: rows.find((palette) => palette.is_colorblind_active)?.id || null
            }

            setSelectedModes(nextModes)
        } catch (error) {
            setErrorMessage(error.message || 'No se pudieron cargar las paletas.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadPalettes()
    }, [])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    function handleColorChange(colorKey, value){
        setDraftPalette((prev) => ({
            ...prev,
            [colorKey]: value
        }))
    }

    async function handleSavePalette(){
        const normalizedName = paletteName.trim()

        if (!normalizedName) return

        try {
            await createPaletteRequest({
                name: normalizedName,
                colors: { ...draftPalette }
            })
            setPaletteName('')
            await loadPalettes()
            window.dispatchEvent(new Event('theme:refresh'))
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo guardar la paleta.')
        }
    }

    function isPaletteAssignedToAnotherMode(paletteId, targetMode){
        return Object.entries(selectedModes).some(
            ([mode, selectedPaletteId]) => mode !== targetMode && String(selectedPaletteId) === String(paletteId)
        )
    }

    async function handleModeSelection(mode, paletteId){
        if (isPaletteAssignedToAnotherMode(paletteId, mode)) return

        const modeKey = mode === 'light' ? 'default' : mode

        try {
            await setPaletteModeRequest(paletteId, modeKey)
            await loadPalettes()
            window.dispatchEvent(new Event('theme:refresh'))
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo actualizar el modo de la paleta.')
        }
    }

    function isPaletteSelected(paletteId){
        return Object.values(selectedModes).some((selectedId) => String(selectedId) === String(paletteId))
    }

    async function handleDeletePalette(paletteId){
        if (isPaletteSelected(paletteId)) return

        try {
            await hidePaletteRequest(paletteId)
            if (editingPaletteId === paletteId) {
                setEditingPaletteId(null)
                setEditingDraft(null)
            }
            await loadPalettes()
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo ocultar la paleta.')
        }
    }

    function handleEditPalette(palette){
        setEditingPaletteId(palette.id)
        setEditingDraft({ ...palette.colors })
    }

    function handleEditingColorChange(colorKey, value){
        setEditingDraft((prev) => ({
            ...prev,
            [colorKey]: value
        }))
    }

    function handleCancelEdit(){
        setEditingPaletteId(null)
        setEditingDraft(null)
    }

    async function handleSaveEditedPalette(){
        if (!editingPaletteId || !editingDraft) return

        try {
            await updatePaletteRequest(editingPaletteId, {
                colors: { ...editingDraft }
            })
            handleCancelEdit()
            await loadPalettes()
            window.dispatchEvent(new Event('theme:refresh'))
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo actualizar la paleta.')
        }
    }

    function goToPreviousPage(){
        setCurrentPage((prevPage) => Math.max(1, prevPage - 1))
    }

    function goToNextPage(){
        setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))
    }

    return (
        <div className='palette p-4 rounded w-full h-auto mt-4 flex flex-col md:flex-row'>
            <div className='flex flex-col ml-4 w-160'>
                <div className='palette-creator flex flex-col'>
                    <p className='title font-bold'>Selector de paletas</p>
                    <p className='subtitle'>Selecciona colores y guarda tu paleta personalizada</p>
                    {isLoading && <p className='paragraph text-sm'>Cargando paletas...</p>}
                    {!!errorMessage && <p className='paragraph text-sm'>{errorMessage}</p>}
                    <label className='paragraph' htmlFor="palette-name">Nombre de la paleta</label>
                    <input
                        className='paragraph'
                        type="text"
                        id="palette-name"
                        value={paletteName}
                        onChange={(event) => setPaletteName(event.target.value)}
                    />
                    <div className='colors-div gap-6 items-center justify-between flex flex-row'>
                        <input
                            className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                            type="color"
                            id="primary-color"
                            value={draftPalette.primary}
                            onChange={(event) => handleColorChange('primary', event.target.value)}
                        />
                        <input
                            className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                            type="color"
                            id="secondary-color"
                            value={draftPalette.secondary}
                            onChange={(event) => handleColorChange('secondary', event.target.value)}
                        />
                        <input
                            className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                            type="color"
                            id="accent-color"
                            value={draftPalette.accent}
                            onChange={(event) => handleColorChange('accent', event.target.value)}
                        />
                        <input
                            className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                            type="color"
                            id="background-color"
                            value={draftPalette.background}
                            onChange={(event) => handleColorChange('background', event.target.value)}
                        />
                        <input
                            className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                            type="color"
                            id="font-color"
                            value={draftPalette.text}
                            onChange={(event) => handleColorChange('text', event.target.value)}
                        />
                    </div>
                    <button
                        type='button'
                        className='bg-accent-light py-2 px-4 rounded paragraph'
                        onClick={handleSavePalette}
                    >
                        Guardar paleta
                    </button>
                </div>
                <div className='palette-table mt-6'>
                    <p className='subtitle font-bold text-2xl mb-2'>Paletas guardadas</p>
                    <div className='table-div overflow-x-auto'>
                        <table className='min-w-full border-collapse text-left text-sm'>
                            <thead>
                                <tr className='border-b border-gray-300 bg-primary-light'>
                                    <th className='py-2 pr-4'>Nombre</th>
                                    <th className='py-2 pr-4'>Muestra</th>
                                    <th className='py-2 pr-4'>Modo Claro</th>
                                    <th className='py-2 pr-4'>Modo Oscuro</th>
                                    <th className='py-2 pr-4'>Modo Daltónico</th>
                                    <th className='py-2 pr-4'>Editar</th>
                                    <th className='py-2 pr-4'>Eliminar</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200 bg-secondary-light'>
                                {paginatedPalettes.map((palette) => (
                                    <tr key={palette.id} className='border-b border-gray-200'>
                                        <td className='py-2 pr-4 paragraph'>{palette.name}</td>
                                        <td className='py-2 pr-4'>
                                            <div className='flex flex-row gap-2'>
                                                {paletteColorOrder.map((colorKey) => (
                                                    <span
                                                        key={`${palette.id}-${colorKey}`}
                                                        className='inline-block h-5 w-5 rounded-full border border-gray-500'
                                                        style={{ backgroundColor: palette.colors?.[colorKey] || '#000000' }}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <input
                                                type='radio'
                                                name='light-mode-palette'
                                                checked={String(selectedModes.light) === String(palette.id)}
                                                disabled={isPaletteAssignedToAnotherMode(palette.id, 'light')}
                                                onChange={() => handleModeSelection('light', palette.id)}
                                            />
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <input
                                                type='radio'
                                                name='dark-mode-palette'
                                                checked={String(selectedModes.dark) === String(palette.id)}
                                                disabled={isPaletteAssignedToAnotherMode(palette.id, 'dark')}
                                                onChange={() => handleModeSelection('dark', palette.id)}
                                            />
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <input
                                                type='radio'
                                                name='colorblind-mode-palette'
                                                checked={String(selectedModes.colorblind) === String(palette.id)}
                                                disabled={isPaletteAssignedToAnotherMode(palette.id, 'colorblind')}
                                                onChange={() => handleModeSelection('colorblind', palette.id)}
                                            />
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <button
                                                type='button'
                                                className='paragraph rounded px-2 py-1'
                                                onClick={() => handleEditPalette(palette)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <button
                                                type='button'
                                                className='paragraph rounded px-2 py-1'
                                                disabled={isPaletteSelected(palette.id)}
                                                onClick={() => handleDeletePalette(palette.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {savedPalettes.length === 0 && (
                                    <tr>
                                        <td className='py-3 pr-4 paragraph' colSpan={7}>Aun no hay paletas guardadas.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className='mt-3 flex items-center justify-between'>
                            <button
                                type='button'
                                className='paragraph rounded px-3 py-1'
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </button>
                            <p className='paragraph text-sm'>Pagina {currentPage} de {totalPages}</p>
                            <button
                                type='button'
                                className='paragraph rounded px-3 py-1'
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`palette-editor mt-6 ${editingPaletteId ? 'block' : 'hidden'}`}>
                    <p className='subtitle font-bold text-2xl mb-2'>Editor de paleta</p>
                    <p className='paragraph mb-3'>Edita colores individualmente para la paleta seleccionada.</p>
                    <div className='colors-div gap-6 items-center justify-start flex flex-row flex-wrap'>
                        <label className='paragraph flex flex-col items-center gap-1' htmlFor='edit-primary-color'>
                            Primario
                            <input
                                className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                                type='color'
                                id='edit-primary-color'
                                value={editingDraft?.primary || '#000000'}
                                onChange={(event) => handleEditingColorChange('primary', event.target.value)}
                            />
                        </label>
                        <label className='paragraph flex flex-col items-center gap-1' htmlFor='edit-secondary-color'>
                            Secundario
                            <input
                                className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                                type='color'
                                id='edit-secondary-color'
                                value={editingDraft?.secondary || '#000000'}
                                onChange={(event) => handleEditingColorChange('secondary', event.target.value)}
                            />
                        </label>
                        <label className='paragraph flex flex-col items-center gap-1' htmlFor='edit-accent-color'>
                            Acento
                            <input
                                className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                                type='color'
                                id='edit-accent-color'
                                value={editingDraft?.accent || '#000000'}
                                onChange={(event) => handleEditingColorChange('accent', event.target.value)}
                            />
                        </label>
                        <label className='paragraph flex flex-col items-center gap-1' htmlFor='edit-background-color'>
                            Fondo
                            <input
                                className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                                type='color'
                                id='edit-background-color'
                                value={editingDraft?.background || '#000000'}
                                onChange={(event) => handleEditingColorChange('background', event.target.value)}
                            />
                        </label>
                        <label className='paragraph flex flex-col items-center gap-1' htmlFor='edit-text-color'>
                            Texto
                            <input
                                className='rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-light'
                                type='color'
                                id='edit-text-color'
                                value={editingDraft?.text || '#000000'}
                                onChange={(event) => handleEditingColorChange('text', event.target.value)}
                            />
                        </label>
                    </div>
                    <div className='mt-3 flex gap-3'>
                        <button
                            type='button'
                            className='paragraph rounded px-3 py-1'
                            onClick={handleSaveEditedPalette}
                        >
                            Guardar cambios
                        </button>
                        <button
                            type='button'
                            className='paragraph rounded px-3 py-1'
                            onClick={handleCancelEdit}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
            <div className='mt-4 md:mt-0'>
                <Preview />
            </div>
        </div>
    )
}