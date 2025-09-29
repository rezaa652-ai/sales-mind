'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'

type POI = { name:string|null, type:string, distance_m:number, lat:number, lon:number }
export default function GeoMapLeaflet({
  center, pois
}:{ center:{lat:number,lon:number}, pois: POI[] }){
  const bounds = (() => {
    const lats = [center.lat, ...pois.map(p=>p.lat)]
    const lons = [center.lon, ...pois.map(p=>p.lon)]
    return [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]] as any
  })()

  function Fit(){
    const map = useMap()
    useEffect(()=>{
      if (pois.length===0) { map.setView([center.lat, center.lon], 15) }
      else { map.fitBounds(bounds, { padding: [20,20] }) }
    }, [center.lat, center.lon, pois.length])
    return null
  }

  return (
    <div className="w-full h-[360px] rounded-lg overflow-hidden border">
      <MapContainer center={[center.lat, center.lon]} zoom={15} style={{width:'100%',height:'100%'}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Fit />
        <CircleMarker center={[center.lat, center.lon]} radius={8}>
          <Popup>Center</Popup>
        </CircleMarker>
        {pois.map((p, i)=>(
          <CircleMarker key={i} center={[p.lat, p.lon]} radius={6}>
            <Popup>
              <div style={{fontWeight:600}}>{p.name || '(utan namn)'}</div>
              <div>{p.type} • {fmtDist(p.distance_m)}</div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

function fmtDist(m:number){
  if (m >= 1000) return (m/1000).toFixed(m>=5000?0:1) + ' km'
  return Math.round(m) + ' m'
}
