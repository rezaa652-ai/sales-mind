// middleware.ts — tillfälligt ingen auth-guard
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

// Ta bort matchern så middleware inte körs
export const config = { matcher: [] }
