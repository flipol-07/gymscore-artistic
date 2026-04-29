'use client'

import { useEffect, useState, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import { RankingsTable } from '@/features/competitions/components/rankings-table'
import type { RankingEntry, Competition, Promotion } from '@/features/competitions/types'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

interface Props {
  params: Promise<{ slug: string; categoryId: string }>
}

export default function ResultadosPage({ params: paramsPromise }: Props) {
  const params = use(paramsPromise)
  const { slug, categoryId } = params
  const searchParams = useSearchParams()
  const focusGymnast = searchParams.get('focus') ? decodeURIComponent(searchParams.get('focus')!) : null

  const [competition, setCompetition] = useState<Competition | null>(null)
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    async function load() {
      console.log('Loading results for:', slug, categoryId)
      const comp = await service.getCompetitionBySlug(slug)
      console.log('Competition loaded:', comp?.name)
      if (comp) setCompetition(comp)
      
      const prom = await service.getPromotionById(categoryId)
      console.log('Promotion loaded:', prom?.name)
      if (prom) {
        setPromotion(prom)
        const ranks = await service.getRankings(prom.id)
        console.log('Rankings loaded:', ranks.length)
        setRankings(ranks)
      }
      setLoading(false)
      console.log('Loading finished')
    }
    load().catch(err => console.error('Load error:', err))
  }, [slug, categoryId, refreshTrigger])

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel('realtime_scores_global')
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 'bold' }}>Cargando resultados...</div>
  if (!promotion) return <div style={{ padding: 40, textAlign: 'center' }}>Categoría no encontrada.</div>

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar programUrl={competition?.programUrl} showBack backHref={`/competiciones/${slug}`} />

      <main style={{ flex: 1 }}>
        {/* Event Header */}
        <div style={{ background: '#fff', padding: '32px 0 24px', borderBottom: '1px solid var(--gs-border)' }}>
          <div className="gs-container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              COMPETICIÓN
            </h2>
            <h1 style={{ fontSize: 'clamp(20px, 6vw, 32px)', fontWeight: 900, color: '#111', marginBottom: 20, letterSpacing: '-0.03em', lineHeight: 1.1, wordBreak: 'break-word' }}>
              {competition?.name || 'Cargando...'}
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {competition?.programUrl && (
                <a 
                  href={competition.programUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gs-btn-secondary"
                  style={{ padding: '8px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                >
                  Programa
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '20px 0' }}>
          <div className="gs-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gs-text)', marginBottom: 2 }}>
                    {promotion.name}
                  </h3>
                  <div style={{ fontSize: 14, color: 'var(--gs-muted)', fontWeight: 500 }}>
                    {promotion.gender === 'female' ? 'Femenino' : 'Masculino'}
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

        {/* Rankings table */}
        <div className="gs-container ranking-page-container">
          <div className="gs-card ranking-page-card" style={{ overflow: 'hidden', padding: 0, borderRadius: 12 }}>
            <RankingsTable entries={rankings} gender={promotion.gender} focusGymnast={focusGymnast} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
