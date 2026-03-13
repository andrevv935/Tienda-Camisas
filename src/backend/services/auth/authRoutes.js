import { Router } from 'express'
import { createUser, findUserByEmail, validateCredentials } from './authService.js'

const router = Router()

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' })
        }

        const existing = await findUserByEmail(String(email).trim().toLowerCase())
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' })
        }

        const created = await createUser({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            password: String(password),
            role: 'cliente'
        })

        return res.status(201).json(created)
    } catch (error) {
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' })
        }

        const user = await validateCredentials({
            email: String(email).trim().toLowerCase(),
            password: String(password)
        })

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        return res.json(user)
    } catch (error) {
        next(error)
    }
})

export default router
