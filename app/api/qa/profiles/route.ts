export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse, NextRequest } from 'next/server'
import { supabaseFromRequest } from '@/lib/supabaseRoute'

export async function GET(req: NextRequest) {
  try {
    const { supabase } = supabaseFromRequest(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ items: [] })

    const { data, error } = await supabase
      .from('profiles_sales')
      .select('id, name')
      .eq('owner', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ items: [] })

    const items = (data ?? [])
      .filter((r: any) => r && r.id)
      .map((r: any) => ({ id: r.id, name: r.name || '(namnlös)' }))

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
