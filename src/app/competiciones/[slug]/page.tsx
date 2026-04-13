'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import type { Competition, CompetitionSession, Promotion } from '@/features/competitions/types'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function GenderBadge({ gender }: { gender: Promotion['gender'] }) {
  const isFemale = gender === 'female'
  return (
    <span 
      className={isFemale ? 'gs-badge gs-badge-female' : 'gs-badge gs-badge-male'}
      style={{ fontSize: 11, textTransform: 'uppercase' }}
    >
      {isFemale ? 'Femenino' : 'Masculino'}
    </span>
  )
}

export default function EventoPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise)
  const { slug } = params
  
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [sessions, setSessions] = useState<CompetitionSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const comp = await service.getCompetitionBySlug(slug)
      if (comp) {
        setCompetition(comp)
        const sess = await service.getSessions(comp.id)
        setSessions(sess)
        if (sess.length > 0) setActiveSessionId(sess[0].id)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    if (activeSessionId) {
      service.getPromotions(activeSessionId).then(setPromotions)
    }
  }, [activeSessionId])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 'bold' }}>Cargando datos reales...</div>
  if (!competition) return <div style={{ padding: 40, textAlign: 'center' }}>Competición no encontrada.</div>

  const activeSession = sessions.find(s => s.id === activeSessionId)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar showBack backHref="/" />

      <main style={{ flex: 1 }}>
        {/* Event Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '32px 0 24px' }}>
          <div className="gs-container">
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--gs-text)', marginBottom: 12, lineHeight: 1.2 }}>
              {competition.name}
            </h1>
            
            {competition.programUrl ? (
              <a 
                href={competition.programUrl} 
                className="gs-btn-primary" 
                style={{ fontSize: 13, padding: '8px 16px', textDecoration: 'none' }}
                download
              >
                Descargar Programa (PDF)
              </a>
            ) : (
              <button 
                className="gs-btn-secondary" 
                style={{ fontSize: 13, opacity: 0.6, cursor: 'not-allowed' }}
                disabled
              >
                Programa no disponible
              </button>
            )}
          </div>
        </div>

        {/* Sessions Selector */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '12px 0' }}>
          <div className="gs-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {sessions.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: activeSessionId === s.id ? 'var(--gs-text)' : '#f9fafb',
                      color: activeSessionId === s.id ? '#fff' : 'var(--gs-muted)',
                      borderColor: activeSessionId === s.id ? 'var(--gs-text)' : 'var(--gs-border)',
                    }}
                  >
                    Jornada {idx + 1}
                  </button>
                ))}
              </div>

              {activeSession && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                  <div style={{ height: 24, width: 1, background: 'var(--gs-border)', display: 'none' }} className="sm:block" />
                  <div style={{ fontSize: 13, color: 'var(--gs-muted)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--gs-text)', marginBottom: 2 }}>
                      {formatDate(activeSession.date)}
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeSession.location || competition.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--gs-primary)', textDecoration: 'none', fontSize: 12, fontWeight: 500 }}
                    >
                      📍 Ver ubicación
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="gs-container" style={{ padding: '24px 16px' }}>
          {promotions.length === 0 ? (
            <p style={{ color: 'var(--gs-muted)', fontSize: 14 }}>No hay categorías para esta jornada.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {promotions.map((prom) => (
                <div key={prom.id} className="gs-card" style={{ padding: '16px 20px', position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <GenderBadge gender={prom.gender} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gs-text)', marginBottom: 4, paddingRight: 80 }}>
                      {prom.name}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--gs-muted)' }}>
                      {prom.gymnast_count} gimnastas inscritos
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                    <Link
                      href={`/competiciones/${slug}/${prom.id}`}
                      className={prom.status === 'active' ? 'gs-btn-primary' : 'gs-btn-secondary'}
                      style={{ fontSize: 13, width: '100%', justifyContent: 'center' }}
                    >
                      {prom.status === 'active' ? 'Ver notas en directo' : prom.status === 'finished' ? 'Ver resultados finales' : 'Ver clasificación'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
