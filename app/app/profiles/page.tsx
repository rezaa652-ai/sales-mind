'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getLang, t, type Lang } from '@/lib/i18n'

type Profile = {
  id?: string
  name: string
  language?: string
  tone?: string
  goals?: string
  persona_hints?: string
}

export default function ProfilesPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [rows, setRows] = useState<Profile[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [form, setForm] = useState<Profile>({
    name: '',
    language: '',
    tone: '',
    goals: '',
    persona_hints: '',
  })

  useEffect(()=>{ setLang(getLang()) },[])

  async function load(){
    setLoading(true); setError(null)
    try{
      const r = await fetch('/api/profiles', { headers: { accept:'application/json' } })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) throw new Error(await r.text().catch(()=>`HTTP ${r.status}`))
      const data = await r.json().catch(()=>[])
      setRows(Array.isArray(data) ? data : [])
    }catch(e){
      console.error('Load profiles failed:', e)
      setError(t(lang,'common.error')); setRows([])
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : '' ; return ()=>{ document.body.style.overflow = '' } },[open])

  function openNew(){
    setEditing(null)
    setForm({ name:'', language:'', tone:'', goals:'', persona_hints:'' })
    setOpen(true)
  }
  function openEdit(p: Profile){
    setEditing(p)
    setForm({
      id: p.id,
      name: p.name || '',
      language: p.language || '',
      tone: p.tone || '',
      goals: p.goals || '',
      persona_hints: p.persona_hints || '',
    })
    setOpen(true)
  }

  async function save(){
    if (saving) return
    setSaving(true)
    try{
      const method = editing?.id ? 'PUT' : 'POST'
      const url = editing?.id ? `/api/profiles/${editing.id}` : '/api/profiles'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type':'application/json', accept:'application/json' },
        body: JSON.stringify(form)
      })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) throw new Error(await r.text().catch(()=>`HTTP ${r.status}`))
      setOpen(false); setEditing(null)
      await load()
    }catch(e){
      console.error('Save profile failed:', e)
      alert(t(lang,'common.error'))
    }finally{ setSaving(false) }
  }

  async function del(id?: string){
    if (!id) return
    try{
      const r = await fetch(`/api/profiles/${id}`, { method:'DELETE', headers: { accept:'application/json' } })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) throw new Error(await r.text().catch(()=>`HTTP ${r.status}`))
      setRows(prev => prev.filter(x=>x.id!==id))
    }catch(e){
      console.error('Delete profile failed:', e)
      alert(t(lang,'common.error'))
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t(lang,'profiles.title')}</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2" onClick={openNew}>
          {t(lang,'profiles.new')}
        </button>
      </div>

      {loading && <div className="text-slate-500">{t(lang,'common.loading')}</div>}
      {!loading && error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && !error && rows.length===0 && <div className="text-slate-500">{t(lang,'profiles.list.empty')}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(p=>(
          <div key={p.id} className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{p.name || '—'}</div>
              <div className="flex items-center gap-3">
                <button className="underline" onClick={()=>openEdit(p)}>{t(lang,'common.edit')}</button>
                <ConfirmDialog onConfirm={()=>del(p.id)}>
                  <button className="text-red-600 underline">{t(lang,'common.delete')}</button>
                </ConfirmDialog>
              </div>
            </div>
            <div className="text-sm space-y-1 text-slate-700">
              {p.language && <div><b>{t(lang,'profiles.form.language')}:</b> {p.language}</div>}
              {p.tone && <div><b>{t(lang,'profiles.form.tone')}:</b> {p.tone}</div>}
              {p.goals && <div><b>{t(lang,'profiles.form.goals')}:</b> {p.goals}</div>}
              {p.persona_hints && <div><b>{t(lang,'profiles.form.persona')}:</b> {p.persona_hints}</div>}
            </div>
          </div>
        ))}
      </div>

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
            <label className="text-sm">{t(lang,'profiles.form.goals')}
              <input
                className="border rounded p-2 w-full"
                value={form.goals}
                placeholder={t(lang,'profiles.ph.goals')}
                onChange={e=>setForm({...form, goals:e.target.value})}
              />
            </label>
            <label className="text-sm">{t(lang,'profiles.form.persona')}
              <textarea
                className="border rounded p-2 w-full min-h-[90px]"
                value={form.persona_hints}
                placeholder={t(lang,'profiles.ph.persona')}
                onChange={e=>setForm({...form, persona_hints:e.target.value})}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
