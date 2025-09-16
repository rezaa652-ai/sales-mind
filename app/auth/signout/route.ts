// app/auth/signout/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST() {
  const supabase = await supabaseServer()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}
