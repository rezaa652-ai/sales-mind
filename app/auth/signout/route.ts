import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(){
  const sb = await supabaseServer()
  await sb.auth.signOut()
  return NextResponse.redirect(new URL('/login','http://localhost:3000'))
}
