// app/auth/signout/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/auth', req.url))
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.headers.get('cookie') || undefined,
        set: () => {},
        remove: () => {},
      },
    }
  )
  await supabase.auth.signOut()
  return res
}
