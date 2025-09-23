'use client'
import { ReactNode, useState } from 'react'

export default function ConfirmDialog({
  children,
  onConfirm,
  title = 'Är du säker?',
  cancelLabel = 'Avbryt',
  confirmLabel = 'Ta bort',
}:{
  children:ReactNode
  onConfirm:()=>void
  title?: string
  cancelLabel?: string
  confirmLabel?: string
}){
  const [open,setOpen]=useState(false)
  return (
    <>
      <span onClick={()=>setOpen(true)}>{children}</span>
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <p className="mb-4">{title}</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setOpen(false)} className="px-4 py-2 rounded bg-slate-200">{cancelLabel}</button>
              <button onClick={()=>{ onConfirm(); setOpen(false) }} className="px-4 py-2 rounded bg-red-600 text-white">{confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
