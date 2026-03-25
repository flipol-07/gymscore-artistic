import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'GymScore · The Kinetic Atelier',
  description:
    'Plataforma de resultados en directo para competiciones de gimnasia. Elegancia, precisión y arte en cada nota.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <body className="font-sans min-h-screen antialiased bg-[#fbf9f5]">{children}</body>
    </html>
  )
}
