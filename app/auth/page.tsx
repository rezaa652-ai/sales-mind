'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthPage(){
  const r = useRouter()
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [mode,setMode]=useState<'login'|'signup'>('signup')
  const [err,setErr]=useState<string>('')

  async function submit(){
    setErr('')
    try{
      if(mode==='signup'){
        const { error } = await supabase.auth.signUp({ email, password: pass })
        if(error) throw error
      }else{
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
        if(error) throw error
      }
      r.replace('/app/qa')
    }catch(e:any){ setErr(e.message || 'Något gick fel') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">{mode==='signup'?'Skapa konto':'Logga in'}</h1>
        <div className="grid gap-3">
          <input className="border rounded p-2" placeholder="E-post" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="border rounded p-2" placeholder="Lösenord" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button onClick={submit} className="bg-[var(--brand,#2563eb)] text-white rounded p-2">
            {mode==='signup'?'Skapa konto':'Logga in'}
          </button>
          <button className="underline text-sm" onClick={()=>setMode(mode==='signup'?'login':'signup')}>
            {mode==='signup'?'Har konto? Logga in':'Ny här? Skapa konto'}
          </button>
        </div>
      </div>
    </div>
  )
}
