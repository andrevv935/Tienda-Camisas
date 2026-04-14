import { useEffect, useMemo, useRef, useState } from 'react'
import Preview from './preview.jsx'
import {
    activateFontSectionRequest,
    createFontRequest,
    fetchFonts,
    hideFontRequest,
    updateFontRequest
} from '../../backend/services/fonts/fontApiClient.js'

export default function Font() {
    const [loadedFonts, setLoadedFonts] = useState([])
    const [selectedFonts, setSelectedFonts] = useState({
        title: null,
        subtitle: null,
        paragraph: null
    })

    // Estados para manejar los tamaños de texto antes de aplicar cambios y después de aplicarlos
    const [draftSizes, setDraftSizes] = useState({
        title: 26,
        subtitle: 20,
        paragraph: 12
    })
    const [appliedSizes, setAppliedSizes] = useState({
        title: 26,
        subtitle: 20,
        paragraph: 12
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const loadedFontFaceIdsRef = useRef(new Set())

    // Estado de paginacion de la tabla de fuentes
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    const tableRows = useMemo(() => loadedFonts.map((font) => ({
        id: font.id,
        fontName: font.family_name
    })), [loadedFonts])

    const totalPages = Math.max(1, Math.ceil(tableRows.length / itemsPerPage))

    // Se toman solo 8 elementos para renderizar la pagina actual
    const paginatedRows = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return tableRows.slice(startIndex, endIndex)
    }, [currentPage, tableRows])

    function getFontById(fontId) {
        return loadedFonts.find((font) => String(font.id) === String(fontId)) || null
    }

    function clampFontSize(value) {
        const parsed = Number(value)
        if (Number.isNaN(parsed)) return 0

        return Math.min(120, Math.max(0, Math.round(parsed)))
    }

    async function ensureFontFaceLoaded(font) {
        if (!font?.file_url) return

        const fontId = String(font.id)
        if (loadedFontFaceIdsRef.current.has(fontId)) return

        const face = new FontFace(font.family_name, `url(${font.file_url}) format("truetype")`)
        await face.load()
        document.fonts.add(face)
        loadedFontFaceIdsRef.current.add(fontId)
    }

    async function loadFonts() {
        setIsLoading(true)
        setErrorMessage('')

        try {
            const rows = await fetchFonts()
            await Promise.all(rows.map(async (font) => {
                try {
                    await ensureFontFaceLoaded(font)
                } catch {
                    // Si el archivo no existe o no carga, al menos mantenemos la configuración de DB.
                }
            }))

            setLoadedFonts(rows)

            const selected = {
                title: rows.find((font) => font.is_active_title)?.id || null,
                subtitle: rows.find((font) => font.is_active_subtitle)?.id || null,
                paragraph: rows.find((font) => font.is_active_paragraph)?.id || null
            }

            setSelectedFonts(selected)

            const titleSource = rows.find((font) => font.id === selected.title)
            const subtitleSource = rows.find((font) => font.id === selected.subtitle)
            const paragraphSource = rows.find((font) => font.id === selected.paragraph)

            const nextAppliedSizes = {
                title: titleSource?.title_size_px || appliedSizes.title,
                subtitle: subtitleSource?.subtitle_size_px || appliedSizes.subtitle,
                paragraph: paragraphSource?.paragraph_size_px || appliedSizes.paragraph
            }

            setAppliedSizes(nextAppliedSizes)
            setDraftSizes(nextAppliedSizes)
        } catch (error) {
            setErrorMessage(error.message || 'No se pudieron cargar las fuentes.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadFonts()
    }, [])

    // Maneja la carga de fuentes y las guarda en base de datos
    async function handleFontUpload(event) {
        const uploadedFiles = Array.from(event.target.files || [])

        if (uploadedFiles.length === 0) return

        const parsedFonts = uploadedFiles
            .map((file) => ({
                familyName: file.name.replace(/\.ttf$/i, '').trim(),
                file
            }))
            .filter((item) => item.familyName)
            .filter(Boolean)

        try {
            await Promise.all(
                parsedFonts.map(async ({ familyName, file }) => {
                    const formData = new FormData()
                    formData.append('familyName', familyName)
                    formData.append('fontFile', file)

                    await createFontRequest(formData)
                })
            )
            await loadFonts()
        } catch (error) {
            setErrorMessage(error.message || 'No se pudieron registrar las fuentes.')
        }

        event.target.value = ''
    }

    async function handleFontSelection(section, fontId) {
        try {
            await activateFontSectionRequest(fontId, section)
            await loadFonts()
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo activar la fuente.')
        }
    }

    function handleSizeChange(section, value) {
        setDraftSizes((prev) => ({
            ...prev,
            [section]: clampFontSize(value)
        }))
    }

    async function applyTextSizes() {
        const safeSizes = {
            title: clampFontSize(draftSizes.title),
            subtitle: clampFontSize(draftSizes.subtitle),
            paragraph: clampFontSize(draftSizes.paragraph)
        }

        const updatesByFontId = new Map()

        if (selectedFonts.title) {
            updatesByFontId.set(selectedFonts.title, {
                ...(updatesByFontId.get(selectedFonts.title) || {}),
                titleSizePx: safeSizes.title
            })
        }

        if (selectedFonts.subtitle) {
            updatesByFontId.set(selectedFonts.subtitle, {
                ...(updatesByFontId.get(selectedFonts.subtitle) || {}),
                subtitleSizePx: safeSizes.subtitle
            })
        }

        if (selectedFonts.paragraph) {
            updatesByFontId.set(selectedFonts.paragraph, {
                ...(updatesByFontId.get(selectedFonts.paragraph) || {}),
                paragraphSizePx: safeSizes.paragraph
            })
        }

        try {
            await Promise.all(
                Array.from(updatesByFontId.entries()).map(([fontId, payload]) => updateFontRequest(fontId, payload))
            )
            setAppliedSizes(safeSizes)
            await loadFonts()
        } catch (error) {
            setErrorMessage(error.message || 'No se pudieron aplicar los tamaños de texto.')
        }
    }

    // Actualiza variables CSS globales para que las clases title/subtitle/paragraph
    // reflejen la fuente seleccionada en cualquier parte de la app
    useEffect(() => {
        const root = document.documentElement
        const titleFont = getFontById(selectedFonts.title)?.family_name || 'Rubik'
        const subtitleFont = getFontById(selectedFonts.subtitle)?.family_name || 'Rubik'
        const paragraphFont = getFontById(selectedFonts.paragraph)?.family_name || 'Rubik'

        root.style.setProperty('--font-title', titleFont)
        root.style.setProperty('--font-subtitle', subtitleFont)
        root.style.setProperty('--font-paragraph', paragraphFont)
    }, [selectedFonts, loadedFonts])

    useEffect(() => {
        const root = document.documentElement
        root.style.setProperty('--size-title', `${appliedSizes.title}px`)
        root.style.setProperty('--size-subtitle', `${appliedSizes.subtitle}px`)
        root.style.setProperty('--size-paragraph', `${appliedSizes.paragraph}px`)
    }, [appliedSizes])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    function goToPreviousPage() {
        setCurrentPage((prevPage) => Math.max(1, prevPage - 1))
    }

    function goToNextPage() {
        setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))
    }

    async function handleHideFont(fontId) {
        try {
            await hideFontRequest(fontId)
            await loadFonts()
        } catch (error) {
            setErrorMessage(error.message || 'No se pudo ocultar la fuente.')
        }
    }

    return (
        <div className="font-chooser bg-bg-light text-text-light flex flex-col md:flex-row md:gap-6 p-6 rounded md:h-220">
            <div className='mt-6.5 ml-0 md:ml-6 gap-0.5 flex flex-col w-full'>
                <p className='title font-bold text-3xl'>Selector de tipografias</p>
                {isLoading && <p className='paragraph text-sm'>Cargando fuentes...</p>}
                {!!errorMessage && <p className='paragraph text-sm'>{errorMessage}</p>}
                <div className='font-loader flex flex-col'>
                    <label htmlFor="font-input" className='subtitle text-xl'>Elija la tipografia que desea cargar</label>
                    <input type="file" accept='.ttf' id="font-input" className='hover:cursor-pointer' multiple onChange={handleFontUpload} />
                </div>
                <hr />
                <div className="loaded-fonts">
                    <div className='table-div overflow-x-auto'>
                        <table className='min-w-full border-collapse text-left text-sm'>
                            <thead>
                                <tr className='border-b border-gray-300 bg-primary-light'>
                                    <th className='py-2 pr-4'>Fuente</th>
                                    <th className='py-2 pr-4'>Titulo</th>
                                    <th className='py-2 pr-4'>Subtitulo</th>
                                    <th className='py-2 pr-4'>Parrafo</th>
                                    <th className='py-2 pr-4'>Ocultar</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200 bg-secondary-light'>
                                {paginatedRows.map(({ id, fontName }) => (
                                    // Cada fila se visualiza con su propia fuente para vista previa real
                                    <tr key={id} className='border-b border-gray-200' style={{ fontFamily: fontName }}>
                                        <td className='py-2 pr-4'>{fontName}</td>
                                        <td className='py-2 pr-4'>
                                            <input
                                                type='radio'
                                                name='title-font'
                                                checked={String(selectedFonts.title) === String(id)}
                                                onChange={() => handleFontSelection('title', id)}
                                            />
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <input
                                                type='radio'
                                                name='subtitle-font'
                                                checked={String(selectedFonts.subtitle) === String(id)}
                                                onChange={() => handleFontSelection('subtitle', id)}
                                            />
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <input
                                                type='radio'
                                                name='paragraph-font'
                                                checked={String(selectedFonts.paragraph) === String(id)}
                                                onChange={() => handleFontSelection('paragraph', id)}
                                            />
                                        </td>
                                        <td className='py-2 pr-4'>
                                            <button
                                                type='button'
                                                className='paragraph rounded px-2 py-1'
                                                onClick={() => handleHideFont(id)}
                                            >
                                                Ocultar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {loadedFonts.length === 0 && (
                                    <tr>
                                        <td className='py-3 pr-4 paragraph' colSpan={5}>Aun no hay fuentes guardadas.</td>
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
                <hr />
                <div className="font-options w-100 flex flex-col">
                    <p className='subtitle font-bold text-2xl'>Tamaño de fuente (px)</p>
                    <label className='paragraph' htmlFor="title">Titulo</label>
                    <input
                        type="number"
                        id="title"
                        min='0'
                        max='120'
                        value={draftSizes.title}
                        onChange={(event) => handleSizeChange('title', event.target.value)}
                        required
                    />
                    <label className='paragraph' htmlFor="subtitle">Subtitulo</label>
                    <input
                        type="number"
                        id='subtitle'
                        min='0'
                        max='120'
                        value={draftSizes.subtitle}
                        onChange={(event) => handleSizeChange('subtitle', event.target.value)}
                        required
                    />
                    <label className='paragraph' htmlFor="paragraph">Parrafo</label>
                    <input
                        type="number"
                        id='paragraph'
                        min='0'
                        max='120'
                        value={draftSizes.paragraph}
                        onChange={(event) => handleSizeChange('paragraph', event.target.value)}
                        required
                    />
                    <button className='paragraph cursor-pointer' type='button' onClick={applyTextSizes}>Aplicar cambios</button>
                </div>
            </div>
            <hr className='mt-4 md:hidden' />
            <div className='mt-18'>
                <Preview />
            </div>
        </div>
    )
}