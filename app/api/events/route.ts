// app/api/events/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { supabaseFromRequest } from '@/lib/supabaseRoute'

export async function GET(req: NextRequest){
  const { supabase } = supabaseFromRequest(req)
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'}, {status:401})
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('owner', user.id)
    .order('ts',{ascending:false})
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data||[])
}

export async function POST(req: NextRequest){
  const { supabase } = supabaseFromRequest(req)
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})
  const body = await req.json()
  const { data, error } = await supabase
    .from('events')
    .insert([{ ...body, owner: user.id }])
    .select()
    .single()
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data)
}
