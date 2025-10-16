// app/layout.tsx
import './globals.css'
export const metadata = { title: 'SalesMind' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}
