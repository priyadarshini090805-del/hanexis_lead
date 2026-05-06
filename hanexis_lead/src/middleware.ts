import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/login', '/register', '/api']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = publicRoutes.some(route => pathname.startsWith(route))

  const token = req.cookies.get('sb-ylwkzbcwmoqafldmtngc-auth-token')?.value
    || req.cookies.get('supabase-auth-token')?.value

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}