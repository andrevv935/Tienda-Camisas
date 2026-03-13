import bcrypt from 'bcryptjs'
import sql from '../../database/db.js'

export async function findUserByEmail(email) {
    const [user] = await sql`
        SELECT id, name, email, role, password_hash
        FROM users
        WHERE email = ${email}
        LIMIT 1
    `

    return user || null
}

export async function createUser({ name, email, password, role = 'cliente' }) {
    const passwordHash = await bcrypt.hash(password, 10)

    const [created] = await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name}, ${email}, ${passwordHash}, ${role})
        RETURNING id, name, email, role
    `

    return created
}

export async function validateCredentials({ email, password }) {
    const user = await findUserByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return null

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
}
