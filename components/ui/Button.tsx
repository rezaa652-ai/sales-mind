// 'use client'
import React from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed'
  const variants: Record<Variant, string> = {
    primary: 'bg-[var(--brand)] text-white hover:bg-[var(--brand-700)] shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
    danger: 'bg-[var(--danger)] text-white hover:bg-red-700'
  }
  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base'
  }
  return (
    <button
      className={cn(base, variants[variant], sizes[size], loading && 'opacity-80', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />}
      {children}
    </button>
  )
}
