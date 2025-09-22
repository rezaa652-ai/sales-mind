// app/app/settings/page.tsx
import { supabaseServer } from '@/lib/supabaseServer'
import SettingsClient from './SettingsClient'

export const metadata = { title: 'Settings · SalesMind' }

export default async function SettingsPage(){
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? ''
  return <SettingsClient initialEmail={email} />
}
