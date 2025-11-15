'use client'
import { useState, useEffect } from 'react'
import { MoreVertical, Edit, Trash } from 'lucide-react'

export default function PersonasPanel() {
  const [personas, setPersonas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  async function fetchPersonas() {
    try {
      const res = await fetch('/api/get-personas')
      const data = await res.json()
      setPersonas(data.personas || [])
    } catch (e) {
      console.error('Failed to fetch personas:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-behavior-personas', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage('✅ Personas generated successfully!')
        fetchPersonas()
      } else {
        setMessage('❌ ' + data.error)
      }
    } catch (err: any) {
      setMessage('❌ ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this persona?')) return
    try {
      const res = await fetch('/api/delete-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setPersonas(personas.filter(p => p.id !== id))
      } else alert('❌ ' + data.error)
    } catch (e) {
      alert('❌ Delete failed')
    }
  }

  useEffect(() => {
    fetchPersonas()
  }, [])

  const customers = personas.filter(p => p.role === 'customer')
  const salespeople = personas.filter(p => p.role === 'salesperson')

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Centered Generate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {generating ? 'Generating...' : 'Generate Personas'}
        </button>
      </div>

      {message && (
        <p className={`text-center mb-4 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      {/* Loading shimmer */}
      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : personas.length === 0 ? (
        <p className="text-center text-gray-500">No personas yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Personas */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Customer Personas</h3>
            {customers.length === 0 ? (
              <p className="text-sm text-gray-500">No customer personas yet.</p>
            ) : (
              customers.map((p) => (
                <div
                  key={p.id || p.name}
                  className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm mb-3 relative"
                >
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {menuOpen === p.id && (
                      <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-2 px-3 py-2 w-full text-left text-red-600 hover:bg-gray-100"
                        >
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 className="font-semibold text-black">{p.name}</h4>
                  <p className="text-gray-700 text-sm mt-1">{p.description}</p>
                  {p.behavior && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Behavior:</strong> {p.behavior}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Salesperson Personas */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Salesperson Personas</h3>
            {salespeople.length === 0 ? (
              <p className="text-sm text-gray-500">No salesperson personas yet.</p>
            ) : (
              salespeople.map((p) => (
                <div
                  key={p.id || p.name}
                  className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm mb-3 relative"
                >
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {menuOpen === p.id && (
                      <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-2 px-3 py-2 w-full text-left text-red-600 hover:bg-gray-100"
                        >
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 className="font-semibold text-black">{p.name}</h4>
                  <p className="text-gray-700 text-sm mt-1">{p.description}</p>
                  {p.behavior && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Behavior:</strong> {p.behavior}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  )
}
