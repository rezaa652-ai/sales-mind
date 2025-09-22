'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'

type Row = { id: string; signal: string; best_practice: string; profile_name: string }

export default function KBPage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [open, setOpen] = useState(false)
  const empty: Partial<Row> = { signal:'', best_practice:'', profile_name:'' }
  const [form, setForm] = useState<Partial<Row>>(empty)
  const [editing, setEditing] = useState<Row | null>(null)

  async function load() {
    const r = await fetch('/api/kb')
    setRows(r.ok ? await r.json() : [])
  }
  useEffect(() => { load() }, [])

  async function save() {
    const url = editing ? `/api/kb/${editing.id}` : '/api/kb'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, body: JSON.stringify(form) })
    if (res.ok) { setOpen(false); setEditing(null); setForm(empty); load() } else alert('Fel vid sparande')
  }
  async function del(id: string) {
    const res = await fetch(`/api/kb/${id}`, { method:'DELETE' })
    if (res.ok) load(); else alert('Fel vid borttagning')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold">Knowledge Base</h1>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true) }}>+ Ny entry</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-3 text-left">Signal</th><th className="p-3 text-left">Best practice</th><th className="p-3 text-left">Profil</th><th className="p-3"></th></tr></thead>
            <tbody>
              {rows === null && (
                <>
                  <tr><td className="p-3"><Skeleton className="h-5 w-56" /></td><td className="p-3"><Skeleton className="h-5 w-96" /></td><td className="p-3"><Skeleton className="h-5 w-40" /></td><td></td></tr>
                </>
              )}
              {rows && rows.length === 0 && <tr><td className="p-6 text-slate-500" colSpan={4}>Inga KB entries ännu.</td></tr>}
              {(rows || []).map(r => (
                <tr key={r.id}>
                  <td className="p-3">{r.signal}</td>
                  <td className="p-3">{r.best_practice}</td>
                  <td className="p-3">{r.profile_name}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm(r); setOpen(true) }}>Redigera</Button>
                    <ConfirmDialog onConfirm={() => del(r.id)}>
                      <Button variant="danger" size="sm">Ta bort</Button>
                    </ConfirmDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal title={editing ? 'Redigera KB' : 'Ny KB entry'} onClose={() => setOpen(false)} onSubmit={save}>
          <div className="grid gap-3">
            <Input label="Signal" value={form.signal || ''} onChange={e => setForm({ ...form, signal: e.target.value })} />
            <Textarea label="Best practice" value={form.best_practice || ''} onChange={e => setForm({ ...form, best_practice: e.target.value })} />
            <Input label="Profil" value={form.profile_name || ''} onChange={e => setForm({ ...form, profile_name: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  )
}
