'use client'

import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { FEMALE_APPARATUS, APPARATUS_NAMES, APPARATUS_ICONS, type GymnastHistory } from '@/features/competitions/types'
import * as service from '@/features/competitions/services/competition-service'
import { useState, useEffect } from 'react'

export default function GymnastProfilePage() {
  const params = useParams()
  const router = useRouter()
  const name = decodeURIComponent(params.name as string)
  const [history, setHistory] = useState<GymnastHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    service.getGymnastRealHistory(name).then(data => {
      setHistory(data)
      setLoading(false)
    })
  }, [name])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <div style={{ background: '#fff', padding: '40px 0 32px', borderBottom: '1px solid var(--gs-border)', textAlign: 'center' }}>
          <div className="gs-container">
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              GIMNASTA
            </h2>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111', marginBottom: 24, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {name}
            </h1>
            
            <button 
              onClick={() => router.back()}
              className="gs-btn-secondary"
              style={{ padding: '8px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14 }}
            >
              ← Atrás
            </button>
          </div>
        </div>

        <div className="gs-container" style={{ padding: '32px 16px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gs-text)', marginBottom: 20 }}>
            Historial de Competiciones
          </h3>

          {loading ? (
            <p style={{ color: 'var(--gs-muted)', textAlign: 'center', padding: '40px 0' }}>Cargando historial...</p>
          ) : history.length === 0 ? (
            <div className="gs-card" style={{ padding: '48px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--gs-muted)', fontSize: 15 }}>
                No se encontró historial para este gimnasta.
              </p>
            </div>
          ) : (
            <div className="gs-card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gs-border)', background: 'var(--gs-bg)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Competición</th>
                      <th className="hidden md:table-cell" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Club</th>
                      {FEMALE_APPARATUS.map(app => (
                        <th key={app} style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }} title={APPARATUS_NAMES[app]}>
                            <img
                              src={APPARATUS_ICONS[app]}
                              alt={APPARATUS_NAMES[app]}
                              style={{ height: 18, width: 'auto', opacity: 0.8 }}
                            />
                          </div>
                        </th>
                      ))}
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr 
                        key={`${item.categoryId}-${idx}`}
                        onClick={() => router.push(`/competiciones/${item.competitionSlug}/${item.categoryId}`)}
                        style={{ borderBottom: '1px solid var(--gs-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                        className="hover-bg"
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--gs-text)', fontSize: 15, marginBottom: 4 }}>{item.competitionName}</div>
                          <div style={{ fontSize: 12, color: 'var(--gs-muted)', fontWeight: 500 }}>
                            {item.categoryName} <span style={{ margin: '0 4px', opacity: 0.5 }}>·</span> {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="hidden md:table-cell" style={{ padding: '16px', color: 'var(--gs-muted)', fontSize: 14 }}>
                          {item.clubName}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{item.vaultScore > 0 ? item.vaultScore.toFixed(2) : '-'}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{item.barsScore > 0 ? item.barsScore.toFixed(2) : '-'}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{item.beamScore > 0 ? item.beamScore.toFixed(2) : '-'}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{item.floorScore > 0 ? item.floorScore.toFixed(2) : '-'}</td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--gs-text)' }}>
                            {item.totalScore.toFixed(2)}
                          </div>
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
