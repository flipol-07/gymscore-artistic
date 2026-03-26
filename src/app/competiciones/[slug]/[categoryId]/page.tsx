'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import { FEMALE_APPARATUS, MALE_APPARATUS, type Apparatus } from '@/features/competitions/types'
import { RankingsTable } from '@/features/competitions/components/rankings-table'
import type { RankingEntry, Competition, Promotion } from '@/features/competitions/types'

interface Props {
  params: Promise<{ slug: string; categoryId: string }>
}

export default function ResultadosPage({ params: paramsPromise }: Props) {
  const params = use(paramsPromise)
  const { slug, categoryId } = params
  
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const comp = await service.getCompetitionBySlug(slug)
      if (comp) setCompetition(comp)
      
      const prom = await service.getPromotionById(categoryId)
      if (prom) {
        setPromotion(prom)
        const ranks = await service.getRankings(prom.id)
        setRankings(ranks)
      }
      setLoading(false)
    }
    load()
  }, [slug, categoryId])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 'bold' }}>Cargando resultados...</div>
  if (!promotion) return <div style={{ padding: 40, textAlign: 'center' }}>Categoría no encontrada.</div>

  const apparatus: Apparatus[] = promotion.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

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
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 20, letterSpacing: '-0.03em', lineHeight: 1 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
        <div className="gs-container" style={{ padding: '32px 16px' }}>
          <div className="gs-card" style={{ overflow: 'hidden', padding: 0 }}>
            <RankingsTable
              rankings={rankings}
              apparatus={apparatus}
              slug={slug}
              categoryId={categoryId}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
