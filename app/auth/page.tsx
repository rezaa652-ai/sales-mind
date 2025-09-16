// app/auth/page.tsx
'use client'
import { FormEvent, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

export default function AuthPage(){
  const router = useRouter()
  const [mode,setMode]=useState<'login'|'signup'>('login')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|undefined>()

  async function onSubmit(e: FormEvent){
    e.preventDefault()
    setLoading(true); setError(undefined)
    const supabase = supabaseBrowser()
    try {
      if(mode==='signup'){
        const { error } = await supabase.auth.signUp({ email, password })
        if(error) throw error
        alert('Check your email to confirm your account.')
        router.push('/auth')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
        router.push('/app/qa')
      }
    } catch(err:any){
      setError(err?.message || 'Auth error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">{mode==='login'?'Logga in':'Skapa konto'}</h1>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            className="border rounded p-2"
            placeholder="E-post"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />
          <input
            className="border rounded p-2"
            placeholder="Lösenord"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="bg-[var(--brand,#2563eb)] text-white rounded p-2">
            {loading ? 'Bearbetar…' : (mode==='login'?'Logga in':'Skapa konto')}
          </button>
        </form>
        <div className="text-sm mt-3">
          {mode==='login' ? (
            <button className="underline" onClick={()=>setMode('signup')}>Behöver du ett konto? Skapa konto</button>
          ) : (
            <button className="underline" onClick={()=>setMode('login')}>Har du konto? Logga in</button>
          )}
        </div>
      </div>
    </div>
  )
}

