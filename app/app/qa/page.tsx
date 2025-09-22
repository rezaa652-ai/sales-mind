// app/app/qa/page.tsx
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@/lib/i18n'
type Row = Record<string, any>
export default function QAPage(){
  const [companies,setCompanies]=useState<Row[]>([])
  const [profiles,setProfiles]=useState<Row[]>([])
  const [form,setForm]=useState<any>({ company_id:'', profile_id:'', question:'', goal:'', segment:'', channel:'', numbers:'' })
  const [ans,setAns]=useState<any>(null)
  const [feedback,setFeedback]=useState({ rating:0, used:false, tags:'' })
  const [loading,setLoading]=useState(false)
  const questionRef = useRef<HTMLTextAreaElement|null>(null)
  const canSubmit = useMemo(()=>!!form.question?.trim() && !loading,[form.question,loading])

  async function load(){
    try{
      const [c,p] = await Promise.all([fetch('/api/company'), fetch('/api/profiles')])
      if(c.ok) setCompanies(await c.json())
      if(p.ok) setProfiles(await p.json())
    }catch{}
  }
  useEffect(()=>{ load() },[])

  async function getAnswer(){
    if(!canSubmit) return
    setLoading(true); setAns(null)
    try{
      const r = await fetch('/api/qa',{ method:'POST', body: JSON.stringify(form) })
      const data = await r.json()
      setAns(data)
    }finally{ setLoading(false) }
  }
  async function saveFeedback(){
    if(!ans?.id) return
    await fetch(`/api/events/${ans.id}`,{ method:'PUT', body: JSON.stringify(feedback) })
    alert(t('save_feedback'))
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); getAnswer() }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('qa_title')}</h1>
      </header>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">{t('company')}
          <select className="border rounded p-2 w-full mt-1" value={form.company_id} onChange={e=>setForm({...form, company_id:e.target.value})}>
            <option value="">—</option>
            {companies.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </label>
        <label className="text-sm">{t('profile')}
          <select className="border rounded p-2 w-full mt-1" value={form.profile_id} onChange={e=>setForm({...form, profile_id:e.target.value})}>
            <option value="">—</option>
            {profiles.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="text-sm">{t('goal')}
          <input className="border rounded p-2 w-full mt-1" value={form.goal} onChange={e=>setForm({...form, goal:e.target.value})}/>
        </label>
        <label className="text-sm">{t('segment')}
          <input className="border rounded p-2 w-full mt-1" value={form.segment} onChange={e=>setForm({...form, segment:e.target.value})}/>
        </label>
        <label className="text-sm">{t('channel')}
          <input className="border rounded p-2 w-full mt-1" value={form.channel} onChange={e=>setForm({...form, channel:e.target.value})}/>
        </label>
        <label className="text-sm">{t('numbers')}
          <input className="border rounded p-2 w-full mt-1" value={form.numbers} onChange={e=>setForm({...form, numbers:e.target.value})}/>
        </label>
        <label className="text-sm md:col-span-2">{t('question_signal')}
          <textarea
            ref={questionRef}
            className="border rounded p-2 w-full mt-1"
            rows={4}
            value={form.question}
            onChange={e=>setForm({...form, question:e.target.value})}
            onKeyDown={onKeyDown}
            placeholder={t('question_ph')}
          />
        </label>
        <div className="md:col-span-2">
          <button
            onClick={getAnswer}
            disabled={!canSubmit}
            className={`rounded px-4 py-2 w-full sm:w-auto ${canSubmit ? 'bg-[var(--brand)] text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            {loading ? t('loading') : t('get_answer')}
          </button>
        </div>
      </div>

      {ans && (
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">{t('answer_title')}</h2>
          <div className="border rounded p-3"><b>{t('one_liner')}:</b> {ans.one_liner}</div>
          <div className="border rounded p-3"><b>{t('why')}:</b> {ans.why}</div>
          <div className="border rounded p-3"><b>{t('ack')}:</b> {ans.ack}</div>
          <div className="border rounded p-3"><b>{t('short_script')}:</b> {ans.short_script}</div>
          <div className="border rounded p-3"><b>{t('full_script')}:</b> {ans.full_script}</div>
          <div className="border rounded p-3"><b>{t('math')}:</b> {ans.math}</div>
          <div className="border rounded p-3"><b>{t('next_step')}:</b> {ans.next_step}</div>
          <div className="mt-4">
            <h3 className="font-medium mb-2">{t('feedback')}</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <label className="text-sm">{t('rating')}
                <input type="number" min={1} max={5} className="border rounded p-2 w-full mt-1"
                  value={feedback.rating} onChange={e=>setFeedback({...feedback, rating:Number(e.target.value)})}/>
              </label>
              <label className="text-sm">{t('used')}
                <select className="border rounded p-2 w-full mt-1" value={feedback.used?'yes':'no'} onChange={e=>setFeedback({...feedback, used:e.target.value==='yes'})}>
                  <option value="no">{t('no')}</option>
                  <option value="yes">{t('yes')}</option>
                </select>
              </label>
              <label className="text-sm">{t('tags')}
                <input className="border rounded p-2 w-full mt-1" value={feedback.tags} onChange={e=>setFeedback({...feedback, tags:e.target.value})}/>
              </label>
            </div>
            <button onClick={saveFeedback} className="mt-2 underline">{t('save_feedback')}</button>
          </div>
        </section>
      )}
    </div>
  )
}
