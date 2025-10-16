'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getLang, t, type Lang } from '@/lib/i18n'

type KB = {
  id?: string
  signal: string
  best_practice: string
  profile_name?: string
}

export default function KBPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [rows, setRows] = useState<KB[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<KB | null>(null)
  const [form, setForm] = useState<KB>({ signal: '', best_practice: '', profile_name: '' })

  useEffect(()=>{ setLang(getLang()) },[])

  async function load() {
    setLoading(true); setError(null)
    try{
      const r = await fetch('/api/kb', { headers: { accept: 'application/json' } })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) throw new Error(await r.text().catch(()=>`HTTP ${r.status}`))
      const data = await r.json().catch(()=>[])
      setRows(Array.isArray(data) ? data : [])
    }catch(e){
      console.error('Load KB failed:', e)
      setError(t(lang,'common.error')); setRows([])
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : '' ; return ()=>{ document.body.style.overflow = '' } },[open])

  function openNew(){ setEditing(null); setForm({ signal:'', best_practice:'', profile_name:'' }); setOpen(true) }
  function openEdit(k: KB){ setEditing(k); setForm({ id:k.id, signal:k.signal, best_practice:k.best_practice, profile_name:k.profile_name||'' }); setOpen(true) }

  async function save(){
    if (saving) return
    setSaving(true)
    try{
      const method = editing?.id ? 'PUT' : 'POST'
      const url = editing?.id ? `/api/kb/${editing.id}` : '/api/kb'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type':'application/json', accept:'application/json' },
        body: JSON.stringify(form),
      })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) throw new Error(await r.text().catch(()=>`HTTP ${r.status}`))
      setOpen(false); setEditing(null)
      await load()
    }catch(e){
      console.error('Save KB failed:', e)
      alert(t(lang,'common.error'))
    }finally{ setSaving(false) }
  }

  async function del(id?: string){
    if (!id) return
    try{
      const r = await fetch(`/api/kb/${id}`, { method:'DELETE', headers: { accept:'application/json' } })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) throw new Error(await r.text().catch(()=>`HTTP ${r.status}`))
      setRows(prev => prev.filter(x=>x.id!==id))
    }catch(e){
      console.error('Delete KB failed:', e)
      alert(t(lang,'common.error'))
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t(lang,'kb.title')}</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2" onClick={openNew}>
          {t(lang,'kb.new')}
        </button>
      </div>

      {loading && <div className="text-slate-500">{t(lang,'common.loading')}</div>}
      {!loading && error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && !error && rows.length===0 && <div className="text-slate-500">{t(lang,'kb.list.empty')}</div>}

      <div className="grid gap-3">
        {rows.map(k=>(
          <div key={k.id} className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{k.signal||'—'}</div>
              <div className="flex items-center gap-3">
                <button className="underline" onClick={()=>openEdit(k)}>{t(lang,'common.edit')}</button>
                <ConfirmDialog onConfirm={()=>del(k.id)}>
                  <button className="text-red-600 underline">{t(lang,'common.delete')}</button>
                </ConfirmDialog>
              </div>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{k.best_practice||'—'}</div>
            {k.profile_name && <div className="text-xs text-slate-500 mt-1">{t(lang,'kb.profile')}: {k.profile_name}</div>}
          </div>
        ))}
      </div>

      {open && (
        <Modal
          title={editing ? t(lang,'kb.edit') : t(lang,'kb.new')}
          onClose={()=>setOpen(false)}
          onSubmit={save}
          primaryLabel={saving ? t(lang,'common.loading') : t(lang,'common.save')}
          cancelLabel={t(lang,'common.cancel')}
        >
          <div className="grid gap-3">
            <label className="text-sm">{t(lang,'kb.form.signal')}
              <input
                className="border rounded p-2 w-full"
                value={form.signal}
                placeholder={t(lang,'kb.ph.signal')}
                onChange={e=>setForm({...form, signal:e.target.value})}
              />
            </label>
            <label className="text-sm">{t(lang,'kb.form.best')}
              <textarea
                className="border rounded p-2 w-full min-h-[110px]"
                value={form.best_practice}
                placeholder={t(lang,'kb.ph.best')}
                onChange={e=>setForm({...form, best_practice:e.target.value})}
              />
            </label>
            <label className="text-sm">{t(lang,'kb.form.profile')}
              <input
                className="border rounded p-2 w-full"
                value={form.profile_name||''}
                placeholder={t(lang,'kb.ph.profile')}
                onChange={e=>setForm({...form, profile_name:e.target.value})}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
