// Zero-Docker local Postgres for dev: PGlite (Postgres compiled to WASM) behind
// a real Postgres wire-protocol socket, so `postgres`, `psql`, or any Postgres
// client can connect to it exactly like a real server.
//
// Usage: node scripts/dev-db.mjs
// Then point DATABASE_URL at postgres://postgres@127.0.0.1:5433/postgres

import {PGlite} from '@electric-sql/pglite'
import {PGLiteSocketServer} from '@electric-sql/pglite-socket'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', '.pgdata')
const port = Number(process.env.DEV_DB_PORT || 5434)
const host = '127.0.0.1'

const db = new PGlite(dataDir)
const server = new PGLiteSocketServer({db, port, host, maxConnections: 10})

await server.start()

console.log(`[dev-db] PGlite listening on postgres://postgres@${host}:${port}/postgres`)
console.log(`[dev-db] Data persisted at ${dataDir}`)
console.log('[dev-db] Run "npm run db:migrate" once to create tables, then "npm run dev" in another terminal.')

process.on('SIGINT', async () => {
  console.log('\n[dev-db] Shutting down…')
  await server.stop()
  await db.close()
  process.exit(0)
})
