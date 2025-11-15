/* eslint-disable @typescript-eslint/no-explicit-any */
type QAInput = {
  question: string
  goal?: string
  segment?: string
  channel?: string
  numbers?: string
  profileName?: string
  extras?: Record<string,string|number|boolean|undefined|null>
  lang?: 'sv'|'en'|string
}

type QARaw = {
  one_liner?: string
  why?: any
  ack?: string
  short_script?: string
  full_script?: string
  math?: string
  next_step?: string
}

const PREFERRED_MODELS = [
  process.env.OPENAI_MODEL || 'gpt-4o-mini'
]

// ---------- prompt builders ----------
function buildSystemPromptGeneric(activeProfileName: string, profileJson: any, userProfile: any) {
  const lang = (profileJson?.Language || userProfile?.language || 'Svenska') as string
  const tone = [profileJson?.Tone, userProfile?.preferred_tone].filter(Boolean).join('; ')
  const compliance = profileJson?.Compliance || ''
  const callback = profileJson?.CallbackWindows || ''
  const proof = profileJson?.Proof || ''

  return [
    `Du är en professionell säljcoach. Svara alltid på ${lang}.`,
    `Stil/ton: ${tone || 'Varm, konkret, mänsklig. Korta, handlingsbara svar.'}`,
    compliance ? `Compliance: ${compliance}` : ``,
    proof ? `Bevis/Proof att använda när relevant: ${proof}` : ``,
    callback ? `Ring-/mötestider att föreslå (om mål kräver): ${callback}` : ``,
    `Returnera STRIKT JSON i fälten: one_liner, why, ack, short_script, full_script, math, next_step.`,
    `why ska vara i tredje person om kunden och kan vara sammanhängande text.`,
    `short_script max 2 meningar. full_script max 90–120 ord.`
  ].filter(Boolean).join('\n')
}

function buildUserPromptGeneric(input: QAInput, kbBest: {text?: string, hit?: boolean}, profileJson: any, userProfile: any) {
  const parts:string[] = []
  if (kbBest?.text) parts.push('INTERNAL BEST PRACTICE (följ ramarna): ' + kbBest.text)

  if (Array.isArray(profileJson?.Goals) && profileJson.Goals.length)
    parts.push('Tillåtna mål: ' + profileJson.Goals.join(', '))
  if (profileJson?.PersonaHints)
    parts.push('Persona hints: ' + profileJson.PersonaHints)

  const up:string[] = []
  if (userProfile?.role) up.push('roll=' + userProfile.role)
  if (userProfile?.experience) up.push('erfarenhet=' + userProfile.experience)
  if (userProfile?.preferred_tone) up.push('tone_pref=' + userProfile.preferred_tone)
  if (userProfile?.language) up.push('språk_pref=' + userProfile.language)
  if (up.length) parts.push('SPEAKER PROFILE: ' + up.join('; '))

  parts.push([
    'Mål: ' + (input.goal || ''),
    'Signal: ' + (input.question || ''),
    'Segment: ' + (input.segment || ''),
    'Kanal: ' + (input.channel || ''),
    'Siffror: ' + (input.numbers || '')
  ].join(' | '))

  const extras = input.extras || {}
  Object.keys(extras).forEach(k => {
    const v = (extras as any)[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      parts.push(k + ': ' + String(v))
    }
  })

  const cb = profileJson?.CallbackWindows || ''
  if (cb && /(möte|boka|intro|avstämning|uppföljning)/i.test(input.goal || '')) {
    parts.push('Om du föreslår tider, använd två exakta tider från: ' + cb)
  }
  return parts.join(' | ')
}

// ---------- shaping ----------
function coerceWhyObject(why: any) {
  const toStr = (x:any) => (x === undefined || x === null) ? '' : String(x).trim()
  let w:any = {}
  if (why && typeof why === 'object') w = why
  else if (why && typeof why === 'string') w = { qfocus: why }
  if (!toStr(w.qfocus))      w.qfocus      = 'Kunden vill förstå nyttan och sänka risk före beslut.'
  if (!toStr(w.personal))    w.personal    = 'Personliga mål och begränsningar styr beslutsvilja och tajming.'
  if (!toStr(w.biases))      w.biases      = 'Status quo och förlustaversion bromsar; tydlighet ökar trygghet.'
  if (!toStr(w.norms))       w.norms       = 'Verifierbarhet och skriftlig bekräftelse värderas.'
  if (!toStr(w.law))         w.law         = 'Transparens minskar upplevd risk (ej juridisk rådgivning).'
  if (!toStr(w.implication)) w.implication = 'Erbjud enkel nästa handling, kort och verifierbar.'
  return w
}

function enforceCaps(obj: QARaw) {
  const trimWords = (s:string, n:number) => (s || '').toString().split(/\s+/).slice(0, n).join(' ').trim()
  const limitChars = (s:string, n:number) => (s || '').toString().slice(0, n).trim()

  if (obj.one_liner) obj.one_liner = trimWords(obj.one_liner, 14)
  obj.why = coerceWhyObject(obj.why)
  ;['qfocus','personal','biases','norms','law','implication'].forEach(k => {
    obj.why[k] = limitChars(String(obj.why[k] || ''), 280)
  })
  if (obj.ack) obj.ack = limitChars(obj.ack, 140)
  if (obj.short_script) {
    const two = obj.short_script.split(/(?<=[.!?])\s+/).slice(0, 2)
    obj.short_script = two.join(' ')
  }
  if (obj.full_script) obj.full_script = limitChars(obj.full_script, 600)
  if (obj.math) obj.math = limitChars(obj.math.replace(/\n+/g, ' '), 200)
  if (obj.next_step) {
    const first = obj.next_step.split(/(?<=[.!?])\s+/)[0] || obj.next_step
    obj.next_step = limitChars(first, 240)
  }
  return obj
}

// --------- small helpers (stubbed) ----------
async function getActiveProfileJSON(profileName?: string) {
  // Hook into your real profile storage if you want.
  // For now return empty (non-breaking).
  return {}
}
async function getUserProfile() {
  // Hook into your Users table if you have one.
  return { language: 'Svenska', preferred_tone: '' }
}
async function kbFindBest(signal: string, profileName?: string) {
  // If you have a KB table / vector store, implement fuzzy search here.
  return { text: '', hit: false }
}

// --------- OpenAI call ----------
async function callOpenAIJSON(systemPrompt: string, userPrompt: string) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')

  let lastErr: any
  for (const model of PREFERRED_MODELS) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature: 0.25,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`)
      const data = await resp.json()
      let content = data?.choices?.[0]?.message?.content || '{}'
      const match = content.match(/\{[\s\S]*\}$/)
      if (match) content = match[0]
      return JSON.parse(content) as QARaw
    } catch (e:any) { lastErr = e }
  }
  throw new Error('OpenAI call failed: ' + (lastErr?.message || String(lastErr)))
}

// --------- main entry ----------
export async function generateQAAnswer(input: QAInput) {
  const profileJson = await getActiveProfileJSON(input.profileName)
  const userProfile = await getUserProfile()
  const kb = await kbFindBest(input.question || '', input.profileName)

  const sys = buildSystemPromptGeneric(input.profileName || '', profileJson, userProfile)
  const usr = buildUserPromptGeneric(input, kb, profileJson, userProfile)

  let obj = await callOpenAIJSON(sys, usr)
  obj = enforceCaps(obj)

  return {
    obj,
    meta: { kb_used: !!kb?.hit, profile: input.profileName || '' }
  }
}
