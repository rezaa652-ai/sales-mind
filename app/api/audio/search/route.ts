/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseFromRequest } from '@/lib/supabaseRoute'

const EMB_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'

async function embedOne(text: string): Promise<number[]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: EMB_MODEL, input: text })
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`embed_failed: ${r.status} ${JSON.stringify(j).slice(0,200)}`)
  return j.data?.[0]?.embedding ?? []
}
export async function POST(req: NextRequest) {
  try {
    const { supabase } = supabaseFromRequest(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

    const body = await req.json().catch(()=> ({}))
    const q = (body?.q ?? '').toString().trim()
    const k = Math.max(1, Math.min(12, Number(body?.k ?? 5)))
    if (!q) return NextResponse.json({ error: 'missing_q' }, { status: 400 })

    const emb = await embedOne(q)
    if (!emb?.length) return NextResponse.json({ error: 'embed_empty' }, { status: 500 })

    const { data, error } = await supabase.rpc('call_search', {
      p_query_embedding: emb as any,
      p_match_count: k
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, items: data ?? [] })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'server_error' }, { status: 500 })
  }
}
