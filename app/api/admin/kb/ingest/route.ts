// app/api/admin/kb/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { embedText } from '@/lib/embedding'
import { chunkText } from '@/lib/chunk'
import { sbAdmin } from '@/lib/sbAdmin'

function makeClient(req: NextRequest) {
  const res = NextResponse.next()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )
}

async function assertAdmin(req: NextRequest) {
  const supabase = makeClient(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthenticated')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const r = await fetch(`${url}/rest/v1/app_users?user_id=eq.${user.id}&select=role`, {
    headers: { apikey:key, Authorization:`Bearer ${key}` }
  })
  const rows = await r.json()
  if (!Array.isArray(rows) || rows[0]?.role !== 'admin') throw new Error('forbidden')
  return user
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req)
    const { title, url, text } = await req.json() as { title:string, url?:string, text:string }
    if (!title || !text) return NextResponse.json({ error:'title and text required' }, { status:400 })

    // upsert source
    const existing = await sbAdmin(`/kb_sources?title=eq.${encodeURIComponent(title)}&select=*`)
    const source_id = existing[0]?.id || (await sbAdmin('/kb_sources', {
      method:'POST',
      headers:{ Prefer:'return=representation' },
      body: JSON.stringify([{ title, kind:'internal', url: url||null }])
    }))[0].id

    // chunk + embed + insert
    const chunks = chunkText(text)
    const rows:any[] = []
    for (const c of chunks) {
      const emb = await embedText(c)
      rows.push({ source_id, content: c, token_count: Math.ceil(c.length/4), embedding: emb })
    }
    await sbAdmin('/kb_chunks', { method:'POST', body: JSON.stringify(rows) })

    return NextResponse.json({ ok:true, source_id, chunks: rows.length })
  } catch (e:any) {
    const msg = e?.message || 'ingest failed'
    const code = /unauthenticated|forbidden/.test(msg) ? 403 : 500
    return NextResponse.json({ error: msg }, { status: code })
  }
}
