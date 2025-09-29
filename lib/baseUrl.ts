import type { NextRequest } from 'next/server'

export function getBaseUrl(req?: NextRequest) {
  // Vercel URL
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  // Explicit (useful for Codespaces or custom proxies)
  const explicit = process.env.NEXT_PUBLIC_BASE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  // Derive from request headers in dev
  if (req) {
    const proto = req.headers.get('x-forwarded-proto') || 'http'
    const host  = req.headers.get('x-forwarded-host')  || req.headers.get('host') || 'localhost:3000'
    return `${proto}://${host}`
  }
  // Fallback
  return 'http://localhost:3000'
}
