'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCompetitions } from '@/features/competitions/data/demo-data'
import type { Competition } from '@/features/competitions/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: Competition['status'] }) {
  if (status === 'active') return <span className="gs-badge gs-badge-live">● En directo</span>
  if (status === 'finished') return <span className="gs-badge gs-badge-finished">Finalizado</span>
  return <span className="gs-badge gs-badge-finished">Próximamente</span>
}

export default function CompeticionesPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'finished'>('all')

  const all = getCompetitions()
  const filtered = all.filter((c) => {
    const matchQ = c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase())
    const matchT = tab === 'all' || c.status === tab || (tab === 'finished' && c.status === 'draft')
    return matchQ && matchT
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Header */}
        <div className="gs-hero" style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '32px 0 24px' }}>
          <div className="gs-container">
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Competiciones</h1>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 400 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  className="gs-input"
                  style={{ paddingLeft: 32, fontSize: 14 }}
                  placeholder="Buscar evento o ciudad…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Tabs */}
              <div className="gs-filter-tabs" style={{ display: 'flex', gap: 4 }}>
                {(['all', 'active', 'finished'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: tab === t ? 'var(--gs-text)' : '#fff',
                      color: tab === t ? '#fff' : 'var(--gs-muted)',
                      borderColor: tab === t ? 'var(--gs-text)' : 'var(--gs-border)',
                    }}
                  >
                    {t === 'all' ? 'Todas' : t === 'active' ? 'En directo' : 'Finalizadas'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="gs-container" style={{ padding: '24px 16px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--gs-muted)', padding: '40px 0', fontSize: 14 }}>Sin resultados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((comp) => (
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
                    <StatusBadge status={comp.status} />
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
