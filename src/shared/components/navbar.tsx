'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface NavbarProps {
  competitionName?: string
  programUrl?: string
}

export function Navbar({
  competitionName,
  programUrl,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-700 w-full",
        scrolled
          ? "bg-white/95 backdrop-blur-3xl py-3 border-b border-[#d0c5af]/20 shadow-sm"
          : "bg-transparent py-6 border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-4 group transition-all"
            >
              <div className="relative h-12 w-12 overflow-hidden flex items-center justify-center">
                <Image 
                  src="/images/logo-luxury.png" 
                  alt="GymScore Luxury Logo" 
                  width={48} 
                  height={48}
                  className="object-contain transform transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-black italic tracking-tighter leading-none text-[#1b1c1a]">
                  gym<span className="text-[#8c4b55]">score</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#735c00] leading-none mt-1">
                  the kinetic atelier
                </span>
              </div>
            </Link>

            {/* Desktop Links (Left aligned) */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/competiciones"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1b1c1a]/80 hover:text-[#8c4b55] transition-colors py-2"
              >
                Competiciones
              </Link>
            </div>
          </div>

          {/* Center: competition name (desktop) */}
          {competitionName && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:flex items-center gap-3 px-6 py-2 bg-[#f5f3ef] border border-[#d0c5af]/10"
            >
              <div className="h-1.5 w-1.5 bg-[#735c00]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1b1c1a]">
                {competitionName}
              </span>
            </motion.div>
          )}

          {/* Desktop links (Right aligned) */}
          <div className="hidden md:flex items-center gap-6">
            {programUrl && (
              <Link
                href={programUrl}
                className="atelier-button-secondary py-2.5 px-6"
              >
                Programa del Evento
              </Link>
            )}
            <Link
              href="/admin"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1b1c1a] border-b border-[#1b1c1a]/20 hover:border-[#8c4b55] hover:text-[#8c4b55] transition-all py-1"
            >
              Jueces
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-[#1b1c1a] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white md:hidden"
          >
            <div className="flex flex-col h-full px-8 py-12">
              <div className="flex justify-between items-center mb-24">
                <div className="font-serif text-3xl font-black italic tracking-tighter text-[#1b1c1a]">
                  gym<span className="text-[#8c4b55]">score</span>
                </div>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={32} />
                </button>
              </div>

              <div className="flex flex-col gap-12">
                <Link
                  href="/"
                  className="text-5xl font-black italic tracking-tighter text-[#1b1c1a]"
                  onClick={() => setMobileOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  href="/competiciones"
                  className="text-5xl font-black italic tracking-tighter text-[#1b1c1a]"
                  onClick={() => setMobileOpen(false)}
                >
                  Competiciones
                </Link>
                {programUrl && (
                  <Link
                    href={programUrl}
                    className="text-5xl font-black italic tracking-tighter text-[#8c4b55]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Programa
                  </Link>
                )}
                <Link
                  href="/admin"
                  className="text-2xl font-black uppercase tracking-[0.3em] text-[#735c00] mt-12"
                  onClick={() => setMobileOpen(false)}
                >
                  Acceso Jueces
                </Link>
              </div>

              <div className="mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1b1c1a]/70">
                  GymScore · Kinetic Atelier
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
