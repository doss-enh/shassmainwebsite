import {NextRequest, NextResponse} from 'next/server'
import {createSessionToken, COOKIE_NAME} from '@/lib/auth'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const password = String(form.get('password') || '')
  const next = String(form.get('next') || '/admin/dashboard')

  const expected = process.env.ADMIN_CONSOLE_PASSWORD
  if (!expected || password !== expected) {
    const url = new URL('/admin/login', req.url)
    url.searchParams.set('error', '1')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, {status: 303})
  }

  const res = NextResponse.redirect(new URL(next, req.url), {status: 303})
  res.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
