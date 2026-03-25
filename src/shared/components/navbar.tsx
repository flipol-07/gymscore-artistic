'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
  competitionName?: string
  programUrl?: string
  showBack?: boolean
  backHref?: string
}

export function Navbar({ competitionName, programUrl, showBack, backHref }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="gs-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          {/* Logo */}
          <Link href="/" style={{ fontWeight: 700, fontSize: 18, color: '#111', letterSpacing: '-0.01em' }}>
            gym<span style={{ color: '#4C6FD9' }}>score</span>
          </Link>

          {/* Center: competition name */}
          {competitionName && (
            <span style={{ fontSize: 13, color: '#666', fontWeight: 500, display: 'none' }} className="hidden md:block">
              {competitionName}
            </span>
          )}

          {/* Desktop right links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden md:flex">
            {showBack && backHref && (
              <Link href={backHref} className="gs-btn-secondary" style={{ fontSize: 13 }}>
                ← Atrás
              </Link>
            )}
            {programUrl && (
              <Link href={programUrl} className="gs-btn-secondary" style={{ fontSize: 13 }}>
                Programa
              </Link>
            )}
            <Link href="/" style={{ fontSize: 13, color: '#666', padding: '6px 10px' }}>
              Inicio
            </Link>
            <Link href="/admin" className="gs-btn-primary" style={{ fontSize: 13 }}>
              Mesa de Control
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: 8, color: '#111' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #e0e0e0', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link href="/" style={{ padding: '10px 8px', fontSize: 15, color: '#111', fontWeight: 500 }} onClick={() => setMobileOpen(false)}>
              Inicio
            </Link>
            <Link href="/competiciones" style={{ padding: '10px 8px', fontSize: 15, color: '#111', fontWeight: 500 }} onClick={() => setMobileOpen(false)}>
              Competiciones
            </Link>
            {programUrl && (
              <Link href={programUrl} style={{ padding: '10px 8px', fontSize: 15, color: '#4C6FD9', fontWeight: 500 }} onClick={() => setMobileOpen(false)}>
                Programa
              </Link>
            )}
            <Link href="/admin" style={{ padding: '10px 8px', fontSize: 15, color: '#4C6FD9', fontWeight: 600 }} onClick={() => setMobileOpen(false)}>
              Mesa de Control
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
