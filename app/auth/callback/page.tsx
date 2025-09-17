// app/auth/callback/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function AuthCallbackPage(){
  const r = useRouter()
  useEffect(()=>{
    // Detta ser till att sessionen laddas in och att middleware hinner synca cookies
    supabaseBrowser().auth.getSession().finally(()=>{
      r.replace('/app/qa' as any)
    })
  },[])
  return <div className="p-6">Loggar in…</div>
}
