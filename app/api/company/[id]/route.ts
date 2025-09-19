// app/api/company/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { supabaseFromRequest } from '@/lib/supabaseRoute'

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }){
  const { id } = await ctx.params
  const { supabase } = supabaseFromRequest(req)
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})
  const body = await req.json()
  const { data, error } = await supabase
    .from('company_profiles')
    .update(body)
    .eq('id', id)
    .eq('owner', user.id)
    .select()
    .single()
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }){
  const { id } = await ctx.params
  const { supabase } = supabaseFromRequest(req)
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})
  const { error } = await supabase
    .from('company_profiles')
    .delete()
    .eq('id', id)
    .eq('owner', user.id)
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json({ok:true})
}
