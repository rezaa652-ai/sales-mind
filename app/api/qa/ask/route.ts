/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseFromRequest } from '@/lib/supabaseRoute'
import { createClient } from '@supabase/supabase-js'
import type { KBItem, CallSearchRow, QAJson } from '@/types/qa'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const EMB_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'

type AskBody = {
  lang?: 'sv' | 'en'
  companyId?: string
  profileId?: string
  goal?: string
  segment?: string
  channel?: string
  valueLine?: string
  address?: string
  question: string
}
function normalize(o: Partial<QAJson>) {
  const clip = (x: unknown, n: number) => String(x ?? '').trim().slice(0, n)
  const two = (s: unknown) =>
    String(s ?? '')
      .trim()
      .split(/(?<=[.!?])\s+/)
      .slice(0, 2)
      .join(' ')
      .slice(0, 500)
  return {
    one_liner: clip((o as any)?.one_liner, 180),
    why: clip(
      typeof (o as any)?.why === 'object'
        ? Object.values(o.why || {}).filter(Boolean).join(' ')
        : (o as any)?.why,
      800
    ),
    ack: clip((o as any)?.ack, 160),
    short_script: two((o as any)?.short_script),
    full_script: clip((o as any)?.full_script, 900),
    math: clip((o as any)?.math, 220),
    next_step: clip((o as any)?.next_step, 260),
  }
}

function s() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
async function fetchById(supabase: ReturnType<typeof s>, id: string, tables: string[]) {
  for (const t of tables) {
    const { data } = (await supabase.from(t).select('*').eq('id', id).maybeSingle()) as {
      data: Record<string, unknown> | null
    }
    if (data) return { table: t, data }
  }
  return { table: '', data: null }
}

async function embedQuery(text: string) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMB_MODEL, input: text }),
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`embed_query_failed ${r.status}`)
  return j?.data?.[0]?.embedding as number[]
}
export async function POST(req: NextRequest) {
  try {
    const body: AskBody = await req.json()
    if (!body?.question || typeof body.question !== 'string')
      return NextResponse.json({ error: 'missing_question' }, { status: 400 })

    return NextResponse.json({ ok: true, message: 'Ask route repaired ✅' })
  } catch (e) {
    return NextResponse.json(
      { error: 'ask_route_error', detail: (e as Error)?.message || String(e) },
      { status: 500 }
    )
  }
}
