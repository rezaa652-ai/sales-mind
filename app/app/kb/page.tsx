'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getLang, t, type Lang } from '@/lib/i18n'

type KB = {
  id?: string
  title?: string
  signal?: string
  best_practice?: string
  tags?: string
}

export default function KBPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [items, setItems] = useState<KB[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<KB | null>(null)
  const [form, setForm] = useState<KB>({ title: '', signal: '', best_practice: '', tags: '' })

  useEffect(()=>{ setLang(getLang()) }, [])
  useEffect(()=>{
    ;(async()=>{
      const r = await fetch('/api/kb')
      setItems(await r.json())
    })()
  }, [])

  useEffect(()=>{
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  function openNew(){
    setEditing(null)
    setForm({ title: '', signal: '', best_practice: '', tags: '' })
    setOpen(true)
  }
  function openEdit(k: KB){
    setEditing(k)
    setForm({ title: k.title||'', signal: k.signal||'', best_practice: k.best_practice||'', tags: k.tags||'' })
    setOpen(true)
  }

  async function save(){
    if (saving) return
    setSaving(true)
    const method = editing?.id ? 'PUT' : 'POST'
    const url = editing?.id ? `/api/kb/${editing.id}` : '/api/kb'
    const r = await fetch(url, { method, body: JSON.stringify(form) })
    setSaving(false)
    if (!r.ok) return alert(t(lang,'common.error'))
    setOpen(false); setEditing(null)
    const rr = await fetch('/api/kb')
    setItems(await rr.json())
  }

  async function del(id: string){
    const r = await fetch(`/api/kb/${id}`, { method: 'DELETE' })
    if (r.ok) setItems(items.filter(i=>i.id!==id))
    else alert(t(lang,'common.error'))
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t(lang,'kb.title')}</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2" onClick={openNew}>
          {t(lang,'kb.new')}
        </button>
      </div>

      {items.length===0 && <div className="text-slate-500">{t(lang,'kb.list.empty')}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(k => (
          <div key={k.id} className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{k.title || '—'}</div>
              <div className="flex items-center gap-3">
                <button className="underline" onClick={()=>openEdit(k)}>{t(lang,'kb.edit')}</button>
                <ConfirmDialog onConfirm={()=>del(k.id!)}>
                  <button className="text-red-600 underline">{t(lang,'common.delete')}</button>
                </ConfirmDialog>
              </div>
            </div>
            <div className="text-sm text-slate-700 space-y-1">
              {k.signal && <div><b>{t(lang,'kb.form.signal')}:</b> {k.signal}</div>}
              {k.best_practice && <div><b>{t(lang,'kb.form.best')}:</b> {k.best_practice}</div>}
              {k.tags && <div><b>{t(lang,'kb.form.tags')}:</b> {k.tags}</div>}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal
          title={editing ? t(lang,'kb.edit') : t(lang,'kb.new')}
          onClose={() => setOpen(false)}
          onSubmit={save}
          primaryLabel={saving ? t(lang,'common.loading') : t(lang,'common.save')}
          cancelLabel={t(lang,'common.cancel')}
        >
          <div className="grid gap-3">
            <label className="text-sm">{t(lang,'kb.form.title')}
              <input
                className="border rounded p-2 w-full"
                value={form.title}
                placeholder={t(lang,'kb.ph.title')}
                onChange={e=>setForm({...form, title:e.target.value})}
              />
            </label>

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
                className="border rounded p-2 w-full min-h-[100px]"
                value={form.best_practice}
                placeholder={t(lang,'kb.ph.best')}
                onChange={e=>setForm({...form, best_practice:e.target.value})}
              />
            </label>

            <label className="text-sm">{t(lang,'kb.form.tags')}
              <input
                className="border rounded p-2 w-full"
                value={form.tags}
                placeholder={t(lang,'kb.ph.tags')}
                onChange={e=>setForm({...form, tags:e.target.value})}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
