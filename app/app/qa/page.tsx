'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Skeleton from '@/components/ui/Skeleton'

type Company = { id: string; company_name: string }
type Profile = { id: string; name: string }

export default function QAPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null)
  const [profiles, setProfiles] = useState<Profile[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ company_id: '', profile_id: '', question: '', goal: '', segment: '', channel: '', numbers: '' })
  const [ans, setAns] = useState<any>(null)
  const [feedback, setFeedback] = useState({ rating: 0, used: false, tags: '' })
  const [error, setError] = useState<string>('')

  async function load() {
    try {
      setLoading(true)
      const [c, p] = await Promise.all([fetch('/api/company'), fetch('/api/profiles')])
      if (!c.ok || !p.ok) throw new Error('Kunde inte hämta data')
      setCompanies(await c.json())
      setProfiles(await p.json())
    } catch (e: any) {
      setError(e?.message || 'Nätverksfel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function getAnswer() {
    setAns(null)
    const r = await fetch('/api/qa', { method: 'POST', body: JSON.stringify(form) })
    const data = await r.json()
    if (!r.ok) { setError(data?.error || 'Fel i Q&A'); return }
    setAns(data)
  }

  async function saveFeedback() {
    if (!ans?.id) return
    await fetch(`/api/events/${ans.id}`, { method: 'PUT', body: JSON.stringify(feedback) })
    alert('Feedback sparad')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold">Q&A</h1>
        <Button onClick={getAnswer}>Get answer</Button>
      </div>

      <Card className="mb-6">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-9" /><Skeleton className="h-9" />
            <Skeleton className="h-9" /><Skeleton className="h-9" />
            <Skeleton className="h-9" /><Skeleton className="h-24 md:col-span-2" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <Select label="Company" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}>
              <option value="">— none —</option>
              {(companies || []).map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </Select>
            <Select label="Profile" value={form.profile_id} onChange={e => setForm({ ...form, profile_id: e.target.value })}>
              <option value="">— välj —</option>
              {(profiles || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input label="Goal" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} />
            <Input label="Segment" value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })} />
            <Input label="Channel" value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} />
            <Input label="Numbers" value={form.numbers} onChange={e => setForm({ ...form, numbers: e.target.value })} />
            <Textarea label="Question / Signal" className="md:col-span-2" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
          </div>
        )}
        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
      </Card>

      {ans && (
        <div className="grid gap-4">
          <Card><b>One-liner:</b> <div className="mt-1">{ans.one_liner}</div></Card>
          <Card><b>Varför:</b> <div className="mt-1">{ans.why}</div></Card>
          <Card><b>Bekräfta:</b> <div className="mt-1">{ans.ack}</div></Card>
          <Card><b>Kort manus:</b> <div className="mt-1 whitespace-pre-wrap">{ans.short_script}</div></Card>
          <Card><b>Fullt manus:</b> <div className="mt-1 whitespace-pre-wrap">{ans.full_script}</div></Card>
          <Card><b>Uträkning:</b> <div className="mt-1">{ans.math}</div></Card>
          <Card><b>Nästa steg:</b> <div className="mt-1">{ans.next_step}</div></Card>

          <Card>
            <h3 className="font-medium mb-2">Feedback</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <Input label="Rating (1–5)" type="number" min={1} max={5}
                value={feedback.rating} onChange={e => setFeedback({ ...feedback, rating: Number(e.target.value) })} />
              <Select label="Användes?" value={feedback.used ? 'yes' : 'no'} onChange={e => setFeedback({ ...feedback, used: e.target.value === 'yes' })}>
                <option value="no">Nej</option><option value="yes">Ja</option>
              </Select>
              <Input label="Taggar" value={feedback.tags} onChange={e => setFeedback({ ...feedback, tags: e.target.value })} />
            </div>
            <div className="mt-3">
              <Button variant="ghost" onClick={saveFeedback}>Spara feedback</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
