// components/Modal.tsx
'use client'
import { ReactNode, useEffect } from "react"

export default function Modal({
  title,
  children,
  onClose,
  onSubmit,
  primaryLabel = "Save",
  cancelLabel = "Cancel",
}:{
  title: string
  children: ReactNode
  onClose: () => void
  onSubmit: () => void
  primaryLabel?: string
  cancelLabel?: string
}){
  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  // Lock background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Click outside to close
  function onBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={onBackdrop}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl outline-none flex flex-col max-h-[90vh]"
        onMouseDown={(e)=>e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-3 border-b shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-4 overflow-y-auto grow">
          {children}
        </div>

        <div className="px-6 pb-5 pt-3 border-t shrink-0 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-md bg-[var(--brand)] text-white hover:opacity-90"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
