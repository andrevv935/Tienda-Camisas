import { Router } from 'express'
import {
    createPalette,
    hidePalette,
    listPalettes,
    setPaletteMode,
    updatePalette
} from './paletteService.js'

const router = Router()

router.get('/', async (_req, res, next) => {
    try {
        const palettes = await listPalettes()
        res.json(palettes)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { name, colors } = req.body

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'name is required' })
        }

        if (!colors || typeof colors !== 'object') {
            return res.status(400).json({ message: 'colors is required' })
        }

        const created = await createPalette({
            name: name.trim(),
            colors
        })

        return res.status(201).json(created)
    } catch (error) {
        next(error)
    }
})

router.patch('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: 'Invalid id' })
        }

        const { name, colors } = req.body
        const updated = await updatePalette({ id, name, colors })

        if (!updated) {
            return res.status(404).json({ message: 'Palette not found' })
        }

        return res.json(updated)
    } catch (error) {
        next(error)
    }
})

router.patch('/:id/mode', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const { mode } = req.body

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: 'Invalid id' })
        }

        const updated = await setPaletteMode({ id, mode })
        if (!updated) {
            return res.status(404).json({ message: 'Palette not found' })
        }

        return res.json(updated)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: 'Invalid id' })
        }

        const hidden = await hidePalette(id)
        if (!hidden) {
            return res.status(404).json({ message: 'Palette not found' })
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
