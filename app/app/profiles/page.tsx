'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function ProfilesPage(){
  const [rows,setRows]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<any>({ name:'', language:'Svenska', tone:'Konkret', callback_windows:'12:15,16:40', goals:'Avslut|Boka uppföljning|Kvalificera|Boka 3 möten/dag', sales_targets:'3 meetings/day', persona_hints:'', compliance:'', proof:'', company_id:'' })
  const [editing,setEditing]=useState<any>(null)
  const [companies,setCompanies]=useState<any[]>([])

  async function load(){
    setRows(await (await fetch('/api/profiles')).json())
    setCompanies(await (await fetch('/api/company')).json())
  }
  useEffect(()=>{ load() },[])

  async function save(){
    const url = editing? `/api/profiles/${editing.id}`:'/api/profiles'
    const method = editing? 'PUT':'POST'
    const r = await fetch(url,{ method, body: JSON.stringify(form) })
    if(r.ok){ setOpen(false); setEditing(null); load() } else alert('Fel vid sparande')
  }
  async function del(id:string){
    const r = await fetch(`/api/profiles/${id}`,{ method:'DELETE' })
    if(r.ok) load(); else alert('Fel vid borttagning')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Profiles</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2" onClick={()=>{ setEditing(null); setForm({ ...form, name:'' }); setOpen(true) }}>+ New</button>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-2">Name</th><th className="p-2">Language</th><th className="p-2">Tone</th><th className="p-2">Company</th><th></th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={5} className="p-4 text-slate-500">Inga profiler ännu.</td></tr>}
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.language}</td>
                <td className="p-2">{r.tone}</td>
                <td className="p-2">{companies.find(c=>c.id===r.company_id)?.company_name||'-'}</td>
                <td className="p-2 text-right">
                  <button className="mr-2 underline" onClick={()=>{ setEditing(r); setForm(r); setOpen(true) }}>Edit</button>
                  <ConfirmDialog onConfirm={()=>del(r.id)}><button className="text-red-600 underline">Delete</button></ConfirmDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing?'Edit profile':'New profile'} onClose={()=>setOpen(false)} onSubmit={save}>
          <div className="grid gap-2">
            <label className="text-sm">Name<input className="border rounded p-2 w-full" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></label>
            <label className="text-sm">Language<input className="border rounded p-2 w-full" value={form.language} onChange={e=>setForm({...form, language:e.target.value})}/></label>
            <label className="text-sm">Tone<input className="border rounded p-2 w-full" value={form.tone} onChange={e=>setForm({...form, tone:e.target.value})}/></label>
            <label className="text-sm">Callback windows<input className="border rounded p-2 w-full" value={form.callback_windows} onChange={e=>setForm({...form, callback_windows:e.target.value})}/></label>
            <label className="text-sm">Goals<input className="border rounded p-2 w-full" value={form.goals} onChange={e=>setForm({...form, goals:e.target.value})}/></label>
            <label className="text-sm">Sales targets<input className="border rounded p-2 w-full" value={form.sales_targets} onChange={e=>setForm({...form, sales_targets:e.target.value})}/></label>
            <label className="text-sm">Persona hints<input className="border rounded p-2 w-full" value={form.persona_hints} onChange={e=>setForm({...form, persona_hints:e.target.value})}/></label>
            <label className="text-sm">Compliance<input className="border rounded p-2 w-full" value={form.compliance} onChange={e=>setForm({...form, compliance:e.target.value})}/></label>
            <label className="text-sm">Proof<input className="border rounded p-2 w-full" value={form.proof} onChange={e=>setForm({...form, proof:e.target.value})}/></label>
            <label className="text-sm">Company
              <select className="border rounded p-2 w-full" value={form.company_id||''} onChange={e=>setForm({...form, company_id:e.target.value||null})}>
                <option value="">— none —</option>
                {companies.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
