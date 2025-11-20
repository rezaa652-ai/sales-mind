// components/AppNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils' // if you already use a helper for conditional classNames

const nav = [
  { href: '/app/qa', label: 'Q&A' },
    { href: '/app/upload', label: 'Upload' },
    { href: '/app/upload', label: 'Upload' },
  // 🆕 new Upload link (right after Q&A)
  { href: '/app/upload', label: 'Upload' },
  { href: '/app/company', label: 'Company' },
  { href: '/app/profiles', label: 'Profiles' },
  { href: '/app/events', label: 'Events' },
  { href: '/app/kb', label: 'Knowledge Base' },
  { href: '/app/settings', label: 'Settings' },
]

export default function AppNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col space-y-1 text-sm">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded px-3 py-2 hover:bg-slate-100 transition',
            pathname.startsWith(item.href)
              ? 'bg-[var(--brand-light)] text-[var(--brand-dark)] font-medium'
              : 'text-slate-700'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
