import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(){
  const sb = await supabaseServer()
  const { data:{ user } } = await sb.auth.getUser()
  if(!user) return NextResponse.json([])
  const { data, error } = await sb.from('profiles_sales').select('*').eq('owner', user.id).order('created_at',{ascending:false})
  if(error) return NextResponse.json({ error: error.message }, { status:400 })
  return NextResponse.json(data||[])
}

export async function POST(req:Request){
  const body = await req.json()
  const sb = await supabaseServer()
  const { data:{ user } } = await sb.auth.getUser()
  if(!user) return NextResponse.json({ error:'unauth' }, { status:401 })
  const { data, error } = await sb.from('profiles_sales').insert([{ ...body, owner:user.id }]).select().single()
  if(error) return NextResponse.json({ error:error.message }, { status:400 })
  return NextResponse.json(data)
}
