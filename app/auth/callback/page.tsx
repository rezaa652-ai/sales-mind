'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function AuthCallback(){
  const r = useRouter(); const q = useSearchParams();
  useEffect(()=>{(async()=>{
    const err = q.get('error') || q.get('error_description')
    if (err) return r.replace('/auth?error='+encodeURIComponent(err))
    const { data } = await supabaseBrowser().auth.getSession()
    const at = data.session?.access_token, rt = data.session?.refresh_token
    if(!at || !rt) return r.replace('/auth?error=no_session')
    const s = await fetch('/api/auth/sync',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({access_token:at,refresh_token:rt})})
    if(!s.ok) return r.replace('/auth?error=sync_failed')
    r.replace('/app/qa')
  })()},[q,r])
  return <div className="p-6">Completing sign-in…</div>
}
