'use client'

import { useState, DragEvent } from 'react'

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

  async function handleUpload() {
    if (!file) return alert('Please choose a file first.')
    setLoading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setMessage('✅ File uploaded successfully!')
        setFile(null)
      } else {
        setMessage('❌ ' + data.error)
      }
    } catch (err: any) {
      setMessage('❌ Upload failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTranscribe() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/transcribe', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage('✅ Transcription complete!')
      } else {
        setMessage('❌ ' + data.error)
      }
    } catch (err: any) {
      setMessage('❌ ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-black rounded-xl bg-white shadow-sm">
      {/* Drag & Drop area */}
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
              <span className="block text-lg font-semibold">
                Drag & drop your file here
              </span>
              <span className="text-sm text-black/60">
                or click below to choose a file
              </span>
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

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          onClick={handleTranscribe}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Working...' : 'Transcribe'}
        </button>
      </div>

      {message && <p className="text-sm mt-2 text-black">{message}</p>}
    </div>
  )
}
