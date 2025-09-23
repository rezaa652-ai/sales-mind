// app/api/lang/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { lang } = await req.json()
    if (lang !== 'sv' && lang !== 'en') {
      return NextResponse.json({ error: 'invalid lang' }, { status: 400 })
    }
    const res = NextResponse.json({ ok: true })
    // 1 year cookie
    res.cookies.set('lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}
