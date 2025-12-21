'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AICallPage() {
  const router = useRouter()
  const [customerPersonas, setCustomerPersonas] = useState<any[]>([])
  const [salesPersonas, setSalesPersonas] = useState<any[]>([])

  // 🔹 Fetch all personas and split by role
  async function fetchPersonas() {
    const res = await fetch('/api/personas/list')
    const data = await res.json()
    const personas = data.personas || []
    setCustomerPersonas(personas.filter((p: any) => p.role === 'customer'))
    setSalesPersonas(personas.filter((p: any) => p.role === 'salesperson'))
  }

  // Initial fetch
  useEffect(() => {
    fetchPersonas()
  }, [])

  // 🔄 Auto-refresh when new personas created
  useEffect(() => {
    const onRefresh = () => fetchPersonas()
    window.addEventListener('personasUpdated', onRefresh)
    return () => window.removeEventListener('personasUpdated', onRefresh)
  }, [])

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">🎧 Start AI Call Simulation</h1>
        <p className="text-gray-600 mb-6">
          Personas are generated automatically from your uploaded calls.  
          Choose a persona to start a realistic AI call simulation.
        </p>
      </div>

      {/* 💼 Salesperson Personas */}
      <section>
        <h2 className="text-xl font-semibold mb-3">💼 Salesperson Personas</h2>
        {salesPersonas.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No salesperson personas yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salesPersonas.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/app/aicall/${p.id}`)}
                className="border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer bg-white transition"
              >
                <h3 className="font-semibold text-lg text-blue-700">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.description}</p>
                <p className="text-xs text-gray-400 mt-1">{p.behavior}</p>
                <button className="mt-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                  Start Call →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 👤 Customer Personas */}
      <section>
        <h2 className="text-xl font-semibold mb-3">🧍‍♂️ Customer Personas</h2>
        {customerPersonas.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No customer personas yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerPersonas.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/app/aicall/${p.id}`)}
                className="border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer bg-white transition"
              >
                <h3 className="font-semibold text-lg text-green-700">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.description}</p>
                <p className="text-xs text-gray-400 mt-1">{p.behavior}</p>
                <button className="mt-3 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                  Start Call →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

