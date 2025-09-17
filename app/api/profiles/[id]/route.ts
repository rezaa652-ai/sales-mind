import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function sb(){
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      get: (n: string) => cookieStore.get(n)?.value,
      set: () => {},
      remove: () => {},
    } }
  )
  return { supabase }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }){
  const { id } = await ctx.params
  const { supabase } = await sb()
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})
  const body = await req.json()
  const { data, error } = await supabase
    .from('profiles_sales')
    .update(body)
    .eq('id', id)
    .eq('owner', user.id)
    .select()
    .single()
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }){
  const { id } = await ctx.params
  const { supabase } = await sb()
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})
  const { error } = await supabase
    .from('profiles_sales')
    .delete()
    .eq('id', id)
    .eq('owner', user.id)
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json({ok:true})
}
