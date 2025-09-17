// app/page.tsx
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function Home() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/app/qa')
  redirect('/auth')
}
