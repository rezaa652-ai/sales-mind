'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Lang = 'sv'|'en'

type Company = { id: string, name: string }
type Profile = { id: string, name: string }

type Sections = {
  one_liner: string
  why: string
  acknowledge: string
  short_script: string
  long_script: string
  next_step: string
}

type QaResponse = {
  meta: any
  sections: Sections
  answers: string[]
}

const L = (lang:Lang) => ({
  title: lang==='en' ? 'Q&A' : 'Q&A',
  ask_label: lang==='en' ? 'Question / Signal' : 'Fråga / Signal',
  ask_ph: lang==='en'
    ? 'How do I handle “I don’t have time”?'
    : 'Hur hanterar jag ”jag har inte tid”?',
  company: lang==='en' ? 'Company' : 'Företag',
  company_ph: lang==='en' ? 'Choose company…' : 'Välj företag…',
  profile: lang==='en' ? 'Profile' : 'Profil',
  profile_ph: lang==='en' ? 'Choose profile…' : 'Välj profil…',
  goal: lang==='en' ? 'Goal (optional)' : 'Mål (valfritt)',
  goal_opts: lang==='en'
    ? ['Qualify','Book a call/time later','Sale']
    : ['Kvalificera','Boka samtal/tid senare','Affär'],
  segment: lang==='en' ? 'Segment (optional)' : 'Segment (valfritt)',
  segment_opts: lang==='en'
    ? ['Single household','Two-person household','Family household']
    : ['Enpersonshushåll','Tvåpersonshushåll','Familjehushåll'],
  channel: lang==='en' ? 'Channel (optional)' : 'Kanal (valfritt)',
  channel_opts: lang==='en'
    ? ['Phone','SMS','Email']
    : ['Telefon','SMS','E-post'],
  number: lang==='en' ? 'Value line (optional)' : 'Värderad rad (valfritt)',
  number_ph: lang==='en'
    ? 'Example: reduce your electricity bill up to 30% per month'
    : 'Exempel: sänk din elräkning upp till 30 % per månad',
  address: lang==='en' ? 'Address (optional)' : 'Adress (valfritt)',
  address_ph: lang==='en'
    ? 'Example: Södra Förstadsgatan 1, Malmö'
    : 'Exempel: Södra Förstadsgatan 1, Malmö',
  get_answer: lang==='en' ? 'Get answers' : 'Hämta svar',
  answers: lang==='en' ? 'Answers' : 'Svar',
  copy: lang==='en' ? 'Copy' : 'Kopiera',
  liked: lang==='en' ? 'Liked' : 'Gillad',
  like: lang==='en' ? 'Like' : 'Gilla',
  unlike: lang==='en' ? 'Unlike' : 'Ogilla',
  rating: lang==='en' ? 'Rate' : 'Betygsätt',
  details: lang==='en' ? 'Details' : 'Detaljer'
})

