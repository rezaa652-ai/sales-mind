// app/app/layout.tsx (server component guard)
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import AppNav from '@/components/AppNav'
import '@/app/globals.css'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-gray-50 p-4">
        <h2 className="font-bold mb-4">SalesMind</h2>
        <AppNav />
      </aside>
      <main className="flex-1 p-6 max-w-[960px]">{children}</main>
    </div>
  )
}
