'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { t, type Lang, getLang } from '@/lib/i18n'

export default function CompanyPage(){
  const [lang,setLang]=useState<Lang>('sv')
  const [rows,setRows]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<any>({
    company_name:'', market:'', geo_notes:'', products:'', unique_features:'',
    compliance:'', proof_points:'', public_links:'', disclaimer:''
  })
  const [editing,setEditing]=useState<any>(null)

  useEffect(()=>{
    setLang(getLang())
    load()
  },[])

  async function load(){ setRows(await (await fetch('/api/company')).json()) }

  async function save(){
    const url = editing? `/api/company/${editing.id}`:'/api/company'
    const method = editing? 'PUT':'POST'
    const r = await fetch(url,{ method, body: JSON.stringify(form) })
    if(r.ok){ setOpen(false); setEditing(null); load() } else alert(t(lang,'common.error'))
  }
  async function del(id:string){
    const r = await fetch(`/api/company/${id}`,{ method:'DELETE' })
    if(r.ok) load(); else alert(t(lang,'common.error'))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">{t(lang,'company.title')}</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2"
          onClick={()=>{ setEditing(null); setForm({ ...form, company_name:'' }); setOpen(true) }}>
          {t(lang,'company.new')}
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-2">{t(lang,'company.table.name')}</th>
            <th className="p-2">{t(lang,'company.table.market')}</th>
            <th className="p-2">{t(lang,'company.table.features')}</th>
            <th className="p-2"></th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={4} className="p-4 text-slate-500">{t(lang,'common.loading')}</td></tr>}
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.company_name}</td>
                <td className="p-2">{r.market}</td>
                <td className="p-2">{r.unique_features}</td>
                <td className="p-2 text-right">
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
        <Modal title={editing? t(lang,'company.modal.edit') : t(lang,'company.modal.new')}
               onClose={()=>setOpen(false)} onSubmit={save}>
          <div className="grid gap-2">
            <label className="text-sm">{t(lang,'company.field.name')}
              <input className="border rounded p-2 w-full" value={form.company_name} placeholder={t(lang,'company.ph.name')}
                     onChange={e=>setForm({...form, company_name:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.market')}
              <input className="border rounded p-2 w-full" value={form.market} placeholder={t(lang,'company.ph.market')}
                     onChange={e=>setForm({...form, market:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.geo')}
              <input className="border rounded p-2 w-full" value={form.geo_notes} placeholder={t(lang,'company.ph.geo')}
                     onChange={e=>setForm({...form, geo_notes:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.products')}
              <input className="border rounded p-2 w-full" value={form.products} placeholder={t(lang,'company.ph.products')}
                     onChange={e=>setForm({...form, products:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.features')}
              <input className="border rounded p-2 w-full" value={form.unique_features} placeholder={t(lang,'company.ph.features')}
                     onChange={e=>setForm({...form, unique_features:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.compliance')}
              <input className="border rounded p-2 w-full" value={form.compliance} placeholder={t(lang,'company.ph.compliance')}
                     onChange={e=>setForm({...form, compliance:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.proof')}
              <input className="border rounded p-2 w-full" value={form.proof_points} placeholder={t(lang,'company.ph.proof')}
                     onChange={e=>setForm({...form, proof_points:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.links')}
              <input className="border rounded p-2 w-full" value={form.public_links} placeholder={t(lang,'company.ph.links')}
                     onChange={e=>setForm({...form, public_links:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'company.field.disclaimer')}
              <input className="border rounded p-2 w-full" value={form.disclaimer} placeholder={t(lang,'company.ph.disclaimer')}
                     onChange={e=>setForm({...form, disclaimer:e.target.value})}/>
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
