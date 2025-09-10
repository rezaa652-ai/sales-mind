import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const isInternal = url.pathname.startsWith('/app')

  if (!isInternal) return NextResponse.next()

  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }
  return res
}

export const config = {
  matcher: ['/app/:path*'],
}
