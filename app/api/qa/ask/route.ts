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

// event log writer (soft-tries different table names)
async function tryLogEvent(supabase: ReturnType<typeof s>, payload: any) {
  const tables = ['qa_events', 'events', 'qa_logs']
  for (const t of tables) {
    const { data, error } = await supabase.from(t).insert(payload).select('id').maybeSingle()
    if (!error && data?.id) return data.id as string
  }
  return ''
}

// fetch top liked KB items for prompt context
async function fetchKBContext(
  supabase: ReturnType<typeof s>,
  companyId?: string,
  profileId?: string,
  question?: string
) {
  const tables = ['kb', 'knowledge_base', 'kb_items']
  for (const t of tables) {
    let q = supabase
      .from(t)
      .select('question,one_liner,short_script,full_script,why')
      .eq('liked', true)
      .order('created_at', { ascending: false })
      .limit(12)

    if (companyId) q = q.eq('company_id', companyId)
    if (profileId) q = q.eq('profile_id', profileId)

    const { data, error } = await q
    if (!error && Array.isArray(data) && data.length) {
      const sig = (question||'').toLowerCase().split(/\W+/).filter(Boolean)
      const score = (row:any) => {
        const toks = String(row.question||'').toLowerCase().split(/\W+/)
        const set = new Set(toks); let s=0; for (const w of sig) if(set.has(w)) s++
        return s
      }
      const top = [...data].sort((a,b)=>score(b)-score(a)).slice(0,3)
      return top.map(r=>{
        const brief = r.one_liner || r.short_script || r.full_script || r.why || ''
        return `Q: ${r.question} -> ${brief}`
      })
    }
  }
  return []
}

// normalize model output to the 7 fields
function normalize(o: any) {
  const clip = (x: any, n: number) => String(x ?? '').trim().slice(0, n)
  const twoSentences = (s: any) => {
    const parts = String(s ?? '').trim().split(/(?<=[.!?])\s+/)
    return (parts.slice(0, 2).join(' ')).slice(0, 500)
  }
  return {
    one_liner: clip(o?.one_liner, 180),
    why: clip(typeof o?.why === 'object'
      ? [o.why.qfocus, o.why.personal, o.why.biases, o.why.norms, o.why.law, o.why.implication].filter(Boolean).join(' ')
      : o?.why, 800),
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

    // optional: load company & profile rows
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

    // system prompt
    const sysParts = [
      lang === 'sv'
        ? 'Du är en professionell säljcoach. Svara alltid på svenska.'
        : 'You are a professional sales coach. Always answer in English.',
      'Returnera STRIKT JSON med fälten: one_liner, why, ack, short_script, full_script, math, next_step.',
      'short_script: max 2 meningar. full_script: 90–120 ord.'
    ]
    if (profile) {
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

    // user prompt (+ liked KB context)
    const kbSnippets = await fetchKBContext(supabase, body.companyId, body.profileId, body.question)
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
      const extra = {
        industry: company.industry,
        market: company.market,
        value_prop: company.value_prop,
        geo: company.geo
      }
      if (Object.values(extra).some(Boolean)) {
        userPieces.push('Företagsdata: ' + JSON.stringify(extra))
      }
    }
    if (profile) {
      const name = profile.name || ''
      userPieces.push(`Profil: ${name}`)
    }
    if (kbSnippets.length) {
      userPieces.unshift('LIKED_KB (use these patterns if relevant): ' + kbSnippets.join(' || '))
    }
    const user = userPieces.join(' | ')

    // OpenAI
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

    let obj: any
    try { obj = JSON.parse(raw?.choices?.[0]?.message?.content || '{}') } catch { obj = {} }
    const out = normalize(obj)

    // log event in Supabase
    const eventId = await tryLogEvent(supabase, {
      company_id: body.companyId || null,
      profile_id: body.profileId || null,
      goal: body.goal || null,
      segment: body.segment || null,
      channel: body.channel || null,
      value_line: body.valueLine || null,
      address: body.address || null,
      question: body.question,
      outputs: out
    })

    return NextResponse.json({ ok: true, event_id: eventId, ...out })
  } catch (e: any) {
    return NextResponse.json({ error: 'ask_route_error', detail: e?.message || String(e) }, { status: 500 })
  }
}
