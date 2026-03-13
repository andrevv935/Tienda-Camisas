import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    createFont,
    hideFont,
    listFonts,
    setFontActiveSection,
    updateFont
} from './fontService.js'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fontUploadDir = path.resolve(__dirname, '../../../../public/uploads/fonts')

if (!fs.existsSync(fontUploadDir)) {
    fs.mkdirSync(fontUploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, fontUploadDir)
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname
            .replace(/\.ttf$/i, '')
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')

        cb(null, `${safeName}-${Date.now()}.ttf`)
    }
})

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (!file.originalname.toLowerCase().endsWith('.ttf')) {
            return cb(new Error('Only .ttf files are allowed'))
        }

        cb(null, true)
    }
})

router.get('/', async (_req, res, next) => {
    try {
        const fonts = await listFonts()
        res.json(fonts)
    } catch (error) {
        next(error)
    }
})

router.post('/', upload.single('fontFile'), async (req, res, next) => {
    try {
        const familyNameFromBody = req.body?.familyName
        const familyNameFromFile = req.file?.originalname?.replace(/\.ttf$/i, '').trim()
        const familyName = (familyNameFromBody || familyNameFromFile || '').trim()
        const fileUrl = req.file ? `/uploads/fonts/${req.file.filename}` : (req.body?.fileUrl || null)

        if (!familyName) {
            return res.status(400).json({ message: 'familyName is required' })
        }

        const created = await createFont({ familyName, fileUrl })
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

        const { familyName, fileUrl, titleSizePx, subtitleSizePx, paragraphSizePx } = req.body
        const sizeEntries = [
            ['titleSizePx', titleSizePx],
            ['subtitleSizePx', subtitleSizePx],
            ['paragraphSizePx', paragraphSizePx]
        ]

        for (const [label, value] of sizeEntries) {
            if (value === undefined || value === null) continue

            if (!Number.isInteger(value) || value < 0 || value > 120) {
                return res.status(400).json({ message: `${label} must be an integer between 0 and 120` })
            }
        }

        const updated = await updateFont({
            id,
            familyName,
            fileUrl,
            titleSizePx,
            subtitleSizePx,
            paragraphSizePx
        })

        if (!updated) {
            return res.status(404).json({ message: 'Font not found' })
        }

        return res.json(updated)
    } catch (error) {
        next(error)
    }
})

router.patch('/:id/activate', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const { section } = req.body

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: 'Invalid id' })
        }

        const updated = await setFontActiveSection({ id, section })
        if (!updated) {
            return res.status(404).json({ message: 'Font not found' })
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

        const hidden = await hideFont(id)
        if (!hidden) {
            return res.status(404).json({ message: 'Font not found' })
        }

        return res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
