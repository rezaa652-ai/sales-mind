// app/(site)/layout.tsx
import type { ReactNode } from 'react'
import Link from 'next/link'
import { siteImageUrl } from '@/lib/siteImages'

export default function SiteLayout({ children }: { children: ReactNode }) {
  const logo = siteImageUrl('logo.png') // upload to Supabase: bucket "site", path "logo.png"
  return (
    <div className="min-h-screen flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src={logo || '/placeholder.svg'}
              alt="SalesMind Logo"
              className="h-40 w-auto md:h-40"
            />
          </Link>
        </div>

        {/* Navigation (stacks on mobile, inline on desktop) */}
        <nav className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-sm">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/auth" className="px-3 py-1 rounded border">Log In</Link>
          <Link href="/auth" className="px-3 py-1 rounded bg-black text-white">Sign Up</Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 text-center md:text-left">
          © {new Date().getFullYear()} SalesMind
        </div>
      </footer>
    </div>
  )
}
