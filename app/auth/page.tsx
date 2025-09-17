// app/auth/page.tsx
'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string>('')

  let supabase: ReturnType<typeof supabaseBrowser> | null = null
  try {
    supabase = supabaseBrowser()
  } catch (e: any) {
    // Tydligt env-fel
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full border rounded-xl p-6">
          <h1 className="text-xl font-semibold mb-4">Konfigurationsfel</h1>
          <p className="text-red-600">
            {e?.message || 'Saknade miljövariabler för Supabase-klienten.'}
          </p>
        </div>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase!.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase!.auth.signUp({ email, password })
        if (error) throw error
      }
      router.push('/app/qa' as any)
    } catch (err: any) {
      setMsg(err?.message || String(err))
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">
          {mode === 'login' ? 'Logga in' : 'Skapa konto'}
        </h1>

        <label className="block text-sm mb-2">E-post
          <input
            className="w-full border rounded p-2"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="block text-sm mb-4">Lösenord
          <input
            className="w-full border rounded p-2"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}

        <button
          className="w-full bg-[var(--brand)] text-white rounded p-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Arbetar…' : mode === 'login' ? 'Logga in' : 'Skapa konto'}
        </button>

        <button
          type="button"
          className="w-full mt-2 underline"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Skapa nytt konto' : 'Har konto? Logga in'}
        </button>
      </form>
    </div>
  )
}
