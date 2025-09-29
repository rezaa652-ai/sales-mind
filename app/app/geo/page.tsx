'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

// If you maintain a kommun list, point this to your file.
// Otherwise, we’ll derive kommun code from reverse geocode if possible.
let KOMMUNER: Array<{code:string,name_sv:string,name_en:string}> = []
try {
  // adjust path if your list exists
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  KOMMUNER = require('../../../data/kommuner').KOMMUNER || []
} catch {}

type Lang = 'sv'|'en'
type Poi = { name: string, type?: string, distance_m?: number, lat: number, lon: number, rating?: number, address?: string }
type GeoResp = {
  center?: { lat:number, lon:number },
  address?: string,
  radius_m?: number,
  pois?: Poi[],
  segment?: string, plan?: string[], hooks?: string[],
  demographics?: { median_income?: string, families?: string, students?: string },
  lang?: Lang
}

const LTEXT = {
  sv: {
    title: 'Geosök (adress + närområde)',
    address: 'Adress',
    address_ph: 'Ex: Södra Förstadsgatan 56, Malmö',
    enter_hint: 'Tryck Enter för att söka',
    radius: 'Radie (m)',
    search: 'Sök',
    searching: 'Söker…',
    segment: 'Segment',
    plan: 'Plan',
    hooks: 'Krokar',
    nearby: 'I närheten (företag)',
    demog: 'SCB: Median disponibel inkomst per ålder (tkr)',
    loading_map: 'Laddar karta…',
  },
  en: {
    title: 'Geo search (address + nearby)',
    address: 'Address',
    address_ph: 'e.g. Södra Förstadsgatan 56, Malmö',
    enter_hint: 'Press Enter to search',
    radius: 'Radius (m)',
    search: 'Search',
    searching: 'Searching…',
    segment: 'Segment',
    plan: 'Plan',
    hooks: 'Hooks',
    nearby: 'Nearby (businesses)',
    demog: 'SCB: Median disposable income by age (tkr)',
    loading_map: 'Loading map…',
  }
} as const

