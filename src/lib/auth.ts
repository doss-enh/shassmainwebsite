import crypto from 'crypto'
import {cookies} from 'next/headers'
import {sql} from './db'

export const SESSION_COOKIE = 'shass_staff_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export type StaffUser = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

// --- Password hashing: scrypt, format "scrypt:<saltHex>:<derivedHex>" ---

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16)
  const derived = crypto.scryptSync(password, salt, 64)
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const [, saltHex, derivedHex] = parts
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(derivedHex, 'hex')
  const actual = crypto.scryptSync(password, salt, expected.length)
  if (actual.length !== expected.length) return false
  return crypto.timingSafeEqual(actual, expected)
}

// --- Sessions: opaque token in the cookie, only its SHA-256 hash stored ---

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await sql`
    insert into staff_session (user_id, token_hash, expires_at)
    values (${userId}, ${hashToken(token)}, ${expiresAt})
  `
  return token
}

export async function revokeSession(token: string): Promise<void> {
  await sql`delete from staff_session where token_hash = ${hashToken(token)}`
}

export async function getSessionUser(token: string | undefined): Promise<StaffUser | null> {
  if (!token) return null
  try {
    const rows = await sql<StaffUser[]>`
      select u.id, u.name, u.email, u.role, u.active
      from staff_session s
      join app_user u on u.id = s.user_id
      where s.token_hash = ${hashToken(token)}
        and s.expires_at > now()
        and u.active = true
      limit 1
    `
    return rows[0] || null
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<StaffUser | null> {
  const store = await cookies()
  return getSessionUser(store.get(SESSION_COOKIE)?.value)
}

export async function findUserByEmail(email: string) {
  const rows = await sql<
    {id: string; name: string; email: string; password_hash: string; role: string; active: boolean}[]
  >`select id, name, email, password_hash, role, active from app_user where lower(email) = lower(${email}) limit 1`
  return rows[0] || null
}
