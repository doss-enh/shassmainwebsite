// Creates (or updates the password of) the first super_admin user.
// Usage: ADMIN_NAME="DOSS" ADMIN_EMAIL=doss@shassgift.com ADMIN_PASSWORD=... node scripts/seed-admin.mjs

import postgres from 'postgres'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {loadEnv, describeDatabase} from './lib/load-env.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv()
console.log(`[db] target: ${describeDatabase()}`)

const name = process.env.ADMIN_NAME || 'Admin'
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
  console.error('[seed-admin] Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables and re-run.')
  console.error('  Example: ADMIN_EMAIL=doss@shassgift.com ADMIN_PASSWORD=change-me npm run db:seed-admin')
  process.exit(1)
}

function hashPassword(pw) {
  const salt = crypto.randomBytes(16)
  const derived = crypto.scryptSync(pw, salt, 64)
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('[seed-admin] DATABASE_URL is not set (check .env.local).')
  process.exit(1)
}

const sql = postgres(connectionString, {max: 1})

try {
  const passwordHash = hashPassword(password)
  const rows = await sql`
    insert into app_user (name, email, password_hash, role, active)
    values (${name}, ${email}, ${passwordHash}, 'super_admin', true)
    on conflict (email) do update set password_hash = excluded.password_hash, active = true
    returning id, email, role
  `
  console.log('[seed-admin] Ready:', rows[0])
} catch (err) {
  console.error('[seed-admin] Failed:', err)
  process.exitCode = 1
} finally {
  await sql.end()
}
