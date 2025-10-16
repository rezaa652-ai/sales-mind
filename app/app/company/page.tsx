'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { getLang, t, type Lang } from '@/lib/i18n'

type Company = {
  id?: string
  company_name: string
  geo_notes?: string
  unique_features?: string
  compliance?: string
  proof_points?: string
  disclaimer?: string
}

export default function CompanyPage() {
  const [lang, setLang] = useState<Lang>('sv')
  const [items, setItems] = useState<Company[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Company | null>(null)
  const [form, setForm] = useState<Company>({
    company_name: '',
    geo_notes: '',
    unique_features: '',
    compliance: '',
    proof_points: '',
    disclaimer: '',
  })

  useEffect(() => { setLang(getLang()) }, [])

  async function fetchCompanies() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/company', { headers: { accept: 'application/json' } })
      if (r.status === 401) {
        // not authenticated (avoid crashing on .json())
        window.location.assign('/auth')
        return
      }
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        throw new Error(text || `HTTP ${r.status}`)
      }
      const data = await r.json().catch(() => [])
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      console.error('Load companies failed:', e)
      setError(t(lang, 'common.error'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // lock background scroll while modal open
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function save() {
    if (saving) return
    setSaving(true)
    try {
      const method = editing?.id ? 'PUT' : 'POST'
      const url = editing?.id ? `/api/company/${editing.id}` : '/api/company'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (r.status === 401) {
        window.location.assign('/auth')
        return
      }
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        throw new Error(text || `HTTP ${r.status}`)
      }
      setOpen(false)
      setEditing(null)
      await fetchCompanies()
    } catch (e) {
      console.error('Save company failed:', e)
      alert(t(lang, 'common.error'))
    } finally {
      setSaving(false)
    }
  }

  async function del(id?: string) {
    if (!id) return
    try {
      const r = await fetch(`/api/company/${id}`, { method: 'DELETE', headers: { accept: 'application/json' } })
      if (r.status === 401) {
        window.location.assign('/auth')
        return
      }
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        throw new Error(text || `HTTP ${r.status}`)
      }
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e) {
      console.error('Delete company failed:', e)
      alert(t(lang, 'common.error'))
    }
  }

  function openNew() {
    setEditing(null)
    setForm({
      company_name: '',
      geo_notes: '',
      unique_features: '',
      compliance: '',
      proof_points: '',
      disclaimer: '',
    })
    setOpen(true)
  }

  function openEdit(c: Company) {
    setEditing(c)
    setForm({
      company_name: c.company_name || '',
      geo_notes: c.geo_notes || '',
      unique_features: c.unique_features || '',
      compliance: c.compliance || '',
      proof_points: c.proof_points || '',
      disclaimer: c.disclaimer || '',
      id: c.id,
    })
    setOpen(true)
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t(lang,'company.title')}</h1>
        <button
          className="bg-[var(--brand)] text-white rounded px-4 py-2"
          onClick={openNew}
        >
          {t(lang,'company.new')}
        </button>
      </div>

      {loading && <div className="text-slate-500">{t(lang,'common.loading')}</div>}
      {!loading && error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="text-slate-500">{t(lang,'company.list.empty')}</div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => (
          <div key={c.id} className="rounded-xl border p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{c.company_name || '—'}</div>
              <div className="flex items-center gap-3">
                <button className="underline" onClick={() => openEdit(c)}>{t(lang,'company.edit')}</button>
                <ConfirmDialog onConfirm={() => del(c.id)}>
                  <button className="text-red-600 underline">{t(lang,'common.delete')}</button>
                </ConfirmDialog>
              </div>
            </div>
            <div className="text-sm space-y-1 text-slate-700">
              {c.geo_notes && <div><b>{t(lang,'company.card.geo')}:</b> {c.geo_notes}</div>}
              {c.unique_features && <div><b>{t(lang,'company.card.unique')}:</b> {c.unique_features}</div>}
              {c.compliance && <div><b>{t(lang,'company.form.compliance')}:</b> {c.compliance}</div>}
              {c.proof_points && <div><b>{t(lang,'company.form.proof')}:</b> {c.proof_points}</div>}
              {c.disclaimer && <div><b>{t(lang,'company.card.disclaimer')}:</b> {c.disclaimer}</div>}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal
          title={editing ? t(lang,'company.edit') : t(lang,'company.new')}
          onClose={() => setOpen(false)}
          onSubmit={save}
          primaryLabel={saving ? t(lang,'common.loading') : t(lang,'common.save')}
          cancelLabel={t(lang,'common.cancel')}
        >
          <div className="grid gap-3">
            <label className="text-sm">{t(lang,'company.form.name')}
              <input
                className="border rounded p-2 w-full"
                value={form.company_name}
                placeholder={t(lang,'company.ph.name')}
                onChange={e=>setForm({...form, company_name:e.target.value})}
              />
            </label>

            <label className="text-sm">{t(lang,'company.form.geo')}
              <input
                className="border rounded p-2 w-full"
                value={form.geo_notes}
                placeholder={t(lang,'company.ph.geo')}
                onChange={e=>setForm({...form, geo_notes:e.target.value})}
              />
            </label>

            <label className="text-sm">{t(lang,'company.form.unique')}
              <input
                className="border rounded p-2 w-full"
                value={form.unique_features}
                placeholder={t(lang,'company.ph.unique')}
                onChange={e=>setForm({...form, unique_features:e.target.value})}
              />
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm">{t(lang,'company.form.compliance')}
                <input
                  className="border rounded p-2 w-full"
                  value={form.compliance}
                  placeholder={t(lang,'company.ph.compliance')}
                  onChange={e=>setForm({...form, compliance:e.target.value})}
                />
              </label>
              <label className="text-sm">{t(lang,'company.form.proof')}
                <input
                  className="border rounded p-2 w-full"
                  value={form.proof_points}
                  placeholder={t(lang,'company.ph.proof')}
                  onChange={e=>setForm({...form, proof_points:e.target.value})}
                />
              </label>
            </div>

            <label className="text-sm">{t(lang,'company.form.disclaimer')}
              <textarea
                className="border rounded p-2 w-full min-h-[110px]"
                value={form.disclaimer}
                placeholder={t(lang,'company.ph.disclaimer')}
                onChange={e=>setForm({...form, disclaimer:e.target.value})}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
