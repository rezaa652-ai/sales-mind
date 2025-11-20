'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileMenu({
  extraLinks = [],
}: {
  extraLinks?: { label: string; href: string }[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden w-full">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-2 rounded border"
        >
          ☰ Menu
        </button>

        {/* ✅ Log In / Sign Up stay visible */}
        <div className="flex items-center gap-2">
          <Link
            href="https://www.salesmind.app/auth?mode=login"
            prefetch={false}
            rel="noopener noreferrer"
            className="px-3 py-1 rounded border"
          >
            Log In
          </Link>

          <Link
            href="https://www.salesmind.app/auth?mode=signup"
            prefetch={false}
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-black text-white"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {open && (
        <nav
          className="mt-2 grid gap-2 rounded border p-3 bg-white"
          onClick={() => setOpen(false)}
        >
          <Link href="/features" className="px-2 py-1 rounded hover:bg-slate-50">
            Features
          </Link>
          <Link href="/pricing" className="px-2 py-1 rounded hover:bg-slate-50">
            Pricing
          </Link>
          <Link href="/contact" className="px-2 py-1 rounded hover:bg-slate-50">
            Contact
          </Link>

          {/* ✅ Include extraLinks (if provided from layout) */}
          {extraLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-2 py-1 rounded hover:bg-slate-50 text-blue-600 border-t border-gray-200"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
