import React from 'react'
import { cn } from '@/lib/cn'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-4 w-full rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]', className)}
      style={{ animation: 'skeleton-shimmer 1.2s ease-in-out infinite' }}
    />
  )
}
