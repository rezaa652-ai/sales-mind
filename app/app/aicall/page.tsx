'use client'
import { useRouter } from 'next/navigation'

const personas = [
  {
    id: 'price-sensitive',
    name: 'Price Sensitive',
    description: 'Focuses heavily on discounts and cost justification.',
  },
  {
    id: 'hard-to-sell',
    name: 'Hard to Sell',
    description: 'Skeptical, slow to trust, often objects repeatedly.',
  },
  {
    id: 'friendly',
    name: 'Friendly & Curious',
    description: 'Open to dialogue but asks many questions.',
  },
]

export default function AICallPage() {
  const router = useRouter()
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🎧 Start AI Call Simulation</h1>
      <p className="text-gray-600">
        Choose a customer type below to start a voice simulation. The AI will respond with tone,
        emotion, and objections based on this persona.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {personas.map((p) => (
          <div
            key={p.id}
            onClick={() => router.push(`/app/aicall/${p.id}`)}
            className="border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer bg-white transition"
          >
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.description}</p>
            <button className="mt-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg">
              Start Call →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
