'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import type { Competition } from '@/features/competitions/types'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

function StatusBadge({ status, isPublished }: { status: Competition['status'], isPublished?: boolean }) {
  if (!isPublished) return <span className="gs-badge gs-badge-finished" style={{ border: '1px dashed #ccc', background: 'transparent' }}>Borrador</span>
  if (status === 'active') return <span className="gs-badge gs-badge-live">● En directo</span>
  if (status === 'finished') return <span className="gs-badge gs-badge-finished">Finalizado</span>
  return null
}

export default function CompeticionesPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'finished'>('all')
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    service.getCompetitions(true).then(data => {
      setAllCompetitions(data || [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const filtered = (allCompetitions || []).filter((c) => {
    const matchQ = c.name.toLowerCase().includes(query.toLowerCase()) || (c.location || '').toLowerCase().includes(query.toLowerCase())
    const matchT = tab === 'all' || c.status === tab
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
          {loading ? (
            <p style={{ color: 'var(--gs-muted)', padding: '40px 0', fontSize: 14 }}>Cargando competiciones...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: 'var(--gs-muted)', padding: '40px 0', fontSize: 14 }}>Sin resultados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/competiciones/${comp.slug}`}
                  className="gs-card hover-bg"
                  style={{ 
                    padding: 16, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gs-text)' }}>{comp.name}</span>
                      <StatusBadge status={comp.status} isPublished={comp.isPublished} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gs-muted)', fontWeight: 500 }}>
                      {formatDate(comp.date)} · {comp.location}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gs-primary)' }}>Ver detalles →</div>
                    <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{comp.categoryCount} categorías</div>
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
