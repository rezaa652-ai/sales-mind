'use client'

import { useState, DragEvent } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  async function safeJson(res: Response) {
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(text || `HTTP ${res.status}`)
    }
  }

  // ✅ Upload (direct to Supabase) → register DB → transcribe → refresh UI
  async function handleUpload() {
    if (!file) return alert('Please choose a file first.')
    setLoading(true)
    setMessage('')

    try {
      setMessage('Uploading to storage...')

      const sb = supabaseBrowser()
      const { data: auth } = await sb.auth.getUser()
      const user = auth?.user
      if (!user) throw new Error('Not authenticated')

      const callId = crypto.randomUUID()
      const safeName = (file.name || 'audio').replace(/\s+/g, '_')
      const path = `${user.id}/${callId}_${safeName}`

      // Direct upload to private bucket "calls"
      const { error: upErr } = await sb.storage
        .from('calls')
        .upload(path, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (upErr) throw new Error(upErr.message)

      setMessage('Registering call in database...')

      // Register in DB (server-side, JSON only)
      const regRes = await fetch('/api/calls/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: callId,
          file_path: path,
          filename: safeName,
          mime_type: file.type || null,
          size_bytes: file.size || null,
        }),
      })

      const regData = await safeJson(regRes)
      if (!regData.ok) throw new Error(regData.error || 'Register failed')

      setMessage('✅ Uploaded. Starting transcription...')
      window.dispatchEvent(new Event('callsUpdated'))

      await handleTranscribe(regData.path, regData.filename, regData.userId, regData.callId)
    } catch (err: any) {
      console.error('Upload error:', err)
      setMessage('❌ Upload failed: ' + (err?.message || String(err)))
    } finally {
      setLoading(false)
      setFile(null)
    }
  }

  async function handleTranscribe(path: string, filename: string, userId: string, callId: string) {
    try {
      setMessage('Generating signed URL...')
      const urlRes = await fetch('/api/get-call-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ path }),
      })
      const urlData = await safeJson(urlRes)
      if (!urlData.url) throw new Error('Failed to generate signed URL.')

      setMessage('Transcribing + creating persona...')
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ audioUrl: urlData.url, filename, userId, callId }),
      })

      const transcribeData = await safeJson(transcribeRes)
      if (transcribeData.ok) {
        setMessage('✅ Transcription complete + Persona generated!')
        window.dispatchEvent(new Event('callsUpdated'))
        window.dispatchEvent(new Event('personasUpdated'))
      } else {
        throw new Error(transcribeData.error || 'Transcription failed.')
      }
    } catch (err: any) {
      console.error('Transcribe error:', err)
      setMessage('❌ ' + (err?.message || String(err)))
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
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {message && <p className="text-sm mt-2 text-black">{message}</p>}
    </div>
  )
}
