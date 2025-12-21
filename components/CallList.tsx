'use client'

import { useEffect, useState, useRef } from 'react'
import { MoreVertical, Trash, Download, FileAudio, Rewind, FastForward } from 'lucide-react'

export default function CallList() {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})
  const menuRef = useRef<HTMLDivElement | null>(null)

  async function fetchCalls() {
    const res = await fetch("/api/get-calls")
    const data = await res.json()

    const validCalls: any[] = []

    for (const call of data.calls || []) {
      const urlRes = await fetch("/api/get-call-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `${call.owner}/${call.filename}` }),
      })

      const urlData = await urlRes.json()
      if (urlData.url) {
        validCalls.push({ ...call, fileUrl: urlData.url })
      } else {
        // 🧹 Auto-clean orphaned DB rows
        await fetch("/api/delete-call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: call.id }),
        })
      }
    }

    setCalls(validCalls)
    setLoading(false)
  }

  async function handleTranscribe(id: string) {
    const res = await fetch(`/api/transcribe?id=${id}`, { method: 'POST' })
    const data = await res.json()
    if (data.success) alert('✅ Transcription complete!')
    else alert('❌ Error: ' + data.error)
  }

  async function handleDelete(id: string, filePath: string) {
    if (!confirm('Are you sure you want to delete this call?')) return

    const res = await fetch('/api/delete-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, file_path: filePath }),
    })

    const data = await res.json()
    if (data.ok || data.success) setCalls(calls.filter(c => c.id !== id))
    else alert('❌ Error: ' + data.error)
  }

  function skipTime(id: string, seconds: number) {
    const audio = audioRefs.current[id]
    if (audio) audio.currentTime += seconds
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchCalls()
  }, [])

  if (loading) return <p className="text-gray-500">Loading calls...</p>
  if (!calls.length) return <p className="text-gray-400">No calls found.</p>

  return (
    <div className="space-y-3">
      {calls.map(call => (
        <div
          key={call.id}
          className="border p-3 rounded-lg bg-white shadow-sm relative hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800 text-sm truncate w-64">
                {call.filename}
              </p>
              <p className="text-xs text-gray-500">{call.status}</p>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(menuOpen === call.id ? null : call.id)}
                className="text-gray-800 hover:text-black p-2"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen === call.id && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleTranscribe(call.id)}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-black"
                  >
                    <FileAudio size={15} className="text-black" />
                    <span className="text-black">Transcribe</span>
                  </button>
                  <a
                    href={call.fileUrl}
                    download
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-black"
                  >
                    <Download size={15} className="text-black" />
                    <span className="text-black">Download</span>
                  </a>
                  <button
                    onClick={() => handleDelete(call.id, call.file_path)}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                  >
                    <Trash size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => skipTime(call.id, -5)}
              className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm flex items-center gap-1 text-black"
            >
              <Rewind size={14} /> 5s
            </button>
            <audio
              controls
              className="flex-1"
              ref={el => {
                if (el) audioRefs.current[call.id] = el
              }}
              src={call.fileUrl}
            />
            <button
              onClick={() => skipTime(call.id, 5)}
              className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm flex items-center gap-1 text-black"
            >
              <FastForward size={14} /> 5s
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
