'use client'
import { ReactNode, useState } from 'react'
export default function ConfirmDialog({ children, onConfirm }:{ children:ReactNode, onConfirm:()=>void }){
  const [open,setOpen]=useState(false)
  return (
    <>
      <span onClick={()=>setOpen(true)}>{children}</span>
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <p className="mb-4">Är du säker?</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setOpen(false)} className="px-4 py-2 rounded bg-slate-200">Avbryt</button>
              <button onClick={()=>{ onConfirm(); setOpen(false) }} className="px-4 py-2 rounded bg-red-600 text-white">Ta bort</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
