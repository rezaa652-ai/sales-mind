'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { t, type Lang, getLang } from '@/lib/i18n'

export default function KBPage(){
  const [lang,setLang]=useState<Lang>('sv')
  const [rows,setRows]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<any>({ signal:'', best_practice:'', profile_name:'' })
  const [editing,setEditing]=useState<any>(null)

  useEffect(()=>{
    setLang(getLang())
    load()
  },[])

  async function load(){ setRows(await (await fetch('/api/kb')).json()) }

  async function save(){
    const url = editing ? `/api/kb/${editing.id}` : '/api/kb'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url,{ method, body: JSON.stringify(form) })
    if(res.ok){ setOpen(false); setEditing(null); setForm({ signal:'', best_practice:'', profile_name:'' }); load() }
    else alert(t(lang,'common.error'))
  }
  async function del(id:string){
    const res = await fetch(`/api/kb/${id}`,{ method:'DELETE' })
    if(res.ok){ load() } else alert(t(lang,'common.error'))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">{t(lang,'kb.title')}</h1>
        <button className="bg-[var(--brand)] text-white rounded-md px-4 py-2"
          onClick={()=>{ setEditing(null); setForm({ signal:'', best_practice:'', profile_name:'' }); setOpen(true) }}>
          {t(lang,'kb.new')}
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-3 text-left">{t(lang,'kb.table.signal')}</th>
            <th className="p-3 text-left">{t(lang,'kb.table.best')}</th>
            <th className="p-3 text-left">{t(lang,'kb.table.profile')}</th>
            <th className="p-3"></th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td className="p-6 text-slate-500" colSpan={4}>{t(lang,'common.loading')}</td></tr>}
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.signal}</td>
                <td className="p-3">{r.best_practice}</td>
                <td className="p-3">{r.profile_name}</td>
                <td className="p-3 text-right">
                  <button className="mr-2 underline" onClick={()=>{ setEditing(r); setForm(r); setOpen(true) }}>
                    {t(lang,'common.edit')}
                  </button>
                  <ConfirmDialog onConfirm={()=>del(r.id)}>
                    <button className="text-red-600 underline">{t(lang,'common.delete')}</button>
                  </ConfirmDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing? t(lang,'kb.modal.edit') : t(lang,'kb.modal.new')}
               onClose={()=>setOpen(false)} onSubmit={save}>
          <div className="grid gap-3">
            <label className="text-sm">{t(lang,'kb.field.signal')}
              <input className="border rounded p-2 w-full" value={form.signal}
                     placeholder={t(lang,'kb.ph.signal')}
                     onChange={e=>setForm({...form, signal:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'kb.field.best')}
              <textarea className="border rounded p-2 w-full" rows={3} value={form.best_practice}
                        placeholder={t(lang,'kb.ph.best')}
                        onChange={e=>setForm({...form, best_practice:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'kb.field.profile')}
              <input className="border rounded p-2 w-full" value={form.profile_name}
                     placeholder={t(lang,'kb.ph.profile')}
                     onChange={e=>setForm({...form, profile_name:e.target.value})}/>
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
