'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/cn'

const LINKS = [
  { href: '/app/qa', label: 'Q&A' },
  { href: '/app/profiles', label: 'Profiles' },
  { href: '/app/company', label: 'Company' },
  { href: '/app/kb', label: 'Knowledge Base' },
  { href: '/app/events', label: 'Events' },
  { href: '/app/settings', label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-dvh">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/app/qa" className="font-semibold">SalesMind</Link>
          <nav className="hidden md:flex items-center gap-2">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm hover:bg-gray-100',
                  pathname === l.href && 'bg-blue-100 text-blue-700 font-medium'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="md:hidden text-sm text-gray-600">Meny ↓</div>
        </div>
      </header>

      {/* Body with sidebar (desktop) */}
      <div className="container grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-6">
        <aside className="hidden md:block">
          <div className="rounded-xl border border-[var(--border)] bg-white p-3">
            <nav className="flex flex-col">
              {LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm hover:bg-gray-100',
                    pathname === l.href && 'bg-blue-100 text-blue-700 font-medium'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border)] bg-white/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-3">
          {LINKS.slice(0, 6).map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  'block text-center py-3 text-sm',
                  pathname === l.href ? 'text-blue-700 font-semibold' : 'text-gray-700'
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
