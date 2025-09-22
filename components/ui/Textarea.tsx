import React from 'react'
import { cn } from '@/lib/cn'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
}

export default function Textarea({ label, hint, error, className, rows = 4, ...props }: Props) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm text-gray-700">{label}</span>}
      <textarea
        rows={rows}
        className={cn(
          'w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm',
          'focus-visible:outline-none focus:ring-2 focus:ring-[var(--ring)]',
          error && 'border-[var(--danger)] focus:ring-red-200',
          className
        )}
        {...props}
      />
      {hint && !error && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-[var(--danger)]">{error}</span>}
    </label>
  )
}
