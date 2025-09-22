import React from 'react'
import { cn } from '@/lib/cn'

export default function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm', className)} style={{ animation: 'sm-fade-in .18s ease-out both' }}>
      {children}
    </div>
  )
}
