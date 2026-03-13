import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import paletteRoutes from './services/palettes/paletteRoutes.js'
import fontRoutes from './services/fonts/fontRoutes.js'
import authRoutes from './services/auth/authRoutes.js'

const app = express()
const port = Number(process.env.API_PORT || 3001)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsPath = path.resolve(__dirname, '../../public/uploads')

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(uploadsPath))

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/palettes', paletteRoutes)
app.use('/api/fonts', fontRoutes)

app.use((error, _req, res, _next) => {
    console.error(error)

    if (error?.code === '23505') {
        return res.status(409).json({ message: 'Duplicate value violates unique constraint' })
    }

    if (error?.code === '23514') {
        return res.status(400).json({ message: 'Data violates validation constraints' })
    }

    if (error?.message) {
        return res.status(400).json({ message: error.message })
    }

    res.status(500).json({ message: 'Unexpected server error' })
})

app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`)
})
