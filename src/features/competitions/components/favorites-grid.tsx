'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFavorites } from '@/shared/hooks/use-favorites'
import * as service from '@/features/competitions/services/competition-service'
import type { RankingEntry } from '@/features/competitions/types'

export function FavoritesGrid() {
  const { favorites, toggleFavorite } = useFavorites()
  const [gymnasts, setGymnasts] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (favorites.length > 0) {
      setLoading(true)
      service.getInscriptionsByIds(favorites).then(data => {
        setGymnasts(data)
        setLoading(false)
      })
    } else {
      setGymnasts([])
    }
  }, [favorites])

  if (favorites.length === 0) return null

  return (
    <section style={{ padding: '60px 0', background: 'var(--gs-bg)' }}>
      <div className="gs-container">
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--gs-text)', marginBottom: 32, letterSpacing: '-0.04em' }}>
          MIS SEGUIMIENTOS ⭐
        </h2>

        {loading ? (
          <p style={{ color: 'var(--gs-muted)' }}>Cargando favoritos...</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: 20 
          }}>
            {gymnasts.map((g) => (
              <div key={g.inscriptionId} className="gs-card hover-lift" style={{ padding: 24, position: 'relative' }}>
                <button 
                  onClick={() => toggleFavorite(g.inscriptionId)}
                  style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
                >
                  ⭐
                </button>
                
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gs-text)', marginBottom: 4 }}>
                  {g.gymnastName}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--gs-muted)', fontWeight: 600, marginBottom: 16 }}>
                  {g.clubName}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  <div style={{ background: 'var(--gs-primary-light)', padding: '10px', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--gs-primary)' }}>{g.totalScore.toFixed(2)}</div>
                  </div>
                  {/* Link to detail */}
                  <Link 
                    href={`/competiciones/${g.competitionSlug}/${g.categoryId}`}
                    className="gs-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 12, fontWeight: 700 }}
                  >
                    Ver Ranking →
                  </Link>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['vault', 'bars', 'beam', 'floor'].map(app => {
                    const score = (g as any)[`${app}Score`]
                    if (score > 0) {
                      return (
                        <span key={app} style={{ fontSize: 10, fontWeight: 700, background: '#fff', border: '1px solid var(--gs-border)', padding: '2px 8px', borderRadius: 6, color: 'var(--gs-muted)' }}>
                          {app.toUpperCase().slice(0, 3)}: {score.toFixed(2)}
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
