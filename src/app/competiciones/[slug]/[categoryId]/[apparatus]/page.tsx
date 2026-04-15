'use client'

import { useEffect, useState, use } from 'react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import { APPARATUS_NAMES, APPARATUS_ICONS, type Apparatus } from '@/features/competitions/types'
import { useFavorites } from '@/shared/hooks/use-favorites'
import type { RankingEntry, Competition, Promotion } from '@/features/competitions/types'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; categoryId: string; apparatus: string }>
}

function MedalBadge({ pos }: { pos: number }) {
  if (pos === 1) return <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '50%', color: '#D97706', fontWeight: 800, fontSize: 13 }}>1</span>
  if (pos === 2) return <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '50%', color: '#64748B', fontWeight: 800, fontSize: 13 }}>2</span>
  if (pos === 3) return <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '50%', color: '#B91C1C', fontWeight: 800, fontSize: 13 }}>3</span>
  return <span style={{ width: 24, textAlign: 'center', fontWeight: 600, fontSize: 14, color: '#94A3B8' }}>{pos}</span>
}

export default function AparatoPage({ params: paramsPromise }: Props) {
  const params = use(paramsPromise)
  const { slug, categoryId, apparatus } = params
  
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [rankings, setRankings] = useState<(RankingEntry & { appScore: number })[]>([])
  const [loading, setLoading] = useState(true)

  const apparatusKey = apparatus as Apparatus
  const apparatusName = APPARATUS_NAMES[apparatusKey]

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    async function load() {
      const comp = await service.getCompetitionBySlug(slug)
      if (comp) setCompetition(comp)
      
      const prom = await service.getPromotionById(categoryId)
      if (prom) {
        setPromotion(prom)
        const allRanks = await service.getRankings(prom.id)
        
        const apparatusRanks = allRanks.map(entry => {
          let score = 0
          if (apparatusKey === 'vault') score = entry.vaultScore
          else if (apparatusKey === 'bars') score = entry.barsScore
          else if (apparatusKey === 'beam') score = entry.beamScore
          else if (apparatusKey === 'floor') score = entry.floorScore
          
          return { ...entry, appScore: score }
        }).sort((a, b) => b.appScore - a.appScore)
        
        const ranked = apparatusRanks.map((e, idx) => ({ ...e, position: idx + 1 }))
        setRankings(ranked)
      }
      setLoading(false)
    }
    load()
  }, [slug, categoryId, apparatusKey, refreshTrigger])

  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel('realtime_scores_app')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores' },
        () => {
          setRefreshTrigger(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 'bold' }}>Cargando resultados de {apparatusName}...</div>
  if (!promotion || !apparatusName) return <div style={{ padding: 40, textAlign: 'center' }}>Error cargando los datos.</div>

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar programUrl={competition?.programUrl} showBack backHref={`/competiciones/${slug}/${categoryId}`} />

      <main style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ background: '#fff', padding: '32px 0 24px', borderBottom: '1px solid var(--gs-border)' }}>
          <div className="gs-container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              COMPETICIÓN
            </h2>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 20, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {competition?.name || 'Cargando...'}
            </h1>
          </div>
        </div>

        {/* Apparatus Detail */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '20px 0' }}>
          <div className="gs-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={APPARATUS_ICONS[apparatusKey]}
                  alt={apparatusName}
                  style={{ height: 40, width: 'auto' }}
                />
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gs-text)', marginBottom: 2 }}>
                    {apparatusName}
                  </h3>
                  <div style={{ fontSize: 14, color: 'var(--gs-muted)', fontWeight: 500 }}>
                    {promotion.name}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>
                  FECHA
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gs-text)' }}>
                  {competition?.date ? new Date(competition.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scores Table */}
        <div className="gs-container" style={{ padding: '32px 16px' }}>
          <div className="gs-card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gs-border)', background: 'var(--gs-bg)' }}>
                    <th style={{ padding: '16px', textAlign: 'center', width: 40 }}>#</th>
                    <th style={{ padding: '16px', textAlign: 'left' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Gimnasta / Club</span>
                    </th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Nota</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((entry) => {
                    const isFav = isFavorite(entry.gymnastName)
                    return (
                      <tr key={entry.inscriptionId} style={{ borderBottom: '1px solid var(--gs-border)' }}>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <MedalBadge pos={entry.position} />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button 
                              onClick={() => toggleFavorite(entry.gymnastName)}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isFav ? '#FFD700' : '#E2E8F0' }}
                            >
                              <Star size={20} fill={isFav ? 'currentColor' : 'none'} />
                            </button>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--gs-text)', fontSize: 15 }}>{entry.gymnastName}</div>
                              <div style={{ fontSize: 12, color: 'var(--gs-muted)', fontWeight: 500 }}>{entry.clubName}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                           <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--gs-text)' }}>
                            {entry.appScore.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
