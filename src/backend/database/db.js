import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL

if (!connectionString) {
	throw new Error('Missing SUPABASE_DB_URL or DATABASE_URL in environment variables.')
}

const sql = postgres(connectionString, {
	ssl: 'require'
})

export default sql