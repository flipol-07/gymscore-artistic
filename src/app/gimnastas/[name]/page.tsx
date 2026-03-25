'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getGymnastHistory } from '@/features/competitions/data/demo-data'

export default function GymnastProfilePage() {
  const params = useParams()
  const name = decodeURIComponent(params.name as string)
  const history = getGymnastHistory(name)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '28px 0' }}>
          <div className="gs-container">
            <div style={{ fontSize: 13, color: 'var(--gs-muted)', marginBottom: 8 }}>
              <Link href="/" style={{ color: 'var(--gs-primary)' }}>Inicio</Link>
              {' → Gimnasta'}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gs-text)', marginBottom: 4 }}>
              {name}
            </h1>
            {history.length > 0 && (
              <div style={{ fontSize: 14, color: 'var(--gs-muted)' }}>
                {history[0].clubName} · {history.length} competición{history.length !== 1 ? 'es' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="gs-container" style={{ padding: '24px 16px' }}>
          {history.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--gs-muted)', fontSize: 14, marginBottom: 16 }}>
                No se encontró historial para este gimnasta.
              </p>
              <Link href="/" className="gs-btn-secondary">Volver al inicio</Link>
            </div>
          ) : (
            <div className="gs-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="gs-table" style={{ minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th>Competición</th>
                      <th>Fecha</th>
                      <th>Categoría</th>
                      <th>Club</th>
                      <th style={{ textAlign: 'center' }}>Sal</th>
                      <th style={{ textAlign: 'center' }}>Par</th>
                      <th style={{ textAlign: 'center' }}>Bar</th>
                      <th style={{ textAlign: 'center' }}>Sue</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={`${item.categoryId}-${idx}`}>
                        <td style={{ fontWeight: 500, fontSize: 14 }}>{item.competitionName}</td>
                        <td style={{ color: 'var(--gs-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                          {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ fontSize: 13 }}>{item.categoryName}</td>
                        <td style={{ fontSize: 13, color: 'var(--gs-muted)' }}>{item.clubName}</td>
                        <td style={{ textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{item.vaultScore.toFixed(3)}</td>
                        <td style={{ textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{item.barsScore.toFixed(3)}</td>
                        <td style={{ textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{item.beamScore.toFixed(3)}</td>
                        <td style={{ textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{item.floorScore.toFixed(3)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
                          {item.totalScore.toFixed(3)}
                        </td>
                        <td>
                          <Link
                            href={`/competiciones/${item.competitionSlug}/${item.categoryId}`}
                            style={{ fontSize: 13, color: 'var(--gs-primary)' }}
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
