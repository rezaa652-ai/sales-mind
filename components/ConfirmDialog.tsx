'use client'
import React, { ReactNode, useState } from 'react'
import Button from './ui/Button'

export default function ConfirmDialog({
  children,
  onConfirm,
  title = 'Är du säker?',
  confirmLabel = 'Ta bort'
}: {
  children: ReactNode
  onConfirm: () => void
  title?: string
  confirmLabel?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg" style={{ animation: 'sm-fade-in .18s ease-out both' }}>
            <h3 className="text-base font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-700 mb-4">Den här åtgärden kan inte ångras.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Avbryt</Button>
              <Button variant="danger" onClick={() => { onConfirm(); setOpen(false) }}>{confirmLabel}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
