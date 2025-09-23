'use client'
import { useEffect, useState, useRef } from 'react'
import { t, type Lang, getLang } from '@/lib/i18n'

export default function QAPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [companies,setCompanies]=useState<any[]>([])
  const [profiles,setProfiles]=useState<any[]>([])
  const [form,setForm]=useState<any>({ company_id:'', profile_id:'', question:'', goal:'', segment:'', channel:'', numbers:'' })
  const [ans,setAns]=useState<any>(null)
  const [feedback,setFeedback]=useState({ rating: 0, used: false, tags: '' })
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(()=>{
    setLang(getLang())
    ;(async ()=>{
      const [c,p] = await Promise.all([
        fetch('/api/company').then(r=>r.json()),
        fetch('/api/profiles').then(r=>r.json())
      ])
      setCompanies(c); setProfiles(p)
    })()
  },[])

  async function getAnswer(){
    if(!form.question?.trim()) return
    setLoading(true)
    setAns(null)
    try {
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
    alert(t(lang,'common.ok'))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      getAnswer()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t(lang,'qa.title')}</h1>

      <form ref={formRef} className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">
          {t(lang,'qa.company')}
          <select
            className="border rounded p-2 w-full"
            value={form.company_id}
            onChange={e=>setForm({...form, company_id:e.target.value})}
            aria-label={t(lang,'qa.company')}
          >
            <option value="">{t(lang,'common.none')}</option>
            {companies.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </label>

        <label className="text-sm">
          {t(lang,'qa.profile')}
          <select
            className="border rounded p-2 w-full"
            value={form.profile_id}
            onChange={e=>setForm({...form, profile_id:e.target.value})}
            aria-label={t(lang,'qa.profile')}
          >
            <option value="">{t(lang,'qa.ph.profile')}</option>
            {profiles.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>

        <label className="text-sm">
          {t(lang,'qa.goal')}
          <input
            className="border rounded p-2 w-full"
            value={form.goal}
            placeholder={t(lang,'qa.ph.goal')}
            onChange={e=>setForm({...form, goal:e.target.value})}
          />
        </label>

        <label className="text-sm">
          {t(lang,'qa.segment')}
          <input
            className="border rounded p-2 w-full"
            value={form.segment}
            placeholder={t(lang,'qa.ph.segment')}
            onChange={e=>setForm({...form, segment:e.target.value})}
          />
        </label>

        <label className="text-sm">
          {t(lang,'qa.channel')}
          <input
            className="border rounded p-2 w-full"
            value={form.channel}
            placeholder={t(lang,'qa.ph.channel')}
            onChange={e=>setForm({...form, channel:e.target.value})}
          />
        </label>

        <label className="text-sm">
          {t(lang,'qa.numbers')}
          <input
            className="border rounded p-2 w-full"
            value={form.numbers}
            placeholder={t(lang,'qa.ph.numbers')}
            onChange={e=>setForm({...form, numbers:e.target.value})}
          />
        </label>

        <label className="text-sm md:col-span-2">
          {t(lang,'qa.question')}
          <textarea
            className="border rounded p-2 w-full"
            rows={4}
            value={form.question}
            placeholder={t(lang,'qa.ph.question')}
            onChange={e=>setForm({...form, question:e.target.value})}
            onKeyDown={onKeyDown}
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">{t(lang,'qa.hint.enter')}</span>
          <button
            type="button"
            onClick={getAnswer}
            disabled={loading}
            className="bg-[var(--brand)] text-white rounded px-4 py-2 disabled:opacity-60"
          >
            {loading ? t(lang,'common.loading') : t(lang,'qa.getAnswer')}
          </button>
        </div>
      </form>

      {ans && (
        <div className="grid gap-3">
          <h2 className="text-lg font-semibold">{t(lang,'qa.title')}</h2>
          <div className="border rounded p-3"><b>{t(lang,'qa.res.one_liner')}:</b> {ans.one_liner}</div>
          <div className="border rounded p-3"><b>{t(lang,'qa.res.why')}:</b> {ans.why}</div>
          <div className="border rounded p-3"><b>{t(lang,'qa.res.ack')}:</b> {ans.ack}</div>
          <div className="border rounded p-3"><b>{t(lang,'qa.res.short_script')}:</b> {ans.short_script}</div>
          <div className="border rounded p-3"><b>{t(lang,'qa.res.full_script')}:</b> {ans.full_script}</div>
          <div className="border rounded p-3"><b>{t(lang,'qa.res.math')}:</b> {ans.math}</div>
          <div className="border rounded p-3"><b>{t(lang,'qa.res.next_step')}:</b> {ans.next_step}</div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">{t(lang,'qa.fb.title')}</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <label>{t(lang,'qa.fb.rating')}
                <input
                  type="number" min={1} max={5}
                  className="border rounded p-2 w-full"
                  value={feedback.rating}
                  onChange={e=>setFeedback({...feedback, rating:Number(e.target.value)})}
                />
              </label>
              <label>{t(lang,'qa.fb.used')}
                <select
                  className="border rounded p-2 w-full"
                  value={feedback.used? 'yes':'no'}
                  onChange={e=>setFeedback({...feedback, used: e.target.value==='yes'})}
                >
                  <option value="no">{t(lang,'qa.fb.no')}</option>
                  <option value="yes">{t(lang,'qa.fb.yes')}</option>
                </select>
              </label>
              <label>{t(lang,'qa.fb.tags')}
                <input
                  className="border rounded p-2 w-full"
                  value={feedback.tags}
                  onChange={e=>setFeedback({...feedback, tags:e.target.value})}
                />
              </label>
            </div>
            <button onClick={saveFeedback} className="mt-2 underline">
              {t(lang,'qa.fb.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
