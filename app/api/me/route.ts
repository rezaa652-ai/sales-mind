// app/api/me/route.ts
// @ts-nocheck
import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function makeClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
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
}

export async function GET(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  const supabase = makeClient(req, res)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })
  return NextResponse.json({ email: user?.email || null })
}
