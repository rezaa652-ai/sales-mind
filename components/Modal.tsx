'use client'
import { ReactNode } from 'react'
export default function Modal({ title, children, onClose, onSubmit }:{
  title:string, children:ReactNode, onClose:()=>void, onSubmit:()=>void
}){
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-200">Avbryt</button>
          <button onClick={onSubmit} className="px-4 py-2 rounded bg-[var(--brand)] text-white">Spara</button>
        </div>
      </div>
    </div>
  )
}
