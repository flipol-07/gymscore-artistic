'use client'

import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { FEMALE_APPARATUS, MALE_APPARATUS, type GymnastHistory, type Apparatus, type RankingEntry } from '@/features/competitions/types'
import { ApparatusIcon } from '@/features/competitions/components/apparatus-icon'
import { ResultCard } from '@/features/competitions/components/result-card'
import * as service from '@/features/competitions/services/competition-service'
import { Share2 } from 'lucide-react'
import { useState, useEffect } from 'react'

function historyToRankingEntry(item: GymnastHistory, gymnastName: string): RankingEntry {
  return {
    position: 0,
    inscriptionId: `${item.categoryId}-${gymnastName}`,
    gymnastName,
    clubName: item.clubName,
    vaultScore: item.vaultScore,
    barsScore: item.barsScore,
    beamScore: item.beamScore,
    floorScore: item.floorScore,
    pommelScore: item.pommelScore,
    ringsScore: item.ringsScore,
    p_barsScore: item.p_barsScore,
    h_barScore: item.h_barScore,
    totalScore: item.totalScore,
    competitionSlug: item.competitionSlug,
    categoryId: item.categoryId,
    vaultDScore: 0, vaultEScore: 0,
    barsDScore: 0, barsEScore: 0,
    beamDScore: 0, beamEScore: 0,
    floorDScore: 0, floorEScore: 0,
    pommelDScore: 0, pommelEScore: 0,
    ringsDScore: 0, ringsEScore: 0,
    p_barsDScore: 0, p_barsEScore: 0,
    h_barDScore: 0, h_barEScore: 0,
  }
}

export default function GymnastProfilePage() {
  const params = useParams()
  const router = useRouter()
  const name = decodeURIComponent(params.name as string)
  const [history, setHistory] = useState<GymnastHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [diplomaCard, setDiplomaCard] = useState<{ entry: RankingEntry; gender: 'female' | 'male' } | null>(null)
  const [loadingDiploma, setLoadingDiploma] = useState<string | null>(null)

  /**
   * Carga los rankings reales de la categoría, encuentra la entrada del gimnasta
   * (con position calculada) y abre el ResultCard con datos completos.
   */
  const openDiploma = async (item: GymnastHistory) => {
    setLoadingDiploma(item.categoryId)
    try {
      const rankings = await service.getRankings(item.categoryId)
      const found = rankings.find(r => r.gymnastName === name)
      if (found) {
        setDiplomaCard({ entry: found, gender: item.gender })
      } else {
        // Fallback: usar el dato del historial si no se encuentra
        setDiplomaCard({ entry: historyToRankingEntry(item, name), gender: item.gender })
      }
    } catch (err) {
      console.error('Error loading diploma rankings:', err)
      setDiplomaCard({ entry: historyToRankingEntry(item, name), gender: item.gender })
    } finally {
      setLoadingDiploma(null)
    }
  }

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
            <h1 style={{ fontSize: 'clamp(24px, 7vw, 36px)', fontWeight: 900, color: '#111', marginBottom: 24, letterSpacing: '-0.03em', lineHeight: 1.1, wordBreak: 'break-word' }}>
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
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, margin: '0 auto' }}>
                {history.map((item, idx) => {
                  const apparatusList = item.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS
                  const getScoreByApp = (app: Apparatus): number => {
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
                  const goToCompetition = () => router.push(`/competiciones/${item.competitionSlug}/${item.categoryId}?focus=${encodeURIComponent(name)}`)
                  const dateStr = new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

                  return (
                    <div
                      key={`${item.categoryId}-${idx}`}
                      onClick={goToCompetition}
                      className="gs-card history-card"
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
                    >
                      {/* Header: Evento + Total */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 800, color: 'var(--gs-text)', fontSize: 15, lineHeight: 1.25, marginBottom: 4 }}>
                            {item.competitionName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--gs-muted)', fontWeight: 500, lineHeight: 1.3 }}>
                            {item.categoryName} <span style={{ opacity: 0.4, margin: '0 4px' }}>·</span> {item.clubName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gs-muted)', fontWeight: 500, marginTop: 3 }}>
                            {dateStr}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 9, color: 'var(--gs-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Total</div>
                          <div style={{ fontWeight: 900, fontSize: 24, color: 'var(--gs-text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>
                            {item.totalScore.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Pills de aparatos */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {apparatusList.map(app => {
                          const score = getScoreByApp(app)
                          if (score <= 0) return null
                          return (
                            <div key={app} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--gs-bg)', padding: '5px 10px', borderRadius: 8, border: '1px solid var(--gs-border)' }}>
                              <ApparatusIcon apparatus={app} size={13} tintColor="#475569" />
                              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gs-text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                                {score.toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Botón Diploma full width */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openDiploma(item) }}
                        disabled={loadingDiploma === item.categoryId}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          background: 'var(--gs-primary)', color: '#fff',
                          border: 'none', borderRadius: 8, padding: '10px 12px',
                          fontSize: 13, fontWeight: 700,
                          cursor: loadingDiploma === item.categoryId ? 'wait' : 'pointer',
                          letterSpacing: '-0.01em',
                          width: '100%',
                          opacity: loadingDiploma === item.categoryId ? 0.6 : 1,
                          transition: 'transform 0.15s, opacity 0.15s',
                        }}
                      >
                        <Share2 size={14} />
                        <span>{loadingDiploma === item.categoryId ? 'Cargando…' : 'Obtener Diploma'}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {diplomaCard && (
        <ResultCard
          entry={diplomaCard.entry}
          gender={diplomaCard.gender}
          onClose={() => setDiplomaCard(null)}
        />
      )}
    </div>
  )
}
