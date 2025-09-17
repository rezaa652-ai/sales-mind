// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
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

}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  try {
    const { access_token, refresh_token } = await req.json()
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'missing tokens' }, { status: 400 })
    }
    const supabase = makeClient(req, res)
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) return NextResponse.json({ error: error.message }, { status: 401 })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'bad request' }, { status: 400 })
  }
}
