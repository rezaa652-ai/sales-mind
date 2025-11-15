'use client'
import { useState } from 'react'

export default function GeneratePersonas() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-behavior-personas', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage('✅ Personas generated successfully.')
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
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Working...' : 'Generate / Update Personas'}
        </button>
      </div>
      {message && <p className="text-sm text-black">{message}</p>}
    </div>
  )
}
