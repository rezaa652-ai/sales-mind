// components/AppShell.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getLang, type Lang, t } from '@/lib/i18n'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [lang, setLang] = useState<Lang>('sv')

  useEffect(() => { setLang(getLang()) }, [pathname])

const links = [
  { href: '/app/qa',       label: t(lang, 'nav.qa') },
    { href: '/app/upload', label: 'Upload' },
  { href: '/app/profiles', label: t(lang, 'nav.profiles') },
  { href: '/app/company',  label: t(lang, 'nav.company') },
  { href: '/app/kb',       label: t(lang, 'nav.kb') },
  { href: '/app/events',   label: t(lang, 'nav.events') },
  { href: '/app/geo',      label: t(lang, 'nav.geo') },
  { href: '/app/settings', label: t(lang, 'nav.settings') },
]

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-gray-50 p-4">
        <h2 className="font-bold mb-4">{t(lang, 'app.title')}</h2>
        <nav className="flex flex-col gap-2">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`p-2 rounded ${pathname === l.href ? 'bg-blue-100 text-blue-600 font-medium' : 'hover:bg-gray-100'}`}
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
