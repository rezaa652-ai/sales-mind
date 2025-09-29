import { NextRequest, NextResponse } from 'next/server'

type ReqBody = {
  lang?: 'sv'|'en'
  question?: string
  companyId?: string
  profileId?: string
  goal?: string
  segment?: string
  channel?: string
  number?: string   // value line, e.g. “reduce your electricity bill…”
  address?: string
}

function sysPrompt(lang:'sv'|'en'){
  const common = `
Return STRICT JSON only, no markdown, no prose. Shape:
{
  "one_liner": string,
  "why": string,
  "acknowledge": string,
  "short_script": string,
  "long_script": string,
  "next_step": string
}
Adapt tone to channel (Telefon/SMS/E-post or Phone/SMS/Email). Use the “number” field as the value line if provided. If address is present, localize gently (neighbourhood hints, not exact).
`.trim()

  if(lang==='en'){
    return "You write concise, on-brand sales replies in English.\n" + common
  }
  return "Du skriver koncisa, varumärkesanpassade säljsvar på svenska.\n" + common
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if(!apiKey){
      return NextResponse.json({ error: 'missing_openai_key' }, { status: 500 })
    }

    const body = (await req.json().catch(()=> ({}))) as ReqBody
    const lang = (body.lang==='en' ? 'en' : 'sv') as 'sv'|'en'
    const userPayload = {
      lang,
      question: body.question || '',
      companyId: body.companyId || '',
      profileId: body.profileId || '',
      goal: body.goal || '',
      segment: body.segment || '',
      channel: body.channel || '',
      value_line: body.number || '',
      address: body.address || ''
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.6,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sysPrompt(lang) },
          { role: 'user', content: (lang==='en'
            ? 'Create the sections. JSON ONLY:\n'
            : 'Skapa sektionerna. ENBART JSON:\n') + JSON.stringify(userPayload, null, 2) }
        ]
      })
    })

    if(!resp.ok){
      const text = await resp.text().catch(()=> '')
      return NextResponse.json({ error: 'openai_http', status: resp.status, preview: text.slice(0,400) }, { status: 502 })
    }

    const data = await resp.json().catch(()=> null)
    const content: string = data?.choices?.[0]?.message?.content || ''

    let obj: any = null
    try { obj = JSON.parse(content) } catch {
      return NextResponse.json({ error: 'openai_parse', preview: content.slice(0,400) }, { status: 502 })
    }

    const sections = {
      one_liner: String(obj.one_liner||'').trim(),
      why: String(obj.why||'').trim(),
      acknowledge: String(obj.acknowledge||'').trim(),
      short_script: String(obj.short_script||'').trim(),
      long_script: String(obj.long_script||'').trim(),
      next_step: String(obj.next_step||'').trim(),
    }

    const answers = [
      sections.one_liner,
      sections.why,
      sections.acknowledge,
      sections.short_script,
      sections.long_script,
      sections.next_step
    ].filter(Boolean)

    return NextResponse.json({
      meta: userPayload,
      sections,
      answers
    })
  } catch(e:any){
    return NextResponse.json({ error: 'qa_route_error', detail: e?.message || String(e) }, { status: 500 })
  }
}
