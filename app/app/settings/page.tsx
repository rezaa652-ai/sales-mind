import Card from '@/components/ui/Card'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function SettingsPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      <Card>
        <p><b>User:</b> {user?.email}</p>
        <form action="/auth/signout" method="post" className="mt-3">
          <button className="underline">Logga ut</button>
        </form>
      </Card>
    </div>
  )
}
