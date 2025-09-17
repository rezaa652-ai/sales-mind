import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function sb(){
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )
  return { supabase }
}

export async function GET(_req: NextRequest){
  const { supabase } = await sb()
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
  const { supabase } = await sb()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'unauth'},{status:401})
  const body = await req.json()

  // Free-plan: max 1 company
  const { count } = await supabase
    .from('company_profiles')
    .select('*', { count:'exact', head:true })
    .eq('owner', user.id)
  if ((count ?? 0) >= 1) return NextResponse.json({ error:'Free-plan: max 1 company' }, { status:403 })

  const { data, error } = await supabase
    .from('company_profiles')
    .insert([{ ...body, owner: user.id }])
    .select()
    .single()
  if(error) return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json(data)
}
