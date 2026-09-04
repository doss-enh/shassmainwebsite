import {NextRequest, NextResponse} from 'next/server'
import {revokeSession, SESSION_COOKIE} from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (token) await revokeSession(token).catch(() => {})

  const res = NextResponse.redirect(new URL('/admin/login', req.url), {status: 303})
  res.cookies.delete(SESSION_COOKIE)
  return res
}
