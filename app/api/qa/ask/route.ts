export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function s() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

type AskBody = {
  lang?: 'sv'|'en'
  companyId?: string
  profileId?: string
  goal?: string
  segment?: string
  channel?: string
  valueLine?: string
  address?: string
  question: string
}

async function fetchById(supabase: ReturnType<typeof s>, id: string, candidates: string[]) {
  for (const table of candidates) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle()
    if (!error && data) return { table, data }
  }
  return { table: '', data: null as any }
}

// trim/normalize the LLM output to the seven fields
function normalize(o: any) {
  const clip = (x: any, n: number) => String(x ?? '').trim().slice(0, n)
  const twoSentences = (s: any) => {
    const parts = String(s ?? '').trim().split(/(?<=[.!?])\s+/)
    return (parts.slice(0, 2).join(' ')).slice(0, 500)
  }
  return {
    one_liner: clip(o?.one_liner, 180),
    why: clip(typeof o?.why === 'object' ? [
      o.why.qfocus, o.why.personal, o.why.biases, o.why.norms, o.why.law, o.why.implication
    ].filter(Boolean).join(' ') : o?.why, 800),
    ack: clip(o?.ack, 160),
    short_script: twoSentences(o?.short_script),
    full_script: clip(o?.full_script, 900),
    math: clip(o?.math, 220),
    next_step: clip(o?.next_step, 260),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: AskBody = await req.json()
    if (!body?.question || typeof body.question !== 'string') {
      return NextResponse.json({ error: 'missing_question' }, { status: 400 })
    }
    const lang = body.lang === 'en' ? 'en' : 'sv'

    const supabase = s()

    // OPTIONAL: load company/profile records (from your “company” and “profile” pages’ tables)
    let company: any = null
    if (body.companyId) {
      const c = await fetchById(supabase, body.companyId, ['companies','company','organizations'])
      company = c.data
    }
    let profile: any = null
    if (body.profileId) {
      const p = await fetchById(supabase, body.profileId, ['profiles','sales_profiles','reps'])
      profile = p.data
    }

    // Build prompts (keeps your seven blocks)
    const sysParts = [
      lang === 'sv'
        ? 'Du är en professionell säljcoach. Svara alltid på svenska.'
        : 'You are a professional sales coach. Always answer in English.',
      'Returnera STRIKT JSON med fälten: one_liner, why, ack, short_script, full_script, math, next_step.',
      'short_script: max 2 meningar. full_script: 90–120 ord.',
    ]

    if (profile) {
      // common profile fields if they exist
      const tone = profile.tone || profile.preferred_tone || profile.voice || ''
      const compliance = profile.compliance || profile.compliance_rules || ''
      const proof = profile.proof || profile.proof_points || ''
      const callback = profile.callback_windows || profile.callback || ''

      if (tone) sysParts.push(`Stil/ton: ${tone}`)
      if (compliance) sysParts.push(`Compliance: ${compliance}`)
      if (proof) sysParts.push(`Bevis/Proof: ${proof}`)
      if (callback) sysParts.push(`Föreslå tider från: ${callback}`)
    }

    const sys = sysParts.join('\n')

    const userPieces = [
      `Mål: ${body.goal || ''}`,
      `Signal: ${body.question}`,
      `Segment: ${body.segment || ''}`,
      `Kanal: ${body.channel || ''}`,
      `Värderad rad: ${body.valueLine || ''}`,
      `Adress: ${body.address || ''}`,
    ]
    if (company) {
      const name = company.name || company.title || ''
      userPieces.push(`Företag: ${name}`)
      // Add a compact JSON snapshot if helpful
      const extra = { industry: company.industry, market: company.market, value_prop: company.value_prop, geo: company.geo }
      if (Object.values(extra).some(Boolean)) {
        userPieces.push('Företagsdata: ' + JSON.stringify(extra))
      }
    }
    if (profile) {
      const name = profile.name || ''
      userPieces.push(`Profil: ${name}`)
    }

    const user = userPieces.join(' | ')

    // OpenAI call
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 500 })

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ]
      })
    })

    const raw = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return NextResponse.json({ error: 'openai_failed', detail: raw }, { status: 502 })
    }

    const content = raw?.choices?.[0]?.message?.content || '{}'
    let obj: any
    try { obj = JSON.parse(content) } catch { obj = {} }

    const out = normalize(obj)
    return NextResponse.json({ ok: true, ...out })
  } catch (e: any) {
    return NextResponse.json({ error: 'ask_route_error', detail: e?.message || String(e) }, { status: 500 })
  }
}
