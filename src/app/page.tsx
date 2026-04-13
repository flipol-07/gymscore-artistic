'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { FavoritesGrid } from '@/features/competitions/components/favorites-grid'
import * as service from '@/features/competitions/services/competition-service'
import type { Competition } from '@/features/competitions/types'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status, isPublished }: { status: Competition['status'], isPublished?: boolean }) {
  if (!isPublished) return <span className="gs-badge gs-badge-finished" style={{ border: '1px dashed #ccc', background: 'transparent' }}>Borrador</span>
  if (status === 'active') return <span className="gs-badge gs-badge-live">● En directo</span>
  if (status === 'finished') return <span className="gs-badge gs-badge-finished">Finalizado</span>
  return null
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    service.getCompetitions(true).then(data => {
      setAllCompetitions(data)
      setLoading(false)
    })
  }, [])

  const filteredCompetitions = allCompetitions.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.location?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero header */}
        <div className="gs-hero" style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '40px 0 32px', textAlign: 'center' }}>
          <div className="gs-container">
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--gs-text)', marginBottom: 6 }}>
              Resultados en directo
            </h1>
            <p style={{ fontSize: 15, color: 'var(--gs-muted)', marginBottom: 24 }}>
              Trofeos y competiciones de gimnasia artística
            </p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
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

        {/* Favorites Section */}
        <FavoritesGrid />

        {/* Competition list */}
        <div className="gs-container" style={{ padding: '24px 16px' }}>
          {loading ? (
            <p style={{ color: 'var(--gs-muted)', fontSize: 14, padding: '32px 0' }}>Cargando datos reales...</p>
          ) : filteredCompetitions.length === 0 ? (
            <p style={{ color: 'var(--gs-muted)', fontSize: 14, padding: '32px 0' }}>
              No se encontraron competiciones.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredCompetitions.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/competiciones/${comp.slug}`}
                  className="gs-card"
                  style={{ 
                    display: 'block', 
                    padding: '16px 20px', 
                    textDecoration: 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ paddingRight: 80 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gs-text)', marginBottom: 4, lineHeight: 1.3 }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gs-primary)', fontWeight: 600, marginBottom: 8 }}>
                      {comp.categoryCount} categorías
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gs-muted)', display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
                      <span style={{ fontWeight: 500 }}>{formatDate(comp.date)}</span>
                      {comp.location && (
                        <>
                          <span style={{ opacity: 0.5 }}>·</span>
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {comp.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <StatusBadge status={comp.status} isPublished={comp.isPublished} />
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
