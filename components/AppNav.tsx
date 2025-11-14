'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// tiny cn helper (no external imports needed)
function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(' ')
}

const nav = [
  { href: '/app/qa', label: 'Q&A' },
  { href: '/app/upload', label: 'Upload' },
  { href: '/app/simulations', label: 'Simulations' }, // 👈 Added this line
  { href: '/app/geo', label: 'Geo' },
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
            pathname.startsWith(item.href) && 'font-medium bg-slate-100'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

