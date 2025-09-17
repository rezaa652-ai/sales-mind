// components/AppNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/app/qa', label: 'Q&A' },
  { href: '/app/profiles', label: 'Profiles' },
  { href: '/app/company', label: 'Company' },
  { href: '/app/kb', label: 'Knowledge Base' },
  { href: '/app/events', label: 'Events' },
  { href: '/app/settings', label: 'Settings' },
]

export default function AppNav(){
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-2">
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={`p-2 rounded ${pathname===l.href ? 'bg-blue-100 text-blue-600 font-medium' : 'hover:bg-gray-100'}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
