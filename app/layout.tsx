import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aura Neurotech - User Portal',
  description: 'Ecosistema cerrado para gestión de hardware Aura',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}
