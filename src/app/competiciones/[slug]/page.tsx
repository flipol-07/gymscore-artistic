import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCompetition, getSessions, getPromotions } from '@/features/competitions/data/demo-data'
import type { Promotion } from '@/features/competitions/types'

interface Props {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function PromotionStatusBadge({ status }: { status: Promotion['status'] }) {
  if (status === 'active') return <span className="gs-badge gs-badge-live">● En directo</span>
  if (status === 'finished') return <span className="gs-badge gs-badge-finished">Finalizado</span>
  return <span className="gs-badge gs-badge-finished">Pendiente</span>
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params
  const competition = getCompetition(slug)
  if (!competition) notFound()

  const sessions = getSessions(slug)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Event header */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '28px 0' }}>
          <div className="gs-container">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--gs-muted)', marginBottom: 6 }}>
                  <Link href="/" style={{ color: 'var(--gs-primary)' }}>Inicio</Link>
                  {' → '}
                  {competition.name}
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gs-text)', marginBottom: 6 }}>
                  {competition.name}
                </h1>
                <div style={{ fontSize: 14, color: 'var(--gs-muted)' }}>
                  {competition.location} · {formatDate(competition.date)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                {competition.status === 'active' && (
                  <span className="gs-badge gs-badge-live">● En directo</span>
                )}
                {competition.programUrl && (
                  <Link href={competition.programUrl} className="gs-btn-secondary" style={{ fontSize: 13 }}>
                    Programa
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sessions + Promotions */}
        <div className="gs-container" style={{ padding: '24px 16px' }}>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--gs-muted)', fontSize: 14 }}>No hay jornadas disponibles.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {sessions.map((session) => {
                const promotions = getPromotions(session.id)
                return (
                  <div key={session.id}>
                    {/* Session header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gs-text)' }}>
                        {session.name}
                      </h2>
                      <span style={{ fontSize: 13, color: 'var(--gs-muted)' }}>
                        · {formatDate(session.date)}
                      </span>
                    </div>

                    {/* Promotions table-style list */}
                    <div className="gs-card" style={{ overflow: 'hidden' }}>
                      {promotions.length === 0 ? (
                        <p style={{ padding: '16px', fontSize: 14, color: 'var(--gs-muted)' }}>Sin categorías.</p>
                      ) : (
                        promotions.map((prom, i) => (
                          <div
                            key={prom.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 16px',
                              borderBottom: i < promotions.length - 1 ? '1px solid var(--gs-border)' : 'none',
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--gs-text)' }}>
                                {prom.name}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                              <span style={{ fontSize: 13, color: 'var(--gs-muted)', whiteSpace: 'nowrap' }}>
                                {prom.gymnast_count} gimnastas
                              </span>
                              <PromotionStatusBadge status={prom.status} />
                              {prom.status !== 'pending' ? (
                                <Link
                                  href={`/competiciones/${slug}/${prom.categoryId}`}
                                  className="gs-btn-primary"
                                  style={{ fontSize: 13, padding: '6px 12px' }}
                                >
                                  {prom.status === 'active' ? 'Ver notas →' : 'Ver resultados →'}
                                </Link>
                              ) : (
                                <span style={{ fontSize: 13, color: 'var(--gs-muted)', padding: '6px 12px' }}>
                                  Pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
