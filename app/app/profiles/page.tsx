'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'

type Company = { id: string; company_name: string }
type Row = {
  id: string; name: string; language: string; tone: string; callback_windows: string; goals: string; sales_targets: string;
  persona_hints: string; compliance: string; proof: string; company_id?: string | null
}

export default function ProfilesPage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [open, setOpen] = useState(false)
  const emptyForm: Partial<Row> = { name:'', language:'Svenska', tone:'Konkret', callback_windows:'12:15,16:40', goals:'Avslut|Boka uppföljning|Kvalificera|Boka 3 möten/dag', sales_targets:'3 meetings/day', persona_hints:'', compliance:'', proof:'', company_id:'' }
  const [form, setForm] = useState<Partial<Row>>(emptyForm)
  const [editing, setEditing] = useState<Row | null>(null)

  async function load() {
    const [r, c] = await Promise.all([fetch('/api/profiles'), fetch('/api/company')])
    setRows(r.ok ? await r.json() : [])
    setCompanies(c.ok ? await c.json() : [])
  }
  useEffect(() => { load() }, [])

  async function save() {
    const url = editing ? `/api/profiles/${editing.id}` : '/api/profiles'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, body: JSON.stringify(form) })
    if (res.ok) { setOpen(false); setEditing(null); setForm(emptyForm); load() } else alert('Fel vid sparande')
  }
  async function del(id: string) {
    const res = await fetch(`/api/profiles/${id}`, { method:'DELETE' })
    if (res.ok) load(); else alert('Fel vid borttagning')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold">Profiles</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true) }}>+ New</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Language</th><th className="p-2 text-left">Tone</th><th className="p-2 text-left">Company</th><th className="p-2"></th></tr>
            </thead>
            <tbody>
              {rows === null && (
                <>
                  <tr><td className="p-2"><Skeleton className="h-5 w-40" /></td><td className="p-2"><Skeleton className="h-5 w-24" /></td><td className="p-2"><Skeleton className="h-5 w-28" /></td><td className="p-2"><Skeleton className="h-5 w-28" /></td><td></td></tr>
                  <tr><td className="p-2"><Skeleton className="h-5 w-40" /></td><td className="p-2"><Skeleton className="h-5 w-24" /></td><td className="p-2"><Skeleton className="h-5 w-28" /></td><td className="p-2"><Skeleton className="h-5 w-28" /></td><td></td></tr>
                </>
              )}
              {rows && rows.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-slate-500">Inga profiler ännu.</td></tr>
              )}
              {(rows || []).map(r => (
                <tr key={r.id}>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.language}</td>
                  <td className="p-2">{r.tone}</td>
                  <td className="p-2">{(companies || []).find(c => c.id === r.company_id)?.company_name || '-'}</td>
                  <td className="p-2 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true) }}>Edit</Button>
                    <ConfirmDialog onConfirm={() => del(r.id)}>
                      <Button variant="danger" size="sm">Delete</Button>
                    </ConfirmDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal title={editing ? 'Edit profile' : 'New profile'} onClose={() => setOpen(false)} onSubmit={save}>
          <div className="grid gap-3">
            <Input label="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="Language" value={form.language || ''} onChange={e => setForm({ ...form, language: e.target.value })} />
            <Input label="Tone" value={form.tone || ''} onChange={e => setForm({ ...form, tone: e.target.value })} />
            <Input label="Callback windows" value={form.callback_windows || ''} onChange={e => setForm({ ...form, callback_windows: e.target.value })} />
            <Input label="Goals" value={form.goals || ''} onChange={e => setForm({ ...form, goals: e.target.value })} />
            <Input label="Sales targets" value={form.sales_targets || ''} onChange={e => setForm({ ...form, sales_targets: e.target.value })} />
            <Input label="Persona hints" value={form.persona_hints || ''} onChange={e => setForm({ ...form, persona_hints: e.target.value })} />
            <Input label="Compliance" value={form.compliance || ''} onChange={e => setForm({ ...form, compliance: e.target.value })} />
            <Input label="Proof" value={form.proof || ''} onChange={e => setForm({ ...form, proof: e.target.value })} />
            <Select label="Company" value={form.company_id || ''} onChange={e => setForm({ ...form, company_id: e.target.value || null })}>
              <option value="">— none —</option>
              {(companies || []).map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </Select>
          </div>
        </Modal>
      )}
    </div>
  )
}
