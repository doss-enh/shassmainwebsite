import {NextRequest, NextResponse} from 'next/server'

const COOKIE_NAME = 'shass_admin_session'

async function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-only-insecure-secret'
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, [
    'sign',
  ])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function isValidToken(token: string | undefined) {
  if (!token) return false
  const [issuedAt, signature] = token.split('.')
  if (!issuedAt || !signature) return false
  return (await sign(issuedAt)) === signature
}

export async function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!(await isValidToken(token))) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
