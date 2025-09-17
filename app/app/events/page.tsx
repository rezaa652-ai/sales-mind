'use client'
import { useEffect, useState } from 'react'

export default function EventsPage(){
  const [rows,setRows]=useState<any[]>([])
  async function load(){ setRows(await (await fetch('/api/events')).json()) }
  useEffect(()=>{ load() },[])

  async function update(ev:any, patch:any){
    await fetch(`/api/events/${ev.id}`, { method:'PUT', body: JSON.stringify(patch) })
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Events</h1>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-2">När</th><th className="p-2">Profil</th><th className="p-2">Fråga</th>
            <th className="p-2">Rating</th><th className="p-2">Användes</th><th className="p-2">Taggar</th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={6} className="p-4 text-slate-500">Inga events ännu.</td></tr>}
            {rows.map((r:any)=>(
              <tr key={r.id} className="border-t align-top">
                <td className="p-2 whitespace-nowrap">{new Date(r.ts).toLocaleString()}</td>
                <td className="p-2">{r.profile_name}</td>
                <td className="p-2 max-w-[320px]">{r.question}</td>
                <td className="p-2">
                  <input type="number" min={1} max={5} className="w-20 border rounded p-1" defaultValue={r.rating||0}
                    onBlur={(e)=>update(r, { rating:Number(e.target.value) })}/>
                </td>
                <td className="p-2">
                  <select className="border rounded p-1" defaultValue={r.used?'yes':'no'} onChange={e=>update(r,{ used: e.target.value==='yes' })}>
                    <option value="no">Nej</option><option value="yes">Ja</option>
                  </select>
                </td>
                <td className="p-2">
                  <input className="border rounded p-1 w-40" defaultValue={r.tags||''} onBlur={e=>update(r,{ tags:e.target.value })}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
