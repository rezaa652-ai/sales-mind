export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

type Point = { lat: number, lon: number }

/** Rough SE bidding zones (SE1..SE4) by latitude */
function guessBiddingZone(lat: number): 'SE1'|'SE2'|'SE3'|'SE4' {
  if (lat >= 64.0) return 'SE1'
  if (lat >= 62.0) return 'SE2'
  if (lat >= 57.7) return 'SE3'
  return 'SE4'
}

/** GeoJSON types */
type Feature = {
  type: 'Feature',
  properties: Record<string, any>,
  geometry: { type: 'Polygon'|'MultiPolygon', coordinates: number[][][] | number[][][][] }
}
type FeatureCollection = { type: 'FeatureCollection', features: Feature[] }

let cachedGeo: FeatureCollection | null = null

/* --- basic point-in-(multi)polygon helpers --- */
function bboxOfCoords(coords: number[][]): [number,number,number,number] {
  let minLon=Infinity, minLat=Infinity, maxLon=-Infinity, maxLat=-Infinity
  for (const [lon,lat] of coords) {
    if (lon < minLon) minLon = lon
    if (lat < minLat) minLat = lat
    if (lon > maxLon) maxLon = lon
    if (lat > maxLat) maxLat = lat
  }
  return [minLon,minLat,maxLon,maxLat]
}
function pointInRing(point: [number,number], ring: number[][]): boolean {
  const [x,y] = point
  let inside = false
  for (let i=0, j=ring.length-1; i<ring.length; j=i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = ((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi+1e-12)+xi)
    if (intersect) inside = !inside
  }
  return inside
}
function pointInPolygon(lonLat: [number,number], poly: number[][][]): boolean {
  if (!poly.length) return false
  const outer = poly[0]
  const [minLon,minLat,maxLon,maxLat] = bboxOfCoords(outer)
  const [lon,lat] = lonLat
  if (lon<minLon || lon>maxLon || lat<minLat || lat>maxLat) return false
  if (!pointInRing(lonLat, outer)) return false
  for (let i=1;i<poly.length;i++) {
    if (pointInRing(lonLat, poly[i])) return false
  }
  return true
}
function pointInMultiPolygon(lonLat: [number,number], multi: number[][][][]): boolean {
  for (const poly of multi) if (pointInPolygon(lonLat, poly)) return true
  return false
}

async function loadGeo(): Promise<FeatureCollection | null> {
  if (cachedGeo) return cachedGeo
  try {
    const file = path.join(process.cwd(), 'data', 'elnat_areas.geojson')
    const txt = await fs.readFile(file, 'utf8')
    const json = JSON.parse(txt)
    if (json && json.type === 'FeatureCollection' && Array.isArray(json.features)) {
      cachedGeo = json
      return cachedGeo
    }
    return null
  } catch {
    return null // dataset is optional
  }
}

async function geocode(address: string): Promise<Point | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '0')
  url.searchParams.set('countrycodes', 'se')
  url.searchParams.set('limit', '1')

  const r = await fetch(url, {
    headers: { 'User-Agent': 'sales-mind/geo-electricity (contact: admin@example.com)' },
    cache: 'no-store',
  })
  if (!r.ok) return null
  const arr = await r.json().catch(()=>[])
  if (!Array.isArray(arr) || !arr.length) return null
  const lat = parseFloat(arr[0].lat), lon = parseFloat(arr[0].lon)
  if (!isFinite(lat) || !isFinite(lon)) return null
  return { lat, lon }
}

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url)
    const address = (u.searchParams.get('address') || '').trim()
    const latStr = u.searchParams.get('lat')
    const lonStr = u.searchParams.get('lon')

    let pt: Point | null = null
    if (latStr && lonStr) {
      const lat = parseFloat(latStr), lon = parseFloat(lonStr)
      if (isFinite(lat) && isFinite(lon)) pt = { lat, lon }
    }
    if (!pt && address) pt = await geocode(address)

    if (!pt) {
      return NextResponse.json({ error: 'no_point', detail: 'Provide address or lat/lon.' }, { status: 400 })
    }

    const elområde = guessBiddingZone(pt.lat)

    let elnat: null | { name?: string, orgnr?: string, area_id?: string } = null
    const coll = await loadGeo()
    if (coll && Array.isArray(coll.features)) {
      const p: [number,number] = [pt.lon, pt.lat]
      for (const f of coll.features) {
        try {
          if (f.geometry?.type === 'Polygon') {
            const coords = f.geometry.coordinates as number[][][]
            if (pointInPolygon(p, coords)) { elnat = { name: f.properties?.name, orgnr: f.properties?.orgnr, area_id: f.properties?.area_id }; break }
          } else if (f.geometry?.type === 'MultiPolygon') {
            const coords = f.geometry.coordinates as number[][][][]
            if (pointInMultiPolygon(p, coords)) { elnat = { name: f.properties?.name, orgnr: f.properties?.orgnr, area_id: f.properties?.area_id }; break }
          }
        } catch {}
      }
    }

    return NextResponse.json({
      ok: true,
      input: { address, ...pt },
      elomrade: elområde,
      elnat: elnat,
      dataset_present: !!coll,
      source: {
        geocode: 'OSM Nominatim',
        net_areas: coll ? 'data/elnat_areas.geojson' : 'not-installed'
      }
    })
  } catch (e:any) {
    return NextResponse.json({ error: 'electricity_route_error', detail: e?.message || String(e) }, { status: 500 })
  }
}
