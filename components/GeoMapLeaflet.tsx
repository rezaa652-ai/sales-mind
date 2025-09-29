'use client'

import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import type { CSSProperties } from 'react'

// Load react-leaflet pieces with SSR disabled (prevents Edge/SSR type issues)
const MapContainer: any = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
)
const TileLayer: any = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
)
const Marker: any = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
)
const Popup: any = dynamic(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
)

type LatLon = { lat: number; lon: number }
type Poi = { lat: number; lon: number; name?: string }

export default function GeoMapLeaflet({
  center,
  pois = [],
  height = 360
}: {
  center: LatLon | null
  pois?: Poi[]
  height?: number
}) {
  const style: CSSProperties = { width: '100%', height }

  if (!center) {
    return (
      <div className="h-[360px] border rounded bg-slate-50 grid place-items-center text-slate-500">
        Ange en adress för att se kartan
      </div>
    )
  }

  // react-leaflet expects [lat, lng]
  const c: [number, number] = [center.lat, center.lon]

  return (
    <div className="w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={c as any}
        zoom={15}
        style={style}
        scrollWheelZoom={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {/* Address center marker */}
        <Marker position={c as any}>
          <Popup>Adressens mitt</Popup>
        </Marker>
        {/* POIs */}
        {pois.slice(0, 50).map((p, i) => (
          <Marker key={i} position={[p.lat, p.lon] as any}>
            {p.name ? <Popup>{p.name}</Popup> : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
