/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function makeClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options as CookieOptions)
          })
        },
      },
    }
  )
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({})
  try {
    const supabase = makeClient(req, res)
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { callId, path, filename, mime_type, size_bytes } = body

    if (!callId || !path || !filename) {
      return NextResponse.json({ error: 'missing_call_fields' }, { status: 400 })
    }

    const { error: insErr } = await supabase.from('calls').insert({
      id: callId,
      owner: user.id,
      filename,
      file_path: path,
      mime_type: mime_type ?? null,
      size_bytes: size_bytes ?? null,
      created_at: new Date().toISOString(),
    })

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, callId, path })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'register_failed' }, { status: 500 })
  }
}
