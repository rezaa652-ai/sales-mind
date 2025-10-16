// @ts-nocheck
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Single middleware with electricity API bypass + Supabase session sync
export async function middleware(req: NextRequest) {
  // Bypass: allow public access + avoid auth redirect/HTML for this API
  const { pathname } = new URL(req.url)
  if (pathname.startsWith('/api/geo/electricity')) {
    return NextResponse.next()
  }

  // --- Supabase auth cookie sync (your existing logic) ---
  let res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options) => res.cookies.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  )

  // Update/refresh cookies if needed
  await supabase.auth.getUser()

  return res
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*', '/api/:path*'],
}
