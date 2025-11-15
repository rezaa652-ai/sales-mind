/* eslint-disable @typescript-eslint/no-explicit-any */
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
      .from('company_profiles')
      .select('id, company_name')
      .eq('owner', user.id)
      .order('company_name', { ascending: true })

    if (error) return NextResponse.json({ items: [] })

    const items = (data ?? [])
      .filter((r: any) => r && r.id)
      .map((r: any) => ({ id: r.id, name: r.company_name || '(namnlös)' }))

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