export default function GeoPage(){
  const [lang, setLang] = useState<Lang>('sv')
  const [address, setAddress] = useState('')
  const [radius, setRadius] = useState(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()
  const [data, setData] = useState<GeoResp|null>(null)
  const [scb, setScb] = useState<any|null>(null)

  const L = LTEXT[lang]

  useEffect(()=>{
    // read a global app setting if you have one; fallback sv
    const ql = new URLSearchParams(window.location.search).get('lang')
    if(ql === 'en') setLang('en')
  }, [])

  // load Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places']
  })

  function onKeyDownSubmit(e: React.KeyboardEvent<HTMLInputElement>){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      search()
    }
  }

  async function search(){
    try{
      setLoading(true)
      setError(undefined)
      setData(null)
      setScb(null)
      const r = await fetch(`/api/geo/pois?address=${encodeURIComponent(address)}&radius_m=${radius}&lang=${lang}`, { cache: 'no-store' })
      if(!r.ok){
        const tx = await r.text().catch(()=> '')
        throw new Error(tx || `HTTP ${r.status}`)
      }
      const json: GeoResp = await r.json()
      setData(json)

      // Derive kommun code (best-effort): from address text or by matching KOMMUNER names if you have the list.
      const kommunCode = guessKommunCodeFromAddress(json?.address, lang) || ''
      if(kommunCode){
        const sr = await fetch(`/api/geo/scb?region=${encodeURIComponent(kommunCode)}&year=2020&lang=${lang}`, { cache: 'no-store' })
        if(sr.ok){
          const sj = await sr.json()
          setScb(sj)
        }
      }
    }catch(e:any){
      setError(e?.message || 'Failed to fetch')
    }finally{
      setLoading(false)
    }
  }

  // pin
  const center = data?.center
  const hasPois = Array.isArray(data?.pois) && (data!.pois!.length > 0)

  const greenIcon = {
    url: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
    scaledSize: { width: 32, height: 32 } as google.maps.Size
  }

  const map = useMemo(()=>{
    if(!center || !isLoaded) return null
    const centerLatLng = { lat: center.lat, lng: center.lon }
    return (
      <div className="rounded-lg overflow-hidden border" style={{ height: 420 }}>
        <GoogleMap
          center={centerLatLng}
          zoom={16}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{ streetViewControl: false, mapTypeControl: false }}
        >
          <Marker position={centerLatLng} icon={greenIcon} title={address} />
          {hasPois && data!.pois!.slice(0, 30).map((p, i) => (
            <Marker key={i} position={{ lat: p.lat, lng: p.lon }} title={p.name} />
          ))}
        </GoogleMap>
      </div>
    )
  }, [center?.lat, center?.lon, isLoaded, hasPois, data, address])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{L.title}</h1>

      {/* Inputs */}
      <form className="grid md:grid-cols-3 gap-3" onSubmit={e=>{ e.preventDefault(); search() }}>
        <label className="text-sm md:col-span-2">
          {L.address}
          <input
            className="border rounded p-2 w-full"
            value={address}
            onChange={e=>setAddress(e.target.value)}
            onKeyDown={onKeyDownSubmit}
            placeholder={L.address_ph}
            aria-label={L.enter_hint}
          />
        </label>
        <label className="text-sm">
          {L.radius}
          <input
            className="border rounded p-2 w-full"
            type="number"
            min={100}
            max={3000}
            step={50}
            value={radius}
            onChange={e=>setRadius(Number(e.target.value))}
            onKeyDown={onKeyDownSubmit}
          />
        </label>

        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            onClick={(e)=>{ e.preventDefault(); search() }}
            disabled={loading}
            className="bg-[var(--brand)] text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {loading ? L.searching : L.search}
          </button>
        </div>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Split: left info, right map */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {data?.segment && (
            <div className="border rounded p-3 bg-slate-50">
              <div className="text-sm text-slate-600">{L.segment}</div>
              <div className="font-medium">{data.segment}</div>
            </div>
          )}
          {Array.isArray(data?.plan) && data!.plan!.length>0 && (
            <div className="border rounded p-3 bg-slate-50">
              <div className="text-sm text-slate-600">{L.plan}</div>
              <ul className="list-disc pl-5 text-sm">
                {data!.plan!.slice(0,3).map((p,i)=><li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {Array.isArray(data?.hooks) && data!.hooks!.length>0 && (
            <div className="border rounded p-3 bg-slate-50">
              <div className="text-sm text-slate-600">{L.hooks}</div>
              <ul className="list-disc pl-5 text-sm">
                {data!.hooks!.slice(0,3).map((h,i)=><li key={i}>{h}</li>)}
              </ul>
            </div>
          )}

          {/* SCB card */}
          {scb && Array.isArray(scb.median_income_by_age) && scb.median_income_by_age.length>0 && (
            <div className="border rounded p-3 bg-slate-50">
              <div className="text-sm text-slate-600">{L.demog} — {scb.year}</div>
              <ul className="list-disc pl-5 text-sm">
                {scb.median_income_by_age.map((row:any, i:number)=>(
                  <li key={i}>{row.age}: {row.tkr}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nearby */}
          {Array.isArray(data?.pois) && data!.pois!.length>0 && (
            <div className="border rounded p-3 bg-slate-50">
              <div className="text-sm text-slate-600">{L.nearby}</div>
              <ul className="list-disc pl-5 text-sm">
                {data!.pois!.slice(0,12).map((p,i)=>{
                  const dist = typeof p.distance_m === 'number' ? `${Math.round(p.distance_m)} m` : ''
                  const rating = typeof p.rating === 'number' ? ` • ★ ${p.rating}` : ''
                  return (
                    <li key={i}>
                      <span className="font-medium">{p.name || '—'}</span>
                      {p.type ? <> • {p.type}</> : null}
                      {dist ? <> • {dist}</> : null}
                      {rating ? <>{rating}</> : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <div>
          {map || (
            <div className="h-[420px] border rounded bg-slate-50 grid place-items-center text-slate-500">
              {L.loading_map}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** best-effort kommun code extraction */
function guessKommunCodeFromAddress(addr?: string|null, lang: Lang = 'sv'): string|undefined {
  if(!addr) return undefined
  const txt = addr.toLowerCase()
  const matches = KOMMUNER.filter(k => (k.name_sv.toLowerCase() === txt) || txt.includes(k.name_sv.toLowerCase()) || txt.includes(k.name_en.toLowerCase()))
  if(matches.length>0) return matches[0].code
  // simple fallbacks for common big cities if list not loaded
  if(/malm/.test(txt)) return '1280'
  if(/stockholm/.test(txt)) return '0180'
  if(/göteborg|goteborg|gothenburg/.test(txt)) return '1480'
  return undefined
}
