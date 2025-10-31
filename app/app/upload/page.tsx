'use client'
import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File|null>(null)
  const [msg, setMsg] = useState('')
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    if (!file) { setMsg('Välj en ljudfil först.'); return }
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/audio/upload', { method: 'POST', body: fd })
    const j = await r.json().catch(()=>null)
    if (!r.ok || !j?.ok) { setMsg(j?.error || 'Uppladdning misslyckades'); return }
    setMsg('Uppladdat och transkriberat!')
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload audio</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="file"
          accept="audio/*"
          onChange={(e)=>setFile(e.target.files?.[0] || null)}
          className="block"
        />
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2">
          Upload & Transcribe
        </button>
      </form>
      {msg && <div className="text-sm text-slate-700">{msg}</div>}
    </div>
  )
}
