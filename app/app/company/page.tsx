'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'

type Row = {
  id: string; company_name: string; market: string; geo_notes: string; products: string; unique_features: string;
  compliance: string; proof_points: string; public_links: string; disclaimer: string
}

export default function CompanyPage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [open, setOpen] = useState(false)
  const empty: Partial<Row> = { company_name:'', market:'', geo_notes:'', products:'', unique_features:'', compliance:'', proof_points:'', public_links:'', disclaimer:'' }
  const [form, setForm] = useState<Partial<Row>>(empty)
  const [editing, setEditing] = useState<Row | null>(null)

  async function load() {
    const r = await fetch('/api/company')
    setRows(r.ok ? await r.json() : [])
  }
  useEffect(() => { load() }, [])

  async function save() {
    const url = editing ? `/api/company/${editing.id}` : '/api/company'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, body: JSON.stringify(form) })
    if (res.ok) { setOpen(false); setEditing(null); setForm(empty); load() } else alert('Fel vid sparande')
  }
  async function del(id: string) {
    const res = await fetch(`/api/company/${id}`, { method:'DELETE' })
    if (res.ok) load(); else alert('Fel vid borttagning')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold">Company</h1>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true) }}>+ New</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Market</th><th className="p-2 text-left">Features</th><th className="p-2"></th></tr></thead>
            <tbody>
              {rows === null && (
                <>
                  <tr><td className="p-2"><Skeleton className="h-5 w-48" /></td><td className="p-2"><Skeleton className="h-5 w-28" /></td><td className="p-2"><Skeleton className="h-5 w-64" /></td><td></td></tr>
                  <tr><td className="p-2"><Skeleton className="h-5 w-48" /></td><td className="p-2"><Skeleton className="h-5 w-28" /></td><td className="p-2"><Skeleton className="h-5 w-64" /></td><td></td></tr>
                </>
              )}
              {rows && rows.length === 0 && <tr><td colSpan={4} className="p-4 text-slate-500">Inga companies ännu.</td></tr>}
              {(rows || []).map(r => (
                <tr key={r.id}>
                  <td className="p-2">{r.company_name}</td>
                  <td className="p-2">{r.market}</td>
                  <td className="p-2">{r.unique_features}</td>
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
        <Modal title={editing ? 'Edit company' : 'New company'} onClose={() => setOpen(false)} onSubmit={save}>
          <div className="grid gap-2">
            <Input label="Company name" value={form.company_name || ''} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            <Input label="Market" value={form.market || ''} onChange={e => setForm({ ...form, market: e.target.value })} />
            <Input label="Geo notes" value={form.geo_notes || ''} onChange={e => setForm({ ...form, geo_notes: e.target.value })} />
            <Input label="Products" value={form.products || ''} onChange={e => setForm({ ...form, products: e.target.value })} />
            <Input label="Unique features" value={form.unique_features || ''} onChange={e => setForm({ ...form, unique_features: e.target.value })} />
            <Input label="Compliance" value={form.compliance || ''} onChange={e => setForm({ ...form, compliance: e.target.value })} />
            <Input label="Proof points" value={form.proof_points || ''} onChange={e => setForm({ ...form, proof_points: e.target.value })} />
            <Input label="Public links" value={form.public_links || ''} onChange={e => setForm({ ...form, public_links: e.target.value })} />
            <Input label="Disclaimer" value={form.disclaimer || ''} onChange={e => setForm({ ...form, disclaimer: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  )
}
