// app/app/qa/page.tsx
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function QAPage(){
  const [companies,setCompanies]=useState<any[]>([])
  const [profiles,setProfiles]=useState<any[]>([])
  const [form,setForm]=useState<any>({ company_id:'', profile_id:'', question:'', goal:'', segment:'', channel:'', numbers:'' })
  const [ans,setAns]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [feedback,setFeedback]=useState({ rating: 0, used: false, tags: '' })
  const textRef = useRef<HTMLTextAreaElement|null>(null)

  async function load(){
    const c = await fetch('/api/company'); setCompanies(await c.json())
    const p = await fetch('/api/profiles'); setProfiles(await p.json())
  }
  useEffect(()=>{ load() },[])

  const canSubmit = useMemo(()=>{
    return !!form.question?.trim()
  },[form.question])

  async function getAnswer(){
    if(!canSubmit) return
    setLoading(true)
    setAns(null)
    try{
      const r = await fetch('/api/qa', { method:'POST', body: JSON.stringify(form) })
      const data = await r.json()
      setAns(data)
    } finally {
      setLoading(false)
    }
  }

  async function saveFeedback(){
    if(!ans?.id) return
    await fetch(`/api/events/${ans.id}`, { method:'PUT', body: JSON.stringify(feedback) })
    alert('Feedback sparad')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>){
    // Enter submits, Shift+Enter makes newline
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      getAnswer()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Q&A</h1>
        <span className="text-xs text-slate-500">QA v2</span>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">Company
          <select className="border rounded p-2 w-full" value={form.company_id} onChange={e=>setForm({...form, company_id:e.target.value})}>
            <option value="">— none —</option>
            {companies.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </label>
        <label className="text-sm">Profile
          <select className="border rounded p-2 w-full" value={form.profile_id} onChange={e=>setForm({...form, profile_id:e.target.value})}>
            <option value="">— välj —</option>
            {profiles.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Goal
          <input className="border rounded p-2 w-full" value={form.goal} onChange={e=>setForm({...form, goal:e.target.value})}/>
        </label>
        <label className="text-sm">Segment
          <input className="border rounded p-2 w-full" value={form.segment} onChange={e=>setForm({...form, segment:e.target.value})}/>
        </label>
        <label className="text-sm">Channel
          <input className="border rounded p-2 w-full" value={form.channel} onChange={e=>setForm({...form, channel:e.target.value})}/>
        </label>
        <label className="text-sm">Numbers
          <input className="border rounded p-2 w-full" value={form.numbers} onChange={e=>setForm({...form, numbers:e.target.value})}/>
        </label>

        {/* Question / Signal + submit right under it */}
        <div className="md:col-span-2">
          <label className="text-sm block">Question / Signal</label>
          <textarea
            ref={textRef}
            className="border rounded p-2 w-full mt-1"
            rows={4}
            placeholder="Beskriv signalen… (Shift+Enter = ny rad, Enter = skicka)"
            value={form.question}
            onChange={e=>setForm({...form, question:e.target.value})}
            onKeyDown={onKeyDown}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={getAnswer}
              disabled={!canSubmit || loading}
              className={`rounded px-4 py-2 text-white ${(!canSubmit||loading)?'bg-blue-300':'bg-[var(--brand)] hover:opacity-90'}`}
            >
              {loading ? 'Working…' : 'Get Answer'}
            </button>
            <span className="text-xs text-slate-500">Tip: Press Enter to submit (Shift+Enter for newline)</span>
          </div>
        </div>
      </div>

      {ans && (
        <div className="grid gap-3">
          <h2 className="text-lg font-semibold">Svar</h2>
          <div className="border rounded p-3"><b>One-liner:</b> {ans.one_liner}</div>
          <div className="border rounded p-3"><b>Varför:</b> {ans.why}</div>
          <div className="border rounded p-3"><b>Bekräfta:</b> {ans.ack}</div>
          <div className="border rounded p-3"><b>Kort manus:</b> {ans.short_script}</div>
          <div className="border rounded p-3"><b>Fullt manus:</b> {ans.full_script}</div>
          <div className="border rounded p-3"><b>Uträkning:</b> {ans.math}</div>
          <div className="border rounded p-3"><b>Nästa steg:</b> {ans.next_step}</div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Feedback</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <label>Rating (1–5)
                <input
                  type="number" min={1} max={5}
                  className="border rounded p-2 w-full"
                  value={feedback.rating}
                  onChange={e=>setFeedback({...feedback, rating:Number(e.target.value)})}
                />
              </label>
              <label>Användes?
                <select
                  className="border rounded p-2 w-full"
                  value={feedback.used? 'yes':'no'}
                  onChange={e=>setFeedback({...feedback, used: e.target.value==='yes'})}
                >
                  <option value="no">Nej</option><option value="yes">Ja</option>
                </select>
              </label>
              <label>Taggar
                <input
                  className="border rounded p-2 w-full"
                  value={feedback.tags}
                  onChange={e=>setFeedback({...feedback, tags:e.target.value})}
                />
              </label>
            </div>
            <button onClick={saveFeedback} className="mt-2 underline">Spara feedback</button>
          </div>
        </div>
      )}
    </div>
  )
}
