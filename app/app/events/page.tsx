'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'

type Row = {
  id: string; ts: string; profile_name: string; question: string; rating?: number; used?: boolean; tags?: string
}

export default function EventsPage() {
  const [rows, setRows] = useState<Row[] | null>(null)

  async function load() {
    const r = await fetch('/api/events')
    setRows(r.ok ? await r.json() : [])
  }
  useEffect(() => { load() }, [])

  async function update(ev: Row, patch: Partial<Row>) {
    await fetch(`/api/events/${ev.id}`, { method: 'PUT', body: JSON.stringify(patch) })
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold">Events</h1>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2 text-left">När</th><th className="p-2 text-left">Profil</th><th className="p-2 text-left">Fråga</th><th className="p-2 text-left">Rating</th><th className="p-2 text-left">Användes</th><th className="p-2 text-left">Taggar</th></tr></thead>
            <tbody>
              {rows === null && (
                <>
                  <tr><td className="p-2"><Skeleton className="h-5 w-40" /></td><td className="p-2"><Skeleton className="h-5 w-28" /></td><td className="p-2"><Skeleton className="h-5 w-80" /></td><td className="p-2"><Skeleton className="h-8 w-16" /></td><td className="p-2"><Skeleton className="h-8 w-24" /></td><td className="p-2"><Skeleton className="h-8 w-24" /></td></tr>
                </>
              )}
              {(rows || []).length === 0 && <tr><td colSpan={6} className="p-4 text-slate-500">Inga events ännu.</td></tr>}
              {(rows || []).map(r => (
                <tr key={r.id} className="align-top">
                  <td className="p-2 whitespace-nowrap">{new Date(r.ts).toLocaleString()}</td>
                  <td className="p-2">{r.profile_name}</td>
                  <td className="p-2 max-w-[420px]">{r.question}</td>
                  <td className="p-2">
                    <Input type="number" min={1} max={5} value={r.rating || 0} onChange={e => update(r, { rating: Number(e.target.value) })} />
                  </td>
                  <td className="p-2">
                    <Select value={r.used ? 'yes' : 'no'} onChange={e => update(r, { used: e.target.value === 'yes' })}>
                      <option value="no">Nej</option><option value="yes">Ja</option>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input value={r.tags || ''} onChange={e => update(r, { tags: e.target.value })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
