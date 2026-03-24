import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isDashboard = nextUrl.pathname.startsWith('/dashboard')
  const isConta = nextUrl.pathname.startsWith('/conta')

  if ((isDashboard || isConta) && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isDashboard) {
    const role = session?.user?.role
    if (role !== 'OPERATOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/conta/:path*'],
}
