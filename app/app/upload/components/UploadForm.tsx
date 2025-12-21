'use client'

import { useState, DragEvent } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

function safeJsonError(err: unknown) {
  if (err instanceof Error) return err.message
  return String(err)
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) setFile(e.dataTransfer.files[0])
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  async function handleUpload() {
    if (!file) return alert('Please choose a file first.')
    setLoading(true)
    setMessage('')

    try {
      const sb = supabaseBrowser()

      // ✅ Must have a session for private bucket + RLS
      const { data: sessionData } = await sb.auth.getSession()
      const session = sessionData?.session
      if (!session?.user) throw new Error('Not authenticated')

      const userId = session.user.id
      const callId =
        (globalThis.crypto?.randomUUID?.() as string | undefined) ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`

      const safeName = (file.name || 'audio').replace(/\s+/g, '_')
      const path = `${userId}/${callId}_${safeName}`

      setMessage('Uploading to storage...')
      const { error: upErr } = await sb.storage
        .from('calls')
        .upload(path, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (upErr) throw new Error(upErr.message)

      setMessage('Registering call in database...')
      const regRes = await fetch('/api/calls/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ IMPORTANT (so API sees auth cookies on Vercel)
        body: JSON.stringify({
          callId,
          path,
          filename: safeName,
          mime_type: file.type || null,
          size_bytes: file.size || null,
        }),
      })

      const regText = await regRes.text()
      let regJson: any = null
      try { regJson = JSON.parse(regText) } catch {}
      if (!regRes.ok) {
        throw new Error(regJson?.error || regText || 'register_failed')
      }

      setMessage('Generating signed URL...')
      const urlRes = await fetch('/api/get-call-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ path }),
      })
      const urlText = await urlRes.text()
      let urlJson: any = null
      try { urlJson = JSON.parse(urlText) } catch {}
      const url = urlJson?.url
      if (!url) throw new Error(urlJson?.error || urlText || 'Failed to generate signed URL.')

      setMessage('Transcribing + creating personas...')
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ audioUrl: url, filename: safeName, userId, callId }),
      })
      const tText = await transcribeRes.text()
      let tJson: any = null
      try { tJson = JSON.parse(tText) } catch {}
      if (!transcribeRes.ok || !tJson?.ok) {
        throw new Error(tJson?.error || tText || 'Transcription failed.')
      }

      setMessage('Upload + transcription complete!')
      window.dispatchEvent(new Event('callsUpdated'))
      window.dispatchEvent(new Event('personasUpdated'))
      setFile(null)
    } catch (err) {
      console.error(err)
      setMessage('Upload failed: ' + safeJsonError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-black rounded-xl bg-white shadow-sm">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
          dragOver ? 'border-blue-600 bg-blue-50' : 'border-black bg-white'
        }`}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <p className="text-black">
          {file ? (
            <strong>{file.name}</strong>
          ) : (
            <>
              <span className="block text-lg font-semibold">Drag & drop your file here</span>
              <span className="text-sm text-black/60">or click below to choose a file</span>
            </>
          )}
        </p>
        <input
          id="fileInput"
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Working...' : 'Upload'}
        </button>
      </div>

      {message && <p className="text-sm mt-2 text-black">{message}</p>}
    </div>
  )
}
