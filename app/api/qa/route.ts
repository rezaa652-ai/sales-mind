import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import OpenAI from 'openai'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// Hjälp: normalisera JSON-svar
function coerce(obj: any){
  const o = obj || {}
  return {
    one_liner: o.one_liner ?? '',
    why: o.why ?? '',
    ack: o.ack ?? '',
    short_script: o.short_script ?? '',
    full_script: o.full_script ?? '',
    math: o.math ?? '',
    next_step: o.next_step ?? '',
  }
}

export async function POST(req: NextRequest){
  try{
    const body = await req.json()
    const {
      company_id,
      profile_id,
      profile_name: profileNameIn,
      goal = '',
      segment = '',
      channel = '',
      numbers = '',
      question = ''
    } = body || {}

    if(!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 })
    }

    const supabase = await supabaseServer()

    // 1) Hämta profil
    let profile: any = null
    if (profile_id){
      const { data } = await supabase.from('profiles_sales').select('*').eq('id', profile_id).single()
      profile = data
    } else if (profileNameIn){
      const { data } = await supabase.from('profiles_sales').select('*').ilike('name', profileNameIn).maybeSingle()
      profile = data
    }

    // 2) Hämta company (valfritt)
    let company: any = null
    if (company_id){
      const { data } = await supabase.from('company_profiles').select('*').eq('id', company_id).single()
      company = data
    }

    const profile_name = profile?.name || profileNameIn || ''

    // 3) Enkel KB-matchning (contains; prioritera samma profil)
    let kb_hit = false
    let kb_text = ''
    if (question){
      let { data: kb } = await supabase
        .from('kb_entries')
        .select('signal,best_practice,profile_name')
        .ilike('signal', `%${question.slice(0, 32)}%`)
        .limit(10)

      // om inget via contains: hämta topp 5 och ta första
      if (!kb || kb.length === 0) {
        const alt = await supabase.from('kb_entries').select('signal,best_practice,profile_name').limit(5)
        kb = alt.data || []
      }

      if (kb && kb.length){
        // välj helst samma profil
        const same = kb.find(k => (k.profile_name||'').toLowerCase() === (profile_name||'').toLowerCase())
        const pick = same || kb[0]
        kb_hit = !!pick
        kb_text = pick?.best_practice || ''
      }
    }

    // 4) Bygg prompts
    const sysLines = [
      `Du är en säljcoach. Svara på ${profile?.language || 'Svenska'}.`,
      `Stil/ton: ${profile?.tone || 'Konkret, respektfull, kort'}.`,
      profile?.compliance ? `Compliance: ${profile.compliance}` : '',
      company?.compliance ? `Företagsregler: ${company.compliance}` : '',
      profile?.callback_windows ? `Ringfönster: ${profile.callback_windows}` : '',
      profile?.sales_targets ? `Säljmål: ${profile.sales_targets}` : '',
      company?.proof_points ? `Bevispunkter: ${company.proof_points}` : '',
      `Returnera STRIKT JSON med fälten: one_liner, why, ack, short_script, full_script, math, next_step.`
    ].filter(Boolean).join('\n')

    const userParts = [
      `Profil: ${profile_name}`,
      `Goal: ${goal}`,
      `Segment: ${segment}`,
      `Kanal: ${channel}`,
      `Siffror: ${numbers}`,
      company?.company_name ? `Företag: ${company.company_name}` : '',
      profile?.persona_hints ? `Persona hints: ${profile.persona_hints}` : '',
      kb_hit ? `Best practice (intern): ${kb_text}` : '',
      `Fråga/Signal: ${question}`
    ].filter(Boolean).join(' | ')

    // 5) OpenAI
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey){
      // fallback: inget externt anrop – returnera stub
      const stub = coerce({
        one_liner: 'Stub: AI-nyckel saknas.',
        why: 'Detta är ett lokalt svar utan AI-anrop.',
        ack: 'Förstår läget.',
        short_script: 'Kort manus baserat på dina inputs.',
        full_script: 'Längre manus baserat på dina inputs och ev. KB.',
        math: '—',
        next_step: 'Välj två tider enligt ringfönster.'
      })
      // spara event ändå
      const { data: ins } = await supabase.from('events').insert({
        company: company_id || null,
        profile_name,
        goal, segment, channel, numbers, question,
        kb_hit,
        one_liner: stub.one_liner,
        why: stub.why,
        ack: stub.ack,
        short_script: stub.short_script,
        full_script: stub.full_script,
        math: stub.math,
        next_step: stub.next_step,
        raw_json: stub
      }).select('*').single()

      return NextResponse.json({ ...stub, event: ins, kb_hit })
    }

    const openai = new OpenAI({ apiKey })
    const chat = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sysLines },
        { role: 'user', content: userParts }
      ]
    })

    let content = chat.choices?.[0]?.message?.content || '{}'
    // försäkra JSON
    const match = content.match(/\{[\s\S]*\}$/)
    if (match) content = match[0]
    const parsed = coerce(JSON.parse(content))

    // 6) Spara event
    const { data: ins, error: insErr } = await supabase.from('events').insert({
      company: company_id || null,
      profile_name,
      goal, segment, channel, numbers, question,
      kb_hit,
      response_id: chat.id || null,
      one_liner: parsed.one_liner,
      why: parsed.why,
      ack: parsed.ack,
      short_script: parsed.short_script,
      full_script: parsed.full_script,
      math: parsed.math,
      next_step: parsed.next_step,
      raw_json: parsed
    }).select('*').single()

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })

    return NextResponse.json({ ...parsed, event: ins, kb_hit })
  } catch (e: any){
    return NextResponse.json({ error: e?.message || 'unknown_error' }, { status: 500 })
  }
}
