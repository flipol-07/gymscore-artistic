'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { searchCompetitions } from '@/features/competitions/data/demo-data'
import type { Competition } from '@/features/competitions/types'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: Competition['status'] }) {
  if (status === 'active') return <span className="gs-badge gs-badge-live">● En directo</span>
  if (status === 'finished') return <span className="gs-badge gs-badge-finished">Finalizado</span>
  return <span className="gs-badge gs-badge-finished">Próximamente</span>
}

export default function Home() {
  const [query, setQuery] = useState('')
  const competitions = searchCompetitions(query)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero header */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '40px 0 32px' }}>
          <div className="gs-container">
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--gs-text)', marginBottom: 6 }}>
              Resultados en directo
            </h1>
            <p style={{ fontSize: 15, color: 'var(--gs-muted)', marginBottom: 24 }}>
              Trofeos y competiciones de gimnasia artística
            </p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 480 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                className="gs-input"
                style={{ paddingLeft: 36 }}
                placeholder="Buscar competición…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Competition list */}
        <div className="gs-container" style={{ padding: '24px 16px' }}>
          {competitions.length === 0 ? (
            <p style={{ color: 'var(--gs-muted)', fontSize: 14, padding: '32px 0' }}>
              No se encontraron competiciones.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {competitions.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/competiciones/${comp.slug}`}
                  className="gs-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: 12, textDecoration: 'none' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--gs-text)', marginBottom: 3 }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gs-muted)' }}>
                      {comp.location} · {formatDate(comp.date)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--gs-muted)', whiteSpace: 'nowrap' }}>
                      {comp.categoryCount} categorías
                    </span>
                    <StatusBadge status={comp.status} />
                    <span style={{ fontSize: 13, color: 'var(--gs-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      Ver resultados →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
