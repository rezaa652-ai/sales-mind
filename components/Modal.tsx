'use client'
import React, { ReactNode, useEffect } from 'react'
import Button from './ui/Button'

export default function Modal({
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = 'Spara'
}: {
  title: string
  children: ReactNode
  onClose: () => void
  onSubmit: () => void
  submitLabel?: string
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg" style={{ animation: 'sm-fade-in .18s ease-out both' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Stäng" className="rounded p-1 hover:bg-gray-100">✕</button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Avbryt</Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      </div>
    </div>
  )
}
