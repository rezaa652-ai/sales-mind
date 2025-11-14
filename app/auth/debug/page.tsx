// app/auth/debug/page.tsx
import { supabaseServer } from '@/lib/supabaseServer'

export default async function DebugAuthPage(){
const supabase = await supabaseServer()
const { data: { user }, error } = await supabase.auth.getUser()
  return (
    <pre className="p-4 text-sm">
      {JSON.stringify({ user, error }, null, 2)}
    </pre>
  )
}
