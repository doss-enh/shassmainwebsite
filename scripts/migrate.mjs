// Applies db/schema.sql against DATABASE_URL. Idempotent (every statement is
// CREATE ... IF NOT EXISTS), so it's safe to run repeatedly — there is no
// migration framework here on purpose: one schema file, hand-edited, re-run.
//
// Usage: node scripts/migrate.mjs   (reads .env.local automatically)

import postgres from 'postgres'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {loadEnv, describeDatabase} from './lib/load-env.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv()
console.log(`[db] target: ${describeDatabase()}`)

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('[migrate] DATABASE_URL is not set (check .env.local).')
  process.exit(1)
}

const schema = readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8')
const sql = postgres(connectionString, {max: 1})

try {
  await sql.unsafe(schema)
  console.log('[migrate] Schema applied successfully.')
} catch (err) {
  console.error('[migrate] Failed:', err)
  process.exitCode = 1
} finally {
  await sql.end()
}
