// app/api/calls/list/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

function makeClient(req: NextRequest, res: NextResponse){
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(){ return req.cookies.getAll() },
        setAll(c){ c.forEach(({name,value,options})=>res.cookies.set(name,value,options as CookieOptions)) }
      }
    }
  )
}

export async function GET(req: NextRequest){
  const res = NextResponse.json({ ok: true })
  try{
    const supabase = makeClient(req, res)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ items: [] })
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('owner', user.id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ items: [] })
    return NextResponse.json({ items: data || [] })
  }catch{
    return NextResponse.json({ items: [] })
  }
}
