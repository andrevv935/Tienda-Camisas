import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sql from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function initTables() {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSql = await fs.readFile(schemaPath, 'utf8')

    await sql.unsafe(schemaSql)
    console.log('Tablas creadas/validadas correctamente.')
}

initTables()
    .catch((error) => {
        console.error('Error al crear tablas:', error)
        process.exitCode = 1
    })
    .finally(async () => {
        await sql.end({ timeout: 5 })
    })