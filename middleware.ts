// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Skydda endast /app/*
  if (!req.nextUrl.pathname.startsWith('/app')) return NextResponse.next()

  // Supabase sätter dessa cookies: sb-access-token, sb-refresh-token
  const hasSession = Boolean(req.cookies.get('sb-access-token')?.value)

  if (!hasSession) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/app/:path*'] }
