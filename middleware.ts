import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  console.log(`[DEBUG-MW] ${req.method} ${req.nextUrl.pathname} -> ${req.headers.get('content-type')}`)
  return NextResponse.next()
}

// ✅ Only run middleware for /app and /api routes
// Exclude /auth routes completely
export const config = {
  matcher: ['/app/:path*', '/api/:path*'],
}
