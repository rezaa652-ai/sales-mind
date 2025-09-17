// @ts-nocheck
// Synka Supabase-session till server-cookies så SSR & API:er ser användaren
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  // Kör bara på /app och på auth-callbacks för säkerhets skull
  const path = req.nextUrl.pathname
  const shouldRun =
    path.startsWith('/app') ||
    path.startsWith('/auth') // täcker ev. auth flows

  if (!shouldRun) return res

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

  // Denna call gör att libbet uppdaterar/ förnyar cookies vid behov
  await supabase.auth.getUser()

  return res
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*'],
}
