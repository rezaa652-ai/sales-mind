// app/layout.tsx — neutral root wrapper for *all* routes
import type { ReactNode } from 'react'
import './globals.css'   // ✅ restore Tailwind/global styles

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
