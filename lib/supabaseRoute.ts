// lib/supabaseRoute.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export function supabaseFromRequest(req: NextRequest) {
  // We return a NextResponse that callers can ignore if they don't need to mutate cookies
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the incoming request
        getAll() {
          return req.cookies.getAll()
        },
        // Write cookies onto the response (Supabase may set/clear auth cookies)
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // NextResponse.cookies.set(name, value, options)
            res.cookies.set(name, value, options as CookieOptions)
          })
        },
      },
    }
  )

  return { supabase, res }
}
