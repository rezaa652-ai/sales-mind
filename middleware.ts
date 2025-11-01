import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*', '/auth/:path*'],
}

export function middleware(req: NextRequest) {
  console.log(`[DEBUG-MW] ${req.method} ${req.nextUrl.pathname} -> ${req.headers.get('content-type')}`)
  return NextResponse.next()
}
