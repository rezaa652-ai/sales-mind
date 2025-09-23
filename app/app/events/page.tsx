'use client'
import { useEffect, useState } from 'react'
import { t, type Lang, getLang } from '@/lib/i18n'

export default function EventsPage(){
  const [lang,setLang]=useState<Lang>('sv')
  const [rows,setRows]=useState<any[]>([])

  useEffect(()=>{
    setLang(getLang())
    load()
  },[])

  async function load(){ setRows(await (await fetch('/api/events')).json()) }

  async function update(ev:any, patch:any){
    await fetch(`/api/events/${ev.id}`, { method:'PUT', body: JSON.stringify(patch) })
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">{t(lang,'events.title')}</h1>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-2">{t(lang,'events.table.when')}</th>
            <th className="p-2">{t(lang,'events.table.profile')}</th>
            <th className="p-2">{t(lang,'events.table.question')}</th>
            <th className="p-2">{t(lang,'events.table.rating')}</th>
            <th className="p-2">{t(lang,'events.table.used')}</th>
            <th className="p-2">{t(lang,'events.table.tags')}</th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={6} className="p-4 text-slate-500">{t(lang,'common.loading')}</td></tr>}
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
                  <select className="border rounded p-1" defaultValue={r.used?'yes':'no'}
                          onChange={e=>update(r,{ used: e.target.value==='yes' })}>
                    <option value="no">{t(lang,'qa.fb.no')}</option>
                    <option value="yes">{t(lang,'qa.fb.yes')}</option>
                  </select>
                </td>
                <td className="p-2">
                  <input className="border rounded p-1 w-40" defaultValue={r.tags||''}
                         onBlur={e=>update(r,{ tags:e.target.value })}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
