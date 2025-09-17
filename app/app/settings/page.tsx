import { supabaseServer } from '@/lib/supabaseServer'

export default async function SettingsPage(){
  const supabase = await supabaseServer()
  const { data:{ user } } = await supabase.auth.getUser()
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Settings</h1>
      <div className="border rounded p-4">
        <p><b>User:</b> {user?.email}</p>
        <form action="/auth/signout" method="post" className="mt-3">
          <button className="underline">Logga ut</button>
        </form>
      </div>
    </div>
  )
}
