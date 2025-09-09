import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function PUT(req:Request,{params}:{params:{id:string}}){
  const body = await req.json()
  const sb = await supabaseServer()
  const { data:{ user } } = await sb.auth.getUser()
  if(!user) return NextResponse.json({ error:'unauth' }, { status:401 })
  const { data, error } = await sb.from('profiles_sales')
    .update(body).eq('id',params.id).eq('owner',user.id).select().single()
  if(error) return NextResponse.json({ error:error.message }, { status:400 })
  return NextResponse.json(data)
}

export async function DELETE(_req:Request,{params}:{params:{id:string}}){
  const sb = await supabaseServer()
  const { data:{ user } } = await sb.auth.getUser()
  if(!user) return NextResponse.json({ error:'unauth' }, { status:401 })
  const { error } = await sb.from('profiles_sales').delete().eq('id',params.id).eq('owner',user.id)
  if(error) return NextResponse.json({ error:error.message }, { status:400 })
  return NextResponse.json({ ok:true })
}
