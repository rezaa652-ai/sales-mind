import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function sb(req: NextRequest){
  const res = NextResponse.next()
  return { supabase: createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      get: (n)=>req.cookies.get(n)?.value,
      set: (n,v,o)=>res.cookies.set({name:n,value:v,...o}),
      remove: (n,o)=>res.cookies.set({name:n,value:'',...o,maxAge:0}),
    } }
  ), res }
}

export async function GET(req: NextRequest){
  const { supabase } = sb(req)
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'}, {status:401})
  const { data, error } = await supabase.from('events').select('*').eq('owner', user.id).order('ts',{ascending:false})
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data||[])
}

export async function POST(req: NextRequest){
  const { supabase } = sb(req)
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})
  const body = await req.json()
  const { data, error } = await supabase.from('events').insert([{ ...body, owner: user.id }]).select().single()
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data)
}
