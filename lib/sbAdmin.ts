/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/sbAdmin.ts
export async function sbAdmin(path: string, init: RequestInit = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_KEY!
  const headers = {
    apikey: service,
    Authorization: `Bearer ${service}`,
    'Content-Type': 'application/json',
    ...(init.headers||{})
  }
  const r = await fetch(`${url}/rest/v1${path}`, { ...init, headers, cache:'no-store' })
  const ok = r.ok
  let data:any = null
  try { data = await r.json() } catch {}
  if (!ok) throw new Error(data?.message || `Supabase error: ${r.status}`)
  return data
}
