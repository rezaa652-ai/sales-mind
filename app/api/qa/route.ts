import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import OpenAI from 'openai'

function server(req: NextRequest){
  const res = NextResponse.next()
  return { supabase: createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      get: (n)=>req.cookies.get(n)?.value,
      set: (n,v,o)=>res.cookies.set({name:n,value:v,...o}),
      remove: (n,o)=>res.cookies.set({name:n,value:'',...o,maxAge:0}),
    } }
  ), res }
}

function systemPrompt(profile:any, company:any){
  return [
    `Du är en professionell säljcoach. Svara på ${profile?.language||'Svenska'}.`,
    `Ton: ${profile?.tone||'Konkret, respektfull, kort'}.`,
    company?.compliance ? `Compliance: ${company.compliance}` : '',
    profile?.proof ? `Proof: ${profile.proof}` : (company?.proof_points ? `Proof: ${company.proof_points}`:''),
    profile?.callback_windows ? `Callback windows: ${profile.callback_windows}` : '',
    profile?.sales_targets ? `Säljtarget: ${profile.sales_targets}` : '',
    `Returnera STRIKT JSON: one_liner, why, ack, short_script, full_script, math, next_step.`
  ].filter(Boolean).join('\n')
}

function userPrompt(input:any, kbText:string, company:any, profile:any){
  return [
    `Profil: ${profile?.name||''}`,
    `Mål: ${input.goal||''}`,
    `Segment: ${input.segment||''}`,
    `Kanal: ${input.channel||''}`,
    `Siffror: ${input.numbers||''}`,
    company ? `Företag: ${company.company_name} (${company.market})` : '',
    kbText ? `Best practice: ${kbText}` : '',
    `Signal: ${input.question}`
  ].filter(Boolean).join(' | ')
}

export async function POST(req: NextRequest){
  const { supabase } = server(req)
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})

  const input = await req.json()
  const profileId = input.profile_id as string|undefined
  const companyId = input.company_id as string|undefined

  const { data: profile } = profileId
    ? await supabase.from('profiles_sales').select('*').eq('id', profileId).eq('owner', user.id).single()
    : { data: null }

  const { data: company } = companyId
    ? await supabase.from('company_profiles').select('*').eq('id', companyId).eq('owner', user.id).single()
    : { data: null }

  // KB “RAG-light”
  let kbText = ''
  if (input.question) {
    const q = input.question.slice(0, 120)
    const { data: kb } = await supabase
      .from('kb_entries')
      .select('*')
      .eq('owner', user.id)
      .ilike('signal', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(1)
    kbText = kb?.[0]?.best_practice || ''
  }

  // Free-plan: max 30 events senaste 30 dagar
  const { data: last30 } = await supabase
    .from('events')
    .select('id, ts')
    .eq('owner', user.id)
    .gte('ts', new Date(Date.now() - 30*24*60*60*1000).toISOString())
  if ((last30?.length ?? 0) >= 30) {
    return NextResponse.json({ error: 'Free-plan: 30 Q&A per 30 dagar' }, { status: 403 })
  }

  const sys = systemPrompt(profile, company)
  const usr = userPrompt(input, kbText, company, profile)

  let obj:any
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: usr }
      ]
    })
    const text = resp.choices?.[0]?.message?.content || '{}'
    obj = JSON.parse(text)
  } else {
    obj = {
      one_liner: "Tack — låt mig göra det enkelt.",
      why: "Kunden vill ha tydlighet, låg friktion och relevant nästa steg.",
      ack: "Förstår, vi håller det kort och konkret.",
      short_script: "Två snabba alternativ: 12:15 eller 16:40 för en 5-min intro?",
      full_script: "Värdet i en mening, sedan två tider. Bekräfta och dokumentera.",
      math: "≈ liten tidsbesparing per ärende → större över månad.",
      next_step: "Jag skickar en kort agenda och mötesförslag nu — funkar 12:15?"
    }
  }

  // spara event
  const { data: saved, error } = await supabase.from('events').insert([{
    owner: user.id,
    company: company?.id || null,
    profile_name: profile?.name || '',
    goal: input.goal || '',
    segment: input.segment || '',
    channel: input.channel || '',
    numbers: input.numbers || '',
    question: input.question || '',
    kb_hit: !!kbText,
    one_liner: obj.one_liner || '',
    why: obj.why || '',
    ack: obj.ack || '',
    short_script: obj.short_script || '',
    full_script: obj.full_script || '',
    math: obj.math || '',
    next_step: obj.next_step || '',
    raw_json: obj
  }]).select().single()

  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(saved)
}
