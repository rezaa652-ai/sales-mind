// app/auth/page.tsx
'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

export default function AuthPage(){
  const s = supabaseBrowser()
  const router = useRouter()
  const [email,setEmail] = useState('')
  const [pass,setPass] = useState('')
  const [mode,setMode] = useState<'login'|'signup'>('login')
  const [msg,setMsg] = useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setMsg('')
    try {
      const fn = mode==='login' ? s.auth.signInWithPassword : s.auth.signUp
      const { error } = await fn({ email, password: pass })
      if (error) throw error
      router.push('/app/qa')
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Auth error'
      setMsg(message)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">{mode==='login'?'Logga in':'Skapa konto'}</h1>
        <label className="block text-sm mb-2">E-post
          <input className="w-full border rounded p-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </label>
        <label className="block text-sm mb-4">Lösenord
          <input className="w-full border rounded p-2" type="password" value={pass} onChange={e=>setPass(e.target.value)} required/>
        </label>
        {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}
        <button className="w-full bg-[var(--brand)] text-white rounded p-2">{mode==='login'?'Logga in':'Skapa konto'}</button>
        <button type="button" className="w-full mt-2 underline" onClick={()=>setMode(mode==='login'?'signup':'login')}>
          {mode==='login'?'Skapa nytt konto':'Har konto? Logga in'}
        </button>
      </form>
    </div>
  )
}
