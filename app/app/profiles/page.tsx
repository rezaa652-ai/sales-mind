'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { t, type Lang, getLang } from '@/lib/i18n'

export default function ProfilesPage(){
  const [lang,setLang]=useState<Lang>('sv')
  const [rows,setRows]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<any>({
    name:'', language:'Svenska', tone:'Konkret', callback_windows:'12:15,16:40',
    goals:'Avslut|Boka|Kvalificera', sales_targets:'3 meetings/day', persona_hints:'',
    compliance:'', proof:'', company_id:''
  })
  const [editing,setEditing]=useState<any>(null)
  const [companies,setCompanies]=useState<any[]>([])

  useEffect(()=>{
    setLang(getLang())
    ;(async()=>{
      setRows(await (await fetch('/api/profiles')).json())
      setCompanies(await (await fetch('/api/company')).json())
    })()
  },[])

  async function save(){
    const url = editing? `/api/profiles/${editing.id}`:'/api/profiles'
    const method = editing? 'PUT':'POST'
    const r = await fetch(url,{ method, body: JSON.stringify(form) })
    if(r.ok){ setOpen(false); setEditing(null); load() } else alert(t(lang,'common.error'))
  }
  async function del(id:string){
    const r = await fetch(`/api/profiles/${id}`,{ method:'DELETE' })
    if(r.ok) load(); else alert(t(lang,'common.error'))
  }
  async function load(){
    setRows(await (await fetch('/api/profiles')).json())
    setCompanies(await (await fetch('/api/company')).json())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">{t(lang,'profiles.title')}</h1>
        <button className="bg-[var(--brand)] text-white rounded px-4 py-2"
          onClick={()=>{ setEditing(null); setForm({ ...form, name:'' }); setOpen(true) }}>
          {t(lang,'profiles.new')}
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="p-2">{t(lang,'profiles.table.name')}</th>
            <th className="p-2">{t(lang,'profiles.table.language')}</th>
            <th className="p-2">{t(lang,'profiles.table.tone')}</th>
            <th className="p-2">{t(lang,'profiles.table.company')}</th>
            <th className="p-2"></th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={5} className="p-4 text-slate-500">{t(lang,'common.loading')}</td></tr>}
            {rows.map(r=>(
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.language}</td>
                <td className="p-2">{r.tone}</td>
                <td className="p-2">{companies.find(c=>c.id===r.company_id)?.company_name||t(lang,'common.none')}</td>
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
        <Modal title={editing? t(lang,'profiles.modal.edit') : t(lang,'profiles.modal.new')}
               onClose={()=>setOpen(false)} onSubmit={save}>
          <div className="grid gap-2">
            <label className="text-sm">{t(lang,'profiles.field.name')}
              <input className="border rounded p-2 w-full" value={form.name} placeholder={t(lang,'profiles.ph.name')}
                     onChange={e=>setForm({...form, name:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.language')}
              <input className="border rounded p-2 w-full" value={form.language} placeholder={t(lang,'profiles.ph.language')}
                     onChange={e=>setForm({...form, language:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.tone')}
              <input className="border rounded p-2 w-full" value={form.tone} placeholder={t(lang,'profiles.ph.tone')}
                     onChange={e=>setForm({...form, tone:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.callback')}
              <input className="border rounded p-2 w-full" value={form.callback_windows} placeholder={t(lang,'profiles.ph.callback')}
                     onChange={e=>setForm({...form, callback_windows:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.goals')}
              <input className="border rounded p-2 w-full" value={form.goals} placeholder={t(lang,'profiles.ph.goals')}
                     onChange={e=>setForm({...form, goals:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.targets')}
              <input className="border rounded p-2 w-full" value={form.sales_targets} placeholder={t(lang,'profiles.ph.targets')}
                     onChange={e=>setForm({...form, sales_targets:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.persona')}
              <input className="border rounded p-2 w-full" value={form.persona_hints} placeholder={t(lang,'profiles.ph.persona')}
                     onChange={e=>setForm({...form, persona_hints:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.compliance')}
              <input className="border rounded p-2 w-full" value={form.compliance} placeholder={t(lang,'profiles.ph.compliance')}
                     onChange={e=>setForm({...form, compliance:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.proof')}
              <input className="border rounded p-2 w-full" value={form.proof} placeholder={t(lang,'profiles.ph.proof')}
                     onChange={e=>setForm({...form, proof:e.target.value})}/>
            </label>
            <label className="text-sm">{t(lang,'profiles.field.company')}
              <select className="border rounded p-2 w-full" value={form.company_id||''}
                      onChange={e=>setForm({...form, company_id:e.target.value||null})}>
                <option value="">{t(lang,'common.none')}</option>
                {companies.map((c:any)=><option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
