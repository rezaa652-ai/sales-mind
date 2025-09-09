import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => req.cookies.get(n)?.value } as any }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Om ingen användare → redirect till /login
  if (req.nextUrl.pathname.startsWith('/app') && !user) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return res
}

// Körs bara på /app/*
export const config = {
  matcher: ['/app/:path*'],
}