export default function QA(){
  const [lang, setLang] = useState<Lang>('sv')

  // form state
  const [companyId, setCompanyId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [goal, setGoal] = useState('')
  const [segment, setSegment] = useState('')
  const [channel, setChannel] = useState('')
  const [question, setQuestion] = useState('')
  const [number, setNumber] = useState('')   // value line
  const [address, setAddress] = useState('')

  // data
  const [companies, setCompanies] = useState<Company[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const [res, setRes] = useState<QaResponse|null>(null)

  const labels = L(lang)

  // fetch companies & profiles
  useEffect(()=>{
    fetch('/api/company').then(r=>r.json()).then(j=>{
      // support both {companies:[]} and array fallback
      const arr = Array.isArray(j) ? j : (Array.isArray(j?.companies) ? j.companies : [])
      setCompanies(arr || [])
    }).catch(()=>{})
    fetch('/api/profiles').then(r=>r.json()).then(j=>{
      const arr = Array.isArray(j) ? j : (Array.isArray(j?.profiles) ? j.profiles : [])
      setProfiles(arr || [])
    }).catch(()=>{})
  },[])

  // local like/rating store
  type LR = { liked?: boolean, rating?: number }
  const [lr, setLR] = useState<Record<string, LR>>(()=> {
    if(typeof window==='undefined') return {}
    try{ return JSON.parse(localStorage.getItem('qa-likes') || '{}') }catch{ return {} }
  })
  useEffect(()=>{
    if(typeof window==='undefined') return
    localStorage.setItem('qa-likes', JSON.stringify(lr))
  }, [lr])

  function key(e:string){ return e.toLowerCase().replace(/\s+/g,'_') }

  async function submit(){
    setError('')
    setLoading(true)
    try{
      const body = {
        lang, question, companyId, profileId, goal, segment, channel, number, address
      }
      const r = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if(!r.ok){
        const tx = await r.text().catch(()=> '')
        throw new Error(tx || `HTTP ${r.status}`)
      }
      const j: QaResponse = await r.json()
      setRes(j)
    }catch(e:any){
      setError(e?.message || 'Failed to get answers')
    }finally{
      setLoading(false)
    }
  }

  // Enter to submit on any input/textarea (without Shift)
  function onKeyDownSubmit(e: React.KeyboardEvent<HTMLElement>){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      submit()
    }
  }

  function copyText(t: string){
    navigator.clipboard?.writeText(t).catch(()=>{})
  }

  function like(section: string, v: boolean){
    const k = key(section)
    setLR(s=> ({ ...s, [k]: { ...(s[k]||{}), liked: v } }))
    // Best-effort async save to a KB API if you add one later
    fetch('/api/kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, text: (res?.sections as any)?.[section] || '', like: v, meta: res?.meta || {} })
    }).catch(()=>{})
  }

  function rate(section: string, stars: number){
    const k = key(section)
    setLR(s=> ({ ...s, [k]: { ...(s[k]||{}), rating: stars } }))
    fetch('/api/kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, rating: stars, meta: res?.meta || {} })
    }).catch(()=>{})
  }

  const sectionOrder: Array<keyof Sections> = [
    'one_liner','why','acknowledge','short_script','long_script','next_step'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{labels.title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">SV</span>
          <input type="checkbox" checked={lang==='en'} onChange={e=> setLang(e.target.checked ? 'en':'sv')} />
          <span className="text-sm">EN</span>
        </div>
      </div>

      {/* Company / Profile */}
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">
          {labels.company}
          <select className="border rounded p-2 w-full" value={companyId} onChange={e=>setCompanyId(e.target.value)}>
            <option value="">{labels.company_ph}</option>
            {companies.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-sm">
          {labels.profile}
          <select className="border rounded p-2 w-full" value={profileId} onChange={e=>setProfileId(e.target.value)}>
            <option value="">{labels.profile_ph}</option>
            {profiles.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>

      {/* Optional selects */}
      <div className="grid md:grid-cols-3 gap-3">
        <label className="text-sm">
          {labels.goal}
          <select className="border rounded p-2 w-full" value={goal} onChange={e=>setGoal(e.target.value)}>
            <option value=""></option>
            {labels.goal_opts.map(x=> <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="text-sm">
          {labels.segment}
          <select className="border rounded p-2 w-full" value={segment} onChange={e=>setSegment(e.target.value)}>
            <option value=""></option>
            {labels.segment_opts.map(x=> <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="text-sm">
          {labels.channel}
          <select className="border rounded p-2 w-full" value={channel} onChange={e=>setChannel(e.target.value)}>
            <option value=""></option>
            {labels.channel_opts.map(x=> <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
      </div>

      {/* Value line + Address */}
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">
          {labels.number}
          <input
            className="border rounded p-2 w-full"
            value={number}
            onChange={e=>setNumber(e.target.value)}
            onKeyDown={onKeyDownSubmit}
            placeholder={labels.number_ph}
          />
        </label>
        <label className="text-sm">
          {labels.address}
          <input
            className="border rounded p-2 w-full"
            value={address}
            onChange={e=>setAddress(e.target.value)}
            onKeyDown={onKeyDownSubmit}
            placeholder={labels.address_ph}
          />
        </label>
      </div>

      {/* Question */}
      <label className="text-sm block">
        {labels.ask_label}
        <textarea
          className="border rounded p-3 w-full min-h-[110px]"
          value={question}
          onChange={e=>setQuestion(e.target.value)}
          onKeyDown={onKeyDownSubmit}
          placeholder={labels.ask_ph}
        />
      </label>

      {/* Centered button */}
      <div className="w-full grid place-items-center">
        <button
          onClick={(e)=>{ e.preventDefault(); submit() }}
          disabled={loading}
          className="bg-[var(--brand,#111827)] text-white rounded px-6 py-2 disabled:opacity-50"
        >
          {loading ? (lang==='en' ? 'Fetching…' : 'Hämtar…') : labels.get_answer}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Answers */}
      {res?.sections && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">{labels.answers}</h2>
          {sectionOrder.map((secKey)=> {
            const text = (res.sections as any)[secKey] as string
            if(!text) return null
            const lrKey = secKey.toLowerCase()
            const liked = !!lr[lrKey]?.liked
            const rating = lr[lrKey]?.rating || 0
            const prettyTitle = secKey.replace(/_/g,' ').replace(/\b\w/g, m=> m.toUpperCase())

            return (
              <div key={secKey} className="border rounded p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{prettyTitle}</div>
                  <div className="flex items-center gap-3">
                    <button className="text-sm underline" onClick={()=>copyText(text)}>{labels.copy}</button>
                    <button className="text-sm" onClick={()=>like(secKey, true)}>{liked ? '✅ '+labels.liked : '👍 '+labels.like}</button>
                    <button className="text-sm" onClick={()=>like(secKey, false)}>👎 {labels.unlike}</button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{labels.rating}:</span>
                      {[1,2,3,4,5].map(st=>(
                        <button
                          key={st}
                          aria-label={`rate-${st}`}
                          onClick={()=>rate(secKey, st)}
                          className="text-lg"
                          title={`${st}/5`}
                        >
                          {st <= rating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 whitespace-pre-wrap">{text}</div>
              </div>
            )
          })}

          {/* meta line */}
          <div className="text-xs text-slate-600">
            {labels.details} — mål: {res.meta?.goal || '–'}, segment: {res.meta?.segment || '–'}, kanal: {res.meta?.channel || '–'}, number: {res.meta?.value_line || '–'}, adress: {res.meta?.address || '–'}
          </div>
        </div>
      )}
    </div>
  )
}
