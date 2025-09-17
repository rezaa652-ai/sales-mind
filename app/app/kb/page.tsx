'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function KBPage(){
  const [rows,setRows]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<any>({ signal:'', best_practice:'', profile_name:'' })
  const [editing,setEditing]=useState<any>(null)

  async function load(){ setRows(await (await fetch('/api/kb')).json()) }
  useEffect(()=>{ load() },[])

  async function save(){
    const url = editing ? `/api/kb/${editing.id}` : '/api/kb'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url,{ method, body: JSON.stringify(form) })
    if(res.ok){ setOpen(false); setEditing(null); setForm({ signal:'', best_practice:'', profile_name:'' }); load() }
    else alert('Fel vid sparande')
  }
  async function del(id:string){
    const res = await fetch(`/api/kb/${id}`,{ method:'DELETE' })
    if(res.ok){ load() } else alert('Fel vid borttagning')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Knowledge Base</h1>
        <button className="bg-[var(--brand)] text-white rounded-md px-4 py-2" onClick={()=>{ setEditing(null); setForm({ signal:'', best_practice:'', profile_name:'' }); setOpen(true) }}>+ Ny entry</button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-3 text-left">Signal</th><th className="p-3 text-left">Best practice</th><th className="p-3 text-left">Profil</th><th></th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td className="p-6 text-slate-500" colSpan={4}>Inga KB entries ännu.</td></tr>}
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.signal}</td>
                <td className="p-3">{r.best_practice}</td>
                <td className="p-3">{r.profile_name}</td>
                <td className="p-3 text-right">
                  <button className="mr-2 underline" onClick={()=>{ setEditing(r); setForm(r); setOpen(true) }}>Redigera</button>
                  <ConfirmDialog onConfirm={()=>del(r.id)}>
                    <button className="text-red-600 underline">Ta bort</button>
                  </ConfirmDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing?'Redigera KB':'Ny KB entry'} onClose={()=>setOpen(false)} onSubmit={save}>
          <div className="grid gap-3">
            <label className="text-sm">Signal<input className="border rounded p-2 w-full" value={form.signal} onChange={e=>setForm({...form, signal:e.target.value})}/></label>
            <label className="text-sm">Best practice<textarea className="border rounded p-2 w-full" value={form.best_practice} onChange={e=>setForm({...form, best_practice:e.target.value})}/></label>
            <label className="text-sm">Profil<input className="border rounded p-2 w-full" value={form.profile_name} onChange={e=>setForm({...form, profile_name:e.target.value})}/></label>
          </div>
        </Modal>
      )}
    </div>
  )
}
