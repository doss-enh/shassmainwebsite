import {NextRequest, NextResponse} from 'next/server'

const COOKIE_NAME = 'shass_staff_session'

// Cheap, Edge-safe presence check only — redirects the common "not logged in
// at all" case fast. The authoritative check (does this session still exist
// in Postgres, is the user still active) happens in the admin layout, which
// runs as a Node.js server component and can reach the database.
export function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
