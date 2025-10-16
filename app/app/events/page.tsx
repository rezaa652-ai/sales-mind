'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getLang, t, type Lang } from '@/lib/i18n'

type EventItem = {
  id?: string
  ts?: string        // ISO date-time
  title?: string
  type?: string
  notes?: string
  tags?: string
}

export default function EventsPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [rows, setRows] = useState<EventItem[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<EventItem | null>(null)
  const [form, setForm] = useState<EventItem>({
    ts: new Date().toISOString().slice(0,16),
    title: '',
    type: '',
    notes: '',
    tags: ''
  })

  useEffect(()=>{ setLang(getLang()) },[])

  async function load(){
    setLoading(true)
    setError(null)
    try{
      const r = await fetch('/api/events', { headers: { accept: 'application/json' } })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) { throw new Error(await r.text().catch(()=>`HTTP ${r.status}`)) }
      const data = await r.json().catch(()=>[])
      setRows(Array.isArray(data) ? data : [])
    }catch(e){
      console.error('Load events failed:', e)
      setRows([])
      setError(t(lang,'common.error'))
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ load() /* on mount */ },[]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{ document.body.style.overflow = open ? 'hidden' : '' ; return ()=>{ document.body.style.overflow = '' } },[open])

  function openNew(){
    setEditing(null)
    setForm({
      ts: new Date().toISOString().slice(0,16),
      title: '',
      type: '',
      notes: '',
      tags: ''
    })
    setOpen(true)
  }
  function openEdit(e: EventItem){
    setEditing(e)
    setForm({
      id: e.id,
      ts: (e.ts||'').slice(0,16),
      title: e.title||'',
      type: e.type||'',
      notes: e.notes||'',
      tags: e.tags||'',
    })
    setOpen(true)
  }

  async function save(){
    if (saving) return
    setSaving(true)
    try{
      const method = editing?.id ? 'PUT' : 'POST'
      const url = editing?.id ? `/api/events/${editing.id}` : '/api/events'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(form)
      })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) { throw new Error(await r.text().catch(()=>`HTTP ${r.status}`)) }
      setOpen(false); setEditing(null)
      await load()
    }catch(e){
      console.error('Save event failed:', e)
      alert(t(lang,'common.error'))
    }finally{
      setSaving(false)
    }
  }

  async function del(id?: string){
    if (!id) return
    try{
      const r = await fetch(`/api/events/${id}`, { method: 'DELETE', headers: { accept: 'application/json' } })
      if (r.status === 401) { window.location.assign('/auth'); return }
      if (!r.ok) { throw new Error(await r.text().catch(()=>`HTTP ${r.status}`)) }
      setRows(prev => prev.filter(x=>x.id!==id))
    }catch(e){
      console.error('Delete event failed:', e)
      alert(t(lang,'common.error'))
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t(lang,'events.title')}</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2" onClick={openNew}>
          {t(lang,'events.new')}
        </button>
      </div>

      {loading && <div className="text-slate-500">{t(lang,'common.loading')}</div>}
      {!loading && error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && !error && rows.length===0 && <div className="text-slate-500">{t(lang,'events.list.empty')}</div>}

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2">{t(lang,'events.table.date')}</th>
              <th className="p-2">{t(lang,'events.table.title')}</th>
              <th className="p-2">{t(lang,'events.table.type')}</th>
              <th className="p-2">{t(lang,'events.table.notes')}</th>
              <th className="p-2">{t(lang,'events.table.tags')}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(e=>(
              <tr key={e.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{e.ts ? new Date(e.ts).toLocaleString() : '—'}</td>
                <td className="p-2">{e.title||'—'}</td>
                <td className="p-2">{e.type||'—'}</td>
                <td className="p-2">{e.notes||'—'}</td>
                <td className="p-2">{e.tags||'—'}</td>
                <td className="p-2 text-right whitespace-nowrap">
                  <button className="mr-2 underline" onClick={()=>openEdit(e)}>{t(lang,'common.edit')}</button>
                  <ConfirmDialog onConfirm={()=>del(e.id)}>
                    <button className="text-red-600 underline">{t(lang,'common.delete')}</button>
                  </ConfirmDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal
          title={editing ? t(lang,'events.edit') : t(lang,'events.new')}
          onClose={()=>setOpen(false)}
          onSubmit={save}
          primaryLabel={saving ? t(lang,'common.loading') : t(lang,'common.save')}
          cancelLabel={t(lang,'common.cancel')}
        >
          <div className="grid gap-3">
            <label className="text-sm">{t(lang,'events.form.date')}
              <input
                type="datetime-local"
                className="border rounded p-2 w-full"
                value={form.ts}
                onChange={e=>setForm({...form, ts:e.target.value})}
              />
            </label>
            <label className="text-sm">{t(lang,'events.form.title')}
              <input
                className="border rounded p-2 w-full"
                value={form.title}
                placeholder={t(lang,'events.ph.title')}
                onChange={e=>setForm({...form, title:e.target.value})}
              />
            </label>
            <label className="text-sm">{t(lang,'events.form.type')}
              <input
                className="border rounded p-2 w-full"
                value={form.type}
                placeholder={t(lang,'events.ph.type')}
                onChange={e=>setForm({...form, type:e.target.value})}
              />
            </label>
            <label className="text-sm">{t(lang,'events.form.notes')}
              <textarea
                className="border rounded p-2 w-full min-h-[90px]"
                value={form.notes}
                placeholder={t(lang,'events.ph.notes')}
                onChange={e=>setForm({...form, notes:e.target.value})}
              />
            </label>
            <label className="text-sm">{t(lang,'events.form.tags')}
              <input
                className="border rounded p-2 w-full"
                value={form.tags}
                placeholder={t(lang,'events.ph.tags')}
                onChange={e=>setForm({...form, tags:e.target.value})}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
