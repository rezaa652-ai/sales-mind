'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function AuthCallback() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    (async () => {
      const code = params.get('code')
      const next = params.get('next') || '/app/qa'
      if (!code) {
        // No code; go home or to login
        router.replace('/auth')
        return
      }
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      // Even if error, route away so users don’t get stuck
      router.replace(next)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-6">Completing sign-in…</div>
  )
}
