import {NextRequest, NextResponse} from 'next/server'
import {createSession, findUserByEmail, verifyPassword, SESSION_COOKIE} from '@/lib/auth'
import {logAudit} from '@/lib/db/auditLog'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const email = String(form.get('email') || '').trim()
  const password = String(form.get('password') || '')
  const next = String(form.get('next') || '/admin/dashboard')

  function failure() {
    const url = new URL('/admin/login', req.url)
    url.searchParams.set('error', '1')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, {status: 303})
  }

  const user = await findUserByEmail(email).catch(() => null)
  if (!user || !user.active || !verifyPassword(password, user.password_hash)) {
    return failure()
  }

  const token = await createSession(user.id)
  await logAudit({actor: user.email, action: 'staff.login', target: user.email})

  const res = NextResponse.redirect(new URL(next, req.url), {status: 303})
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
