// app/api/company/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { supabaseFromRequest } from '@/lib/supabaseRoute'

export async function GET(req: NextRequest){
  const { supabase } = supabaseFromRequest(req)
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'}, {status:401})
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('owner', user.id)
    .order('created_at',{ascending:false})
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data||[])
}

export async function POST(req: NextRequest){
  const { supabase } = supabaseFromRequest(req)
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})

  // FREE PLAN: tillåt max 1 company
  const { count } = await supabase
    .from('company_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('owner', user.id)
  if ((count ?? 0) >= 1) {
    return NextResponse.json(
      { error: 'Free-plan tillåter max 1 company. Ta bort den gamla eller uppgradera.' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { data, error } = await supabase
    .from('company_profiles')
    .insert([{ ...body, owner: user.id }])
    .select()
    .single()
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data)
}
