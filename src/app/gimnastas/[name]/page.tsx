'use client'

import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { FEMALE_APPARATUS, MALE_APPARATUS, APPARATUS_NAMES, APPARATUS_ICONS, type GymnastHistory, type Apparatus } from '@/features/competitions/types'
import { ApparatusIcon } from '@/features/competitions/components/apparatus-icon'
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
            <div className="ranking-table-container">
              <table className="ranking-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gs-border)', background: 'var(--gs-bg)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Evento</th>
                    <th className="hidden md:table-cell" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Club</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Notas</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => {
                    const apparatusList = item.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS
                    
                    const getScoreByApp = (app: Apparatus) => {
                      switch(app) {
                        case 'vault': return item.vaultScore
                        case 'bars': return item.barsScore
                        case 'beam': return item.beamScore
                        case 'floor': return item.floorScore
                        case 'pommel': return item.pommelScore
                        case 'rings': return item.ringsScore
                        case 'p_bars': return item.p_barsScore
                        case 'h_bar': return item.h_barScore
                        default: return 0
                      }
                    }

                    return (
                      <tr 
                        key={`${item.categoryId}-${idx}`}
                        onClick={() => router.push(`/competiciones/${item.competitionSlug}/${item.categoryId}`)}
                        style={{ borderBottom: '1px solid var(--gs-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                        className="ranking-row"
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--gs-text)', fontSize: 14, marginBottom: 2, lineHeight: 1.2 }}>{item.competitionName}</div>
                          <div style={{ fontSize: 11, color: 'var(--gs-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {item.categoryName} <span style={{ opacity: 0.5 }}>·</span> {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                          </div>
                        </td>
                        <td className="hidden md:table-cell" style={{ padding: '16px', color: 'var(--gs-muted)', fontSize: 13, fontWeight: 500 }}>
                          {item.clubName}
                        </td>
                        
                        {/* Aparatos dinámicos con Logos */}
                        <td style={{ padding: '8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 8px', maxWidth: 280, margin: '0 auto' }}>
                            {apparatusList.map(app => {
                              const score = getScoreByApp(app)
                              if (score <= 0) return null; // Only show scored apparatuses in profile to save space and focus
                              return (
                                <div key={app} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--gs-bg)', padding: '4px 8px', borderRadius: 8 }}>
                                  <div style={{ color: 'var(--gs-primary)' }}>
                                    <ApparatusIcon apparatus={app} size={14} />
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gs-text)', fontVariantNumeric: 'tabular-nums' }}>
                                    {score.toFixed(2)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </td>

                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--gs-text)', fontVariantNumeric: 'tabular-nums' }}>
                            {item.totalScore.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
