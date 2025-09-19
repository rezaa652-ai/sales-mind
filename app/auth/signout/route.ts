// app/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

function makeClient(req: NextRequest) {
  // Viktigt: 303 istället för default 307
  const res = NextResponse.redirect(new URL('/auth', req.url), 303)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options as CookieOptions)
          })
        },
      },
    }
  )
  return { supabase, res }
}

async function doSignOut(req: NextRequest) {
  const { supabase, res } = makeClient(req)
  await supabase.auth.signOut()
  return res
}

export async function POST(req: NextRequest) { return doSignOut(req) }
export async function GET(req: NextRequest)  { return doSignOut(req) }
