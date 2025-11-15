'use client'
import { useEffect, useState } from 'react'
import { MoreVertical, Edit, Trash } from 'lucide-react'

export default function PersonaList() {
  const [personas, setPersonas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  async function fetchPersonas() {
    const res = await fetch('/api/get-personas')
    const data = await res.json()
    const unique = Array.from(new Map(data.personas.map(p => [p.name + p.type, p])).values())
    setPersonas(unique || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this persona?')) return
    const res = await fetch('/api/delete-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.success) setPersonas(personas.filter(p => p.id !== id))
    else alert('❌ Error: ' + data.error)
  }

  useEffect(() => {
    fetchPersonas()
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.persona-menu') && !target.closest('.persona-menu-btn')) {
        setMenuOpen(null)
      }
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  if (loading)
    return (
      <div className="grid grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-100 rounded-lg animate-pulse border border-gray-200"
          ></div>
        ))}
      </div>
    )

  if (!personas.length)
    return <p className="text-gray-400 text-center">No personas yet.</p>

  const customers = personas.filter(p => p.type === 'customer')
  const salespeople = personas.filter(p => p.type === 'salesperson')

  const renderCard = (p: any) => (
    <div
      key={p.id}
      className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm relative hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-black text-base">{p.name}</h4>
          <p className="text-sm text-gray-700 mb-2">{p.description}</p>
          <p className="text-sm text-gray-600"><strong>Behavior:</strong> {p.behavior || 'N/A'}</p>
          <p className="text-sm text-gray-600"><strong>Tone:</strong> {p.tone || 'N/A'}</p>
          <p className="text-sm text-gray-600"><strong>Motivation:</strong> {p.motivation || 'N/A'}</p>
          <p className="text-sm text-gray-600"><strong>Communication Style:</strong> {p.communication_style || 'N/A'}</p>

          {p.pain_points?.length > 0 && (
            <>
              <p className="text-sm text-gray-700 mt-2"><strong>Pain Points:</strong></p>
              <ul className="list-disc pl-4 text-sm text-gray-600">
                {p.pain_points.map((o: string, i: number) => <li key={i}>{o}</li>)}
              </ul>
            </>
          )}

          {p.buying_triggers?.length > 0 && (
            <>
              <p className="text-sm text-gray-700 mt-2"><strong>Buying Triggers:</strong></p>
              <ul className="list-disc pl-4 text-sm text-gray-600">
                {p.buying_triggers.map((o: string, i: number) => <li key={i}>{o}</li>)}
              </ul>
            </>
          )}

          {p.objection_examples?.length > 0 && (
            <>
              <p className="text-sm text-gray-700 mt-2"><strong>Objection Examples:</strong></p>
              <ul className="list-disc pl-4 text-sm text-gray-600">
                {p.objection_examples.map((o: string, i: number) => <li key={i}>{o}</li>)}
              </ul>
            </>
          )}
        </div>

        {/* Menu */}
        <div className="relative persona-menu">
          <button
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(menuOpen === p.id ? null : p.id)
            }}
            className="persona-menu-btn text-gray-800 hover:text-black p-1"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen === p.id && (
            <div
              className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              onClick={e => e.stopPropagation()}
            >
              <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100">
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div>
        <h3 className="text-lg font-semibold text-black mb-3">Customers</h3>
        {customers.map(renderCard)}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-black mb-3">Salespeople</h3>
        {salespeople.map(renderCard)}
      </div>
    </div>
  )
}
