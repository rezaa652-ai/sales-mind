import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }:{children:React.ReactNode}){
  const sb = await supabaseServer()
  const { data:{ user } } = await sb.auth.getUser()
  if(!user) redirect('/login')
  return (
    <div className="min-h-screen grid md:grid-cols-[220px_1fr]">
      <aside className="border-r p-4">
        <h2 className="font-semibold mb-3">Sales Mind</h2>
        <nav className="space-y-2 text-sm">
          <Link href="/app/dashboard">Dashboard</Link>
          <Link href="/app/qna">Q&amp;A</Link>
          <Link href="/app/profiles">Profiles</Link>
          <Link href="/app/company">Company</Link>
          <Link href="/app/kb">KB</Link>
          <Link href="/app/events">Events</Link>
          <Link href="/app/settings">Settings</Link>
        </nav>
        <form action="/auth/signout" method="post" className="mt-6">
          <button className="text-sm underline">Logga ut</button>
        </form>
      </aside>
      <main className="p-6 max-w-3xl">{children}</main>
    </div>
  )
}
