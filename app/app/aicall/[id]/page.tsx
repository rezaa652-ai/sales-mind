'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function AICallSession() {
  const { id } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<string[]>([])
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Browser speech recognition (MVP)
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return
    const SpeechRecognition = (window as any).webkitSpeechRecognition
    const recog = new SpeechRecognition()
    recog.lang = 'en-US'
    recog.interimResults = false
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setMessages((m) => [...m, `🗣 You: ${transcript}`])
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          `🤖 AI: "${generateAIResponse(transcript, id as string)}"`,
        ])
      }, 800)
    }
    recognitionRef.current = recog
  }, [id])

  function startListening() {
    recognitionRef.current?.start()
    setListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function generateAIResponse(input: string, persona: string) {
    if (persona === 'price-sensitive') {
      if (input.includes('price') || input.includes('discount'))
        return 'I really need to know if this is the best deal possible.'
      return "Hmm... I'm not sure it's worth the cost."
    }
    if (persona === 'hard-to-sell') {
      return "I don't think this will fit our needs right now."
    }
    return "That sounds interesting, tell me more!"
  }

  return (
    <div className="p-6 space-y-4">
      <button onClick={() => router.push('/app/aicall')} className="text-blue-600 underline">
        ← Back to Personas
      </button>
      <h2 className="text-xl font-semibold capitalize">🧠 AI Persona: {id}</h2>

      <div className="border rounded-xl p-4 h-64 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">Call not started yet.</p>
        ) : (
          messages.map((msg, i) => (
            <p key={i} className="text-sm text-gray-800 mb-1">
              {msg}
            </p>
          ))
        )}
      </div>

      <div className="flex gap-4">
        {!listening ? (
          <button
            onClick={startListening}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            🎤 Start Talking
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            ⏹ Stop
          </button>
        )}
      </div>
    </div>
  )
}
