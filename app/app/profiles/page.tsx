// app/app/profiles/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getLang, t, type Lang } from '@/lib/i18n'

type Profile = {
  id?: string
  name: string
  language: string
  tone: string
  callback_windows: string
  goals: string
  sales_targets: string
  persona_hints: string
  compliance: string
  proof: string
  company_id: string | null | ''
}

const EMPTY = (lang: Lang): Profile => ({
  name: '',
  language: lang === 'en' ? 'English' : 'Svenska',
  tone: lang === 'en' ? 'Concise' : 'Konkret',
  callback_windows: '12:15,16:40',
  goals: '',
  sales_targets: '',
  persona_hints: '',
  compliance: '',
  proof: '',
  company_id: ''
})

export default function ProfilesPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [rows,setRows]=useState<Profile[]>([])
  const [companies,setCompanies]=useState<any[]>([])

  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<Profile>(EMPTY('sv'))
  const [editing,setEditing]=useState<Profile|null>(null)
  const [saving,setSaving]=useState(false)

  useEffect(()=>{
    const l = getLang()
    setLang(l)
    setForm(EMPTY(l))
  },[])

  async function load(){
    const [p,c] = await Promise.all([
      fetch('/api/profiles').then(r=>r.json()),
      fetch('/api/company').then(r=>r.json())
    ])
    setRows(p); setCompanies(c)
  }
  useEffect(()=>{ load() },[])

  function openNew(){
    setEditing(null)
    setForm(EMPTY(lang))
    setOpen(true)
  }

  function openEdit(p: Profile){
    setEditing(p)
    setForm({
      ...p,
      company_id: p.company_id ?? ''
    })
    setOpen(true)
  }

  async function save(){
    if (saving) return
    setSaving(true)
    const url = editing?.id ? `/api/profiles/${editing.id}` : '/api/profiles'
    const method = editing?.id ? 'PUT' : 'POST'
    const r = await fetch(url,{ method, body: JSON.stringify(form) })
    setSaving(false)
    if(r.ok){
      setOpen(false)
      setEditing(null)
      await load()
    }else{
      alert(t(lang,'common.error'))
    }
  }

  async function del(id:string){
    const r = await fetch(`/api/profiles/${id}`,{ method:'DELETE' })
    if(r.ok){ await load() } else alert(t(lang,'common.error'))
  }

  function short(s?:string, n=80){
    if(!s) return '—'
    return s.length>n ? s.slice(0,n)+'…' : s
  }

  return (
    <div className="min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t(lang,'nav.profiles')}</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2" onClick={openNew}>
          {t(lang,'common.new')}
        </button>
      </div>

      {/* Cards: show a compact summary for each profile */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.length===0 && (
          <div className="text-slate-500">{t(lang,'common.none')}</div>
        )}
        {rows.map(p=>{
          const companyName = companies.find(c=>c.id===p.company_id)?.company_name || '—'
          return (
            <div key={p.id} className="rounded-2xl border shadow-sm bg-white p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.name || '—'}</div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{p.language || '—'}</span>
              </div>
              <div className="text-sm text-slate-600">{t(lang,'profiles.tone')}: {p.tone || '—'}</div>
              <div className="text-sm">{t(lang,'profiles.company')}: {companyName}</div>
              <div className="text-sm">{t(lang,'profiles.targets')}: {short(p.sales_targets, 40)}</div>
              <div className="text-xs text-slate-600">{short(p.persona_hints, 100)}</div>

              <div className="pt-2 flex justify-between gap-2">
                <button
                  className="underline"
                  onClick={()=>openEdit(p)}
                >
                  {t(lang,'profiles.edit')}
                </button>
                <ConfirmDialog onConfirm={()=>del(p.id!)}>
                  <button className="text-red-600 underline">{t(lang,'profiles.card.delete')}</button>
                </ConfirmDialog>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: form only; scrolls internally; background locked by Modal */}
      {open && (
        <Modal
          title={editing ? t(lang,'profiles.edit') : t(lang,'profiles.new')}
          onClose={()=>setOpen(false)}
          onSubmit={save}
          primaryLabel={saving ? t(lang,'common.loading') : t(lang,'common.save')}
          cancelLabel={t(lang,'common.cancel')}
        >
          <div className="grid gap-3">
            <label className="text-sm">{t(lang,'profiles.form.name')}
              <input
                className="border rounded p-2 w-full"
                value={form.name}
                placeholder={t(lang,'profiles.ph.name')}
                onChange={e=>setForm({...form, name:e.target.value})}
              />
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm">{t(lang,'profiles.form.language')}
                <input
                  className="border rounded p-2 w-full"
                  value={form.language}
                  placeholder={t(lang,'profiles.ph.language')}
                  onChange={e=>setForm({...form, language:e.target.value})}
                />
              </label>
              <label className="text-sm">{t(lang,'profiles.form.tone')}
                <input
                  className="border rounded p-2 w-full"
                  value={form.tone}
                  placeholder={t(lang,'profiles.ph.tone')}
                  onChange={e=>setForm({...form, tone:e.target.value})}
                />
              </label>
            </div>

            <label className="text-sm">{t(lang,'profiles.form.company')}
              <select
                className="border rounded p-2 w-full"
                value={form.company_id||''}
                onChange={e=>setForm({...form, company_id:e.target.value||null})}
              >
                <option value="">{t(lang,'common.none')}</option>
                {companies.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </label>

            <label className="text-sm">{t(lang,'profiles.form.callback')}
              <input
                className="border rounded p-2 w-full"
                value={form.callback_windows}
                placeholder={t(lang,'profiles.ph.callback')}
                onChange={e=>setForm({...form, callback_windows:e.target.value})}
              />
            </label>

            <label className="text-sm">{t(lang,'profiles.form.goals')}
              <input
                className="border rounded p-2 w-full"
                value={form.goals}
                placeholder={t(lang,'profiles.ph.goals')}
                onChange={e=>setForm({...form, goals:e.target.value})}
              />
            </label>

            <label className="text-sm">{t(lang,'profiles.form.sales_targets')}
              <input
                className="border rounded p-2 w-full"
                value={form.sales_targets}
                placeholder={t(lang,'profiles.ph.sales_targets')}
                onChange={e=>setForm({...form, sales_targets:e.target.value})}
              />
            </label>

            <label className="text-sm">{t(lang,'profiles.form.persona_hints')}
              <input
                className="border rounded p-2 w-full"
                value={form.persona_hints}
                placeholder={t(lang,'profiles.ph.persona_hints')}
                onChange={e=>setForm({...form, persona_hints:e.target.value})}
              />
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm">{t(lang,'profiles.form.compliance')}
                <input
                  className="border rounded p-2 w-full"
                  value={form.compliance}
                  placeholder={t(lang,'profiles.ph.compliance')}
                  onChange={e=>setForm({...form, compliance:e.target.value})}
                />
              </label>
              <label className="text-sm">{t(lang,'profiles.form.proof')}
                <input
                  className="border rounded p-2 w-full"
                  value={form.proof}
                  placeholder={t(lang,'profiles.ph.proof')}
                  onChange={e=>setForm({...form, proof:e.target.value})}
                />
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
