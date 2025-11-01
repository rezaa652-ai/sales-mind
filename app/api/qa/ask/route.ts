/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/qa/ask/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import type { KBItem, CallSearchRow, QAJson } from '@/types/qa'
import { supabaseFromRequest } from '@/lib/supabaseRoute'
import { createClient } from '@supabase/supabase-js'
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const EMB_MODEL = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small'
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
function normalize(o: Partial<QAJson>) {
  const clip = (x: unknown,n:number)=>String(x??'').trim().slice(0,n)
  const two=(s: unknown)=>String(s??'').trim().split(/(?<=[.!?])\s+/).slice(0,2).join(' ').slice(0,500)
  return {
    one_liner:   clip(o?.one_liner, 180),
    why:         clip(typeof o?.why === 'object'
      ? [o.why.qfocus,o.why.personal,o.why.biases,o.why.norms,o.why.law,o.why.implication].filter(Boolean).join(' ')
      : o?.why, 800),
    ack:         clip(o?.ack, 160),
    short_script: two(o?.short_script),
    full_script: clip(o?.full_script, 900),
    math:        clip(o?.math, 220),
    next_step:   clip(o?.next_step, 260),
  }
// --- helpers (company/profile/kb) ---
function s() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth:{ persistSession:false } }
  )
async function fetchById(supabase: ReturnType<typeof s>, id: string, tables: string[]) {
  for (const t of tables) {
    const { data } = await supabase.from(t).select('*').eq('id', id).maybeSingle()
    if (data) return { table: t, data }
  return { table: '', data: null }
async function fetchKBContext(supabase: ReturnType<typeof s>, companyId?: string, profileId?: string, question?: string) {
  const tables = ['kb','knowledge_base','kb_items']
    let q = supabase.from(t).select('question,one_liner,short_script,full_script,why').order('created_at',{ascending:false}).limit(12)
    if (companyId) q = q.eq('company_id', companyId)
    if (profileId) q = q.eq('profile_id', profileId)
    const { data } = await q as unknown as { data: KBItem[] }
    if (Array.isArray(data) && data.length) {
      const sig = (question||'').toLowerCase().split(/\W+/).filter(Boolean)
      const score = (row: CallSearchRow)=>{ const toks=String(row.question||'').toLowerCase().split(/\W+/); const set=new Set(toks); let s=0; for(const w of sig) if(set.has(w)) s++; return s }
      const top = [...data].sort((a,b)=>score(b)-score(a)).slice(0,3)
      return top.map(r=>{
        const brief = r.one_liner || r.short_script || r.full_script || r.why || ''
        return `Q: ${r.question} -> ${brief}`
      })
    }
  return []
// --- NEW: call transcript context ---
async function embedQuery(text: string) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ model: EMB_MODEL, input: text })
  })
  const j = await r.json()
  if (!r.ok) throw new Error(`embed_query_failed ${r.status}`)
  return j?.data?.[0]?.embedding as number[]
export async function POST(req: NextRequest) {
  try {
    const body: AskBody = await req.json()
    if (!body?.question || typeof body.question !== 'string') {
      return NextResponse.json({ error: 'missing_question' }, { status: 400 })
    const lang = body.lang === 'en' ? 'en' : 'sv'
    // cookie-authenticated supabase (we need auth.uid)
    const { supabase } = supabaseFromRequest(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })
    // anon supabase for cross-table lookups (as before)
    const anon = s()
    let company: unknown = null
    if (body.companyId) {
      const c = await fetchById(anon, body.companyId, ['companies','company','organizations'])
      company = c.data
    let profile: unknown = null
    if (body.profileId) {
      const p = await fetchById(anon, body.profileId, ['profiles','sales_profiles','reps'])
      profile = p.data
    // System prompt
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
    const sys = sysParts.join('\n')
    const kbSnippets = await fetchKBContext(anon, body.companyId, body.profileId, body.question)
    // NEW: call transcript context (top 5)
    let callSnippets: string[] = []
    try {
      const qEmb = await embedQuery(body.question)
      const { data: rows, error } = await supabase.rpc('call_search', {
        p_user_id: user.id,
        p_query_embedding: qEmb,
        p_match_count: 5
      if (!error && Array.isArray(rows)) {
        callSnippets = rows.map((r: unknown)=> r.content).slice(0,5)
      }
    } catch (e) {
      console.warn('call_search_failed', (e as any)?.message)
    const userPieces = [
      `Mål: ${body.goal || ''}`,
      `Signal: ${body.question}`,
      `Segment: ${body.segment || ''}`,
      `Kanal: ${body.channel || ''}`,
      `Värderad rad: ${body.valueLine || ''}`,
      `Adress: ${body.address || ''}`,
    if (company) {
      const name = company.name || company.title || ''
      userPieces.push(`Företag: ${name}`)
      const extra = {
        industry: company.industry,
        market: company.market,
        value_prop: company.value_prop,
        geo: company.geo
      if (Object.values(extra).some(Boolean)) {
        userPieces.push('Företagsdata: ' + JSON.stringify(extra))
    if (profile) userPieces.push(`Profil: ${profile.name || ''}`)
    if (kbSnippets.length) userPieces.unshift('LIKED_KB: ' + kbSnippets.join(' || '))
    if (callSnippets.length) userPieces.unshift('CALL_SNIPPETS: ' + callSnippets.map(s=>s.slice(0,300)).join(' || '))
    const userMsg = userPieces.join(' | ')
    // OpenAI chat
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: userMsg }
        ]
    })
    const raw = await resp.json().catch(()=> ({}))
    if (!resp.ok) return NextResponse.json({ error: 'openai_failed', detail: raw }, { status: 502 })
    let obj: Partial<QAJson>; try{ obj = JSON.parse(raw?.choices?.[0]?.message?.content || '{}') } catch { obj = {} }
    const out = normalize(obj)
    // (Optional) log event as before — re-add your insert here if needed.
    return NextResponse.json({ ok:true, ...out })
  } catch (e: unknown) {
    return NextResponse.json({ error: 'ask_route_error', detail: e?.message || String(e) }, { status: 500 })
