// app/auth/page.tsx
'use client'
import { useState } from 'react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<string>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setPending(true)
    try {
      if (mode === 'login') {
        const r = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!r.ok) {
          const j = await r.json().catch(()=>({}))
          throw new Error(j?.error || `Login failed (${r.status})`)
        }
        // We do NOT manually redirect here. The route already responded 303 to /app/qa.
        // Browser follows automatically; if JS intercepts, we can fallback:
        window.location.href = '/app/qa'
      } else {
        const r = await fetch('/auth/signup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const j = await r.json().catch(()=>({}))
        if (!r.ok) throw new Error(j?.error || `Signup failed (${r.status})`)
        setMsg(j?.needsEmailConfirm ? 'Check your email to confirm your account.' : 'Signed up!')
        if (!j?.needsEmailConfirm) window.location.href = '/app/qa'
      }
    } catch (e:any) {
      setMsg(e?.message || 'Auth failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">{mode==='login'?'Logga in':'Skapa konto'}</h1>
        <label className="block text-sm mb-2">E-post
          <input className="w-full border rounded p-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="block text-sm mb-4">Lösenord
          <input className="w-full border rounded p-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={mode==='login'?'current-password':'new-password'} />
        </label>
        {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}
        <button className="w-full bg-[var(--brand)] text-white rounded p-2 disabled:opacity-60" disabled={pending}>
          {pending ? 'Arbetar…' : (mode==='login'?'Logga in':'Skapa konto')}
        </button>
        <button type="button" className="w-full mt-2 underline" onClick={()=>setMode(mode==='login'?'signup':'login')}>
          {mode==='login'?'Skapa nytt konto':'Har konto? Logga in'}
        </button>
      </form>
    </div>
  )
}
