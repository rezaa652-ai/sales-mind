export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function s() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET() {
  try {
    const supabase = s()

    // try a few possible table names
    const candidates = [
      { table: 'profiles', select: 'id,name' },
      { table: 'sales_profiles', select: 'id,name' },
      { table: 'reps', select: 'id,name' }
    ]

    for (const c of candidates) {
      const { data, error } = await supabase.from(c.table).select(c.select).order('name', { ascending: true })
      if (!error && Array.isArray(data)) {
        return NextResponse.json({ items: data })
      }
    }

    return NextResponse.json({ items: [] })
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message || 'profiles_failed' })
  }
}
