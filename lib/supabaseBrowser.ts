'use client'

import { createBrowserClient } from '@supabase/ssr'

export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase env saknas: Kontrollera NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createBrowserClient(url, key, {
    cookies: {
      // In the browser we typically don't manage cookies manually; SSR helpers do.
      get() { return undefined },
      set() {},
      remove() {},
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}
