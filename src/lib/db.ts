import postgres from 'postgres'

declare global {
  // eslint-disable-next-line no-var
  var __shassSql: ReturnType<typeof postgres> | undefined
}

// Falls back to an unreachable placeholder connection string so importing
// this module never crashes pages that don't touch the database (e.g. the
// Sanity-driven storefront pages). Actual queries against the placeholder
// simply fail and are caught by the query helpers in src/lib/db/*.
const connectionString = process.env.DATABASE_URL || 'postgres://unconfigured@127.0.0.1:1/unconfigured'

function createClient() {
  return postgres(connectionString, {max: 10, connect_timeout: 5})
}

// Reuse the connection pool across hot reloads / module re-evaluation in dev.
export const sql = globalThis.__shassSql ?? createClient()
if (process.env.NODE_ENV !== 'production') globalThis.__shassSql = sql

export const isDatabaseConfigured = !!process.env.DATABASE_URL
