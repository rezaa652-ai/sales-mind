// app/app/layout.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const links = [
    { href: '/app/qa', label: 'Q&A' },
    { href: '/app/profiles', label: 'Profiles' },
    { href: '/app/company', label: 'Company' },
    { href: '/app/kb', label: 'Knowledge Base' },
    { href: '/app/events', label: 'Events' },
    { href: '/app/settings', label: 'Settings' },
  ]
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-gray-50 p-4">
        <h2 className="font-bold mb-4">SalesMind</h2>
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
      </aside>
      <main className="flex-1 p-6 max-w-[960px]">{children}</main>
    </div>
  )
}
