// app/api/calls/upload/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

function makeClient(req: NextRequest, res: NextResponse){
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(){ return req.cookies.getAll() },
        setAll(c){ c.forEach(({name,value,options})=>res.cookies.set(name,value,options as CookieOptions)) }
      }
    }
  )
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  try {
    const supabase = makeClient(req, res)
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'missing_file' }, { status: 400 })

    const key = `${user.id}/${Date.now()}-${(file as any).name || 'call'}`

    // Upload to private bucket 'calls'
    const up = await supabase.storage.from('calls').upload(key, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false
    })
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 })

    // Insert DB row
    const { data, error: dberr } = await supabase
      .from('calls')
      .insert({
        owner: user.id,
        filename: key,
        mime_type: file.type || null,
        size_bytes: (file as any).size ?? null
      })
      .select()
      .single()

    if (dberr) return NextResponse.json({ error: dberr.message }, { status: 500 })

    return NextResponse.json({ ok: true, item: data })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'upload_failed' }, { status: 500 })
  }
}
