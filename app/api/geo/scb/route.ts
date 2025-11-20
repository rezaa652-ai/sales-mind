/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

/**
 * PXWeb v1 reader for SCB Tab4bDispInkN (Disposable income).
 * GET /api/geo/scb?region=1280&year=2020&lang=sv
 * Returns: { year, region, lang, source, median_income_by_age:[{age, tkr}] }
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const region = (url.searchParams.get('region') || '').trim()
    const year   = (url.searchParams.get('year') || '2020').trim()
    const lang   = (url.searchParams.get('lang') || 'sv').toLowerCase() === 'en' ? 'en' : 'sv'

    if (!region) {
      return NextResponse.json({ error: 'missing_region', detail: 'Provide ?region=kommunkod, e.g. 1280' }, { status: 400 })
    }

    const TABLE     = process.env.SCB_V1_TABLE
    const REGION    = process.env.SCB_REGION_CODE    || 'Region'
    const AGE       = process.env.SCB_AGE_CODE       || 'Alder'
    const TIME      = process.env.SCB_TIME_CODE      || 'Tid'
    const MEASURE   = process.env.SCB_MEASURE_CODE   || 'ContentsCode'
    const MEAS_VAL  = process.env.SCB_MEASURE_VALUE  || '000000KE'
    const HH_CODE   = process.env.SCB_HH_TYPE_CODE   || 'Hushallstyp'
    const HH_KEEP   = process.env.SCB_HH_TYPE_KEEP   || 'E90'

    if (!TABLE) {
      return NextResponse.json({ error: 'missing_env', detail: 'SCB_V1_TABLE not set' }, { status: 500 })
    }

    const endpoint = TABLE.endsWith('/') ? TABLE : TABLE + '/'

    const baseQuery = [
      { code: REGION,  selection: { filter: 'item', values: [region] } },
      { code: AGE,     selection: { filter: 'all',  values: ['*'] } },
      { code: TIME,    selection: { filter: 'item', values: [year] } },
      { code: MEASURE, selection: { filter: 'item', values: [MEAS_VAL] } },
    ]

    const withHH = [
      ...baseQuery,
      { code: HH_CODE, selection: { filter: 'item', values: [HH_KEEP] } },
    ]

    // ✅ FIXED: convert inner function to arrow expression
    const postPX = async (body: any) => {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'sales-mind-pxweb-client',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ query: body, response: { format: 'JSON' } }),
        cache: 'no-store',
      })
      const text = await resp.text()
      if (!resp.ok) return { ok: false as const, status: resp.status, text }
      try { return { ok: true as const, json: JSON.parse(text) } }
      catch { return { ok: false as const, status: 502, text } }
    }

    let res = await postPX(withHH)
    if (!res.ok && (res.status === 400 || res.status === 404)) {
      res = await postPX(baseQuery)
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'scb_http', status: res.status, preview: res.text?.slice(0, 300) ?? '' }, { status: 502 })
    }

    const rows: any[] = Array.isArray(res.json?.data) ? res.json.data : Array.isArray(res.json) ? res.json : []
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ year, region, lang, source: 'SCB PXWeb v1 Tab4bDispInkN', median_income_by_age: [] })
    }

    const columns = res.json?.columns as Array<{ code: string }> | undefined
    let idxRegion = -1, idxAge = -1, idxTime = -1
    if (Array.isArray(columns)) {
      idxRegion = columns.findIndex(c => c.code === REGION)
      idxAge    = columns.findIndex(c => c.code === AGE)
      idxTime   = columns.findIndex(c => c.code === TIME)
    }

    const out: Array<{ age: string, tkr: number }> = []
    for (const row of rows) {
      if (Array.isArray(row.key) && Array.isArray(row.values)) {
        const key = row.key
        const vals = row.values
        const rRegion = idxRegion >= 0 ? key[idxRegion] : region
        const rAge    = idxAge    >= 0 ? key[idxAge]    : ''
        const rTime   = idxTime   >= 0 ? key[idxTime]   : year
        if (rRegion !== region || rTime !== year) continue
        const num = Number(vals[0]?.toString().replace(/\s/g,'').replace(',', '.'))
        if (Number.isFinite(num)) out.push({ age: rAge, tkr: num })
      } else {
        const rRegion = row[REGION] ?? region
        const rAge    = row[AGE]    ?? ''
        const rTime   = row[TIME]   ?? year
        const rawVal  = row.value ?? row.values?.[0]
        const num = Number(String(rawVal ?? '').replace(/\s/g,'').replace(',', '.'))
        if (rRegion === region && rTime === year && Number.isFinite(num)) {
          out.push({ age: String(rAge), tkr: num })
        }
      }
    }

    const order = ['18+', '18-29', '30-49', '50-64', '65-79', '65+', '66+', '80+']
    out.sort((a,b) => {
      const ia = order.indexOf(a.age); const ib = order.indexOf(b.age)
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })

    return NextResponse.json({
      year, region, lang,
      source: 'SCB PXWeb v1 Tab4bDispInkN',
      measure_code: MEAS_VAL,
      median_income_by_age: out,
    })
  } catch (e:any) {
    return NextResponse.json({ error: 'scb_route_error', detail: e?.message || String(e) }, { status: 500 })
  }
}
