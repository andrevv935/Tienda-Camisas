import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createProduct, listProducts } from './productService.js'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const productUploadDir = path.resolve(__dirname, '../../../../public/uploads/products')

if (!fs.existsSync(productUploadDir)) {
    fs.mkdirSync(productUploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, productUploadDir)
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname || '.png').toLowerCase() || '.png'
        const safeName = (file.originalname || 'producto')
            .replace(extension, '')
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')

        cb(null, `${safeName || 'producto'}-${Date.now()}${extension}`)
    }
})

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'))
        }

        cb(null, true)
    }
})

function parsePositiveInteger(value, fieldName) {
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`${fieldName} must be an integer greater than or equal to 0`)
    }

    return parsed
}

function parseSelectedColors(rawValue) {
    if (!rawValue) {
        throw new Error('selectedColors is required')
    }

    let parsed
    try {
        parsed = JSON.parse(rawValue)
    } catch {
        throw new Error('selectedColors must be a valid JSON array')
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('selectedColors must contain at least one color')
    }

    const normalized = parsed.map((color) => String(color).trim().toUpperCase())
    const isInvalid = normalized.some((color) => !/^#([0-9A-F]{6}|[0-9A-F]{3})$/i.test(color))
    if (isInvalid) {
        throw new Error('selectedColors contains an invalid hex color')
    }

    return Array.from(new Set(normalized))
}

router.get('/', async (_req, res, next) => {
    try {
        const products = await listProducts()
        return res.json(products)
    } catch (error) {
        next(error)
    }
})

router.post('/', upload.single('productImageInput'), async (req, res, next) => {
    try {
        const {
            productName,
            productDescription,
            productPrice,
            stockXS,
            stockS,
            stockM,
            stockL,
            stockXL,
            stockXXL,
            selectedColors
        } = req.body

        const name = String(productName || '').trim()
        if (!name) {
            return res.status(400).json({ message: 'productName is required' })
        }

        const price = Number(productPrice)
        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({ message: 'productPrice must be greater than or equal to 0' })
        }

        const created = await createProduct({
            name,
            description: String(productDescription || '').trim() || null,
            price,
            selectedColors: parseSelectedColors(selectedColors),
            stock: {
                xs: parsePositiveInteger(stockXS, 'stockXS'),
                s: parsePositiveInteger(stockS, 'stockS'),
                m: parsePositiveInteger(stockM, 'stockM'),
                l: parsePositiveInteger(stockL, 'stockL'),
                xl: parsePositiveInteger(stockXL, 'stockXL'),
                xxl: parsePositiveInteger(stockXXL, 'stockXXL')
            },
            imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null
        })

        return res.status(201).json(created)
    } catch (error) {
        next(error)
    }
})

export default router
