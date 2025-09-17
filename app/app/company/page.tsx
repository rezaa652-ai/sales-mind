'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function CompanyPage(){
  const [rows,setRows]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<any>({
    company_name:'', market:'', geo_notes:'', products:'', unique_features:'',
    compliance:'', proof_points:'', public_links:'', disclaimer:''
  })
  const [editing,setEditing]=useState<any>(null)

  async function load(){ setRows(await (await fetch('/api/company')).json()) }
  useEffect(()=>{ load() },[])

  async function save(){
    const url = editing? `/api/company/${editing.id}`:'/api/company'
    const method = editing? 'PUT':'POST'
    const r = await fetch(url,{ method, body: JSON.stringify(form) })
    if(r.ok){ setOpen(false); setEditing(null); load() } else alert('Fel vid sparande')
  }
  async function del(id:string){
    const r = await fetch(`/api/company/${id}`,{ method:'DELETE' })
    if(r.ok) load(); else alert('Fel vid borttagning')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Company</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2" onClick={()=>{ setEditing(null); setForm({ ...form, company_name:'' }); setOpen(true) }}>+ New</button>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-2">Name</th><th className="p-2">Market</th><th className="p-2">Features</th><th></th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={4} className="p-4 text-slate-500">Inga companies ännu.</td></tr>}
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.company_name}</td>
                <td className="p-2">{r.market}</td>
                <td className="p-2">{r.unique_features}</td>
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
        <Modal title={editing?'Edit company':'New company'} onClose={()=>setOpen(false)} onSubmit={save}>
          <div className="grid gap-2">
            <label className="text-sm">Company name<input className="border rounded p-2 w-full" value={form.company_name} onChange={e=>setForm({...form, company_name:e.target.value})}/></label>
            <label className="text-sm">Market<input className="border rounded p-2 w-full" value={form.market} onChange={e=>setForm({...form, market:e.target.value})}/></label>
            <label className="text-sm">Geo notes<input className="border rounded p-2 w-full" value={form.geo_notes} onChange={e=>setForm({...form, geo_notes:e.target.value})}/></label>
            <label className="text-sm">Products<input className="border rounded p-2 w-full" value={form.products} onChange={e=>setForm({...form, products:e.target.value})}/></label>
            <label className="text-sm">Unique features<input className="border rounded p-2 w-full" value={form.unique_features} onChange={e=>setForm({...form, unique_features:e.target.value})}/></label>
            <label className="text-sm">Compliance<input className="border rounded p-2 w-full" value={form.compliance} onChange={e=>setForm({...form, compliance:e.target.value})}/></label>
            <label className="text-sm">Proof points<input className="border rounded p-2 w-full" value={form.proof_points} onChange={e=>setForm({...form, proof_points:e.target.value})}/></label>
            <label className="text-sm">Public links<input className="border rounded p-2 w-full" value={form.public_links} onChange={e=>setForm({...form, public_links:e.target.value})}/></label>
            <label className="text-sm">Disclaimer<input className="border rounded p-2 w-full" value={form.disclaimer} onChange={e=>setForm({...form, disclaimer:e.target.value})}/></label>
          </div>
        </Modal>
      )}
    </div>
  )
}
