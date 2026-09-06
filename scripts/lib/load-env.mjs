// Loads env the way `next dev` does, so a script run from the terminal talks
// to the same database the dev server does.
//
// This matters: .env.development.local holds the local PGlite URL and
// .env.local holds the Neon production one. Scripts that loaded only
// .env.local were pointing at production — `npm run db:seed-admin` would have
// written a user straight to the live database.
//
// Next's precedence in development is .env.development.local > .env.local >
// .env, and dotenv keeps the first value it sees, so loading in that order
// reproduces it. Set DATABASE_ENV=production to deliberately target the
// deployed database instead.

import path from 'node:path'
import {existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {config} from 'dotenv'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const FILES =
  process.env.DATABASE_ENV === 'production'
    ? ['.env.production.local', '.env.local', '.env']
    : ['.env.development.local', '.env.local', '.env']

export function loadEnv() {
  for (const file of FILES) {
    const full = path.join(root, file)
    if (existsSync(full)) config({path: full, quiet: true})
  }
  return process.env
}

/** Host:port of the configured database, safe to print (no credentials). */
export function describeDatabase() {
  const url = process.env.DATABASE_URL
  if (!url) return '(DATABASE_URL not set)'
  try {
    const {hostname, port} = new URL(url)
    const local = hostname === '127.0.0.1' || hostname === 'localhost'
    return `${hostname}${port ? `:${port}` : ''} ${local ? '(local)' : '(REMOTE)'}`
  } catch {
    return '(unparseable DATABASE_URL)'
  }
}
