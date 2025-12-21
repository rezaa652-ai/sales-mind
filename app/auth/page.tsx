'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

type Mode = 'login' | 'signup' | 'reset'

export default function AuthPage() {
  const search = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const m = (search.get('mode') || 'login') as Mode
    if (m === 'login' || m === 'signup' || m === 'reset') setMode(m)
    const err = search.get('error')
    if (err) setError(err)
  }, [search])

  async function syncCookiesFromSession() {
    const sb = supabaseBrowser()
    const { data } = await sb.auth.getSession()
    const session = data?.session
    if (!session?.access_token || !session?.refresh_token) return

    await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      }),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const sb = supabaseBrowser()

      if (mode === 'login') {
        const { error: signInErr } = await sb.auth.signInWithPassword({ email, password })
        if (signInErr) throw new Error(signInErr.message)

        // 1) client session -> localStorage (fixes "Not authenticated" for direct uploads)
        // 2) sync SSR cookies so server components/layouts work
        await syncCookiesFromSession()

        window.location.href = '/app/qa'
        return
      }

      if (mode === 'signup') {
        const { error: signUpErr } = await sb.auth.signUp({ email, password })
        if (signUpErr) throw new Error(signUpErr.message)
        setMessage('Signed up. Check your email to confirm, then log in.')
        setMode('login')
        return
      }

      if (mode === 'reset') {
        const origin = window.location.origin
        const { error: resetErr } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback`,
        })
        if (resetErr) throw new Error(resetErr.message)
        setMessage('Password reset email sent.')
        setMode('login')
        return
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-[360px] bg-white rounded-2xl shadow-lg p-8 space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center text-black">
          {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        {mode !== 'reset' && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {message && <p className="text-sm text-blue-600 text-center font-medium">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-medium transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
        </button>

        <div className="text-sm text-center text-gray-600 space-y-2">
          {mode === 'login' && (
            <>
              <p>
                Don’t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-blue-600 hover:underline">
                  Sign up
                </button>
              </p>
              <p>
                <button type="button" onClick={() => setMode('reset')} className="text-blue-600 hover:underline text-xs">
                  Forgot Password
                </button>
              </p>
            </>
          )}

          {mode !== 'login' && (
            <button type="button" onClick={() => setMode('login')} className="text-blue-600 hover:underline">
              Back to login
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
