// app/app/qa/QAClient.tsx
'use client'

import { useState } from 'react'

export default function QAClient() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setAnswer(null)

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      setAnswer(data.answer || 'No answer received.')
    } catch (err) {
      console.error(err)
      setAnswer('Error fetching answer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Question / Signal
        </label>
        <input
          type="text"
          placeholder="Ask your question..."
          className="w-full border rounded p-3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--brand)] text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Answer'}
        </button>
      </form>

      {answer && (
        <div className="p-4 border rounded bg-slate-50">
          <h2 className="font-medium mb-2">Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}
