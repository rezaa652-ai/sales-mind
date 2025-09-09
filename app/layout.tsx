import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sales Mind',
  description: 'Sales coaching MVP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  )
}

