import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function SettingsPage(){
  const supabase = await supabaseServer()
  const { data:{ user } } = await supabase.auth.getUser()
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Settings</h1>
      <div className="border rounded p-4 space-y-3">
        <p><b>User:</b> {user?.email}</p>

        <form action="/auth/signout" method="post" className="mt-3">
          <button className="underline" type="submit">Logga ut</button>
        </form>

        <p className="text-sm text-slate-500">
          Problem med POST? <Link href="/auth/signout" className="underline">Logga ut via direktlänk</Link>
        </p>
      </div>
    </div>
  )
}
