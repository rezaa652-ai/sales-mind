'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function AICallSession() {
  const { id } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<{ user?: string; ai?: string }[]>([])
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // initialize browser speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return
    const SR = (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript
      setMessages(m => [...m, { user: transcript }])
      await handleAIReply(transcript)
    }
    recognitionRef.current = rec
  }, [id])

  async function handleAIReply(userText: string) {
    try {
      const res = await fetch('/api/voice-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: id, userText }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(m => [...m, { ai: data.reply }])
        // play audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`)
        audioRef.current = audio
        audio.play()
        audio.onended = () => {
          // when AI stops talking, start listening again
          recognitionRef.current?.start()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  function startCall() {
    recognitionRef.current?.start()
    setListening(true)
  }

  function stopCall() {
    recognitionRef.current?.stop()
    setListening(false)
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
              {msg.user && `🗣 You: ${msg.user}`}
              {msg.ai && `🤖 AI: "${msg.ai}"`}
            </p>
          ))
        )}
      </div>

      <div className="flex gap-4">
        {!listening ? (
          <button
            onClick={startCall}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            🎤 Start Call
          </button>
        ) : (
          <button
            onClick={stopCall}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            ⏹ Stop
          </button>
        )}
      </div>
    </div>
  )
}
