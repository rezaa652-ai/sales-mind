export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

/**
 * Returns [{id,name}] from your DB if available,
 * otherwise [] (no hard failure).
 */
export async function GET() {
  try {
    // TODO: swap in your real DB/Supabase. For now, try env hints or return [].
    // If you already have a route, you can delete this file.
    return NextResponse.json({ companies: [] })
  } catch (e:any) {
    return NextResponse.json({ companies: [] })
  }
}
