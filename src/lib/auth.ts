import {cookies} from 'next/headers'
import crypto from 'crypto'

const COOKIE_NAME = 'shass_admin_session'

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'dev-only-insecure-secret'
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function createSessionToken() {
  const issuedAt = Date.now().toString()
  return `${issuedAt}.${sign(issuedAt)}`
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false
  const [issuedAt, signature] = token.split('.')
  if (!issuedAt || !signature) return false
  return sign(issuedAt) === signature
}

export async function isAuthenticated() {
  const store = await cookies()
  return isValidSessionToken(store.get(COOKIE_NAME)?.value)
}

export {COOKIE_NAME}
