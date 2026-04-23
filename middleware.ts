import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const { pathname } = req.nextUrl

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        const loginUrl = new URL('/auth/signin', req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
      if ((token as { role?: string }).role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
