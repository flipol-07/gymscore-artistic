import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ServiceWorkerRegistrar } from './sw-register'

export const metadata: Metadata = {
  title: 'GymScore · Resultados en directo',
  description: 'Plataforma de resultados en directo para competiciones de gimnasia artística.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GymScore',
  },
}

export const viewport: Viewport = {
  themeColor: '#4C6FD9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
