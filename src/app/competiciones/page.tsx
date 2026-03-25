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
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '32px 0 24px' }}>
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
              <div style={{ display: 'flex', gap: 4 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/competiciones/${comp.slug}`}
                  className="gs-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: 12 }}
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
                    <span style={{ color: 'var(--gs-primary)', fontSize: 13, fontWeight: 500 }}>→</span>
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
