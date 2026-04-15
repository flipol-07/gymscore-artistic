'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useFavorites } from '@/shared/hooks/use-favorites'
import * as service from '@/features/competitions/services/competition-service'
import type { GymnastHistory } from '@/features/competitions/types'

interface FavoriteGymnast {
  name: string
  latestClub: string
  latestTotal: number
  competitionCount: number
}

export function FavoritesGrid() {
  const { favorites, toggleFavorite } = useFavorites()
  const [gymnasts, setGymnasts] = useState<FavoriteGymnast[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (favorites.length > 0) {
      setLoading(true)
      // Fetch history for each favorite gymnast name
      Promise.all(
        favorites.map(name =>
          service.getGymnastRealHistory(name).then(history => ({
            name,
            history
          }))
        )
      ).then(results => {
        const mapped: FavoriteGymnast[] = results
          .filter(r => r.history.length > 0)
          .map(r => {
            const latest = r.history[0] // Already sorted by date desc
            return {
              name: r.name,
              latestClub: latest.clubName,
              latestTotal: latest.totalScore,
              competitionCount: r.history.length
            }
          })
        setGymnasts(mapped)
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
              <div key={g.name} className="gs-card hover-lift" style={{ padding: 24, position: 'relative' }}>
                <button 
                  onClick={() => toggleFavorite(g.name)}
                  style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#FFD700' }}
                >
                  <Star size={20} fill="currentColor" />
                </button>
                
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gs-text)', marginBottom: 4 }}>
                  {g.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--gs-muted)', fontWeight: 600, marginBottom: 16 }}>
                  {g.latestClub}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ background: 'var(--gs-primary-light, #EEF2FF)', padding: '10px', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Última Nota</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--gs-primary)' }}>{g.latestTotal.toFixed(2)}</div>
                  </div>
                  <Link 
                    href={`/gimnastas/${encodeURIComponent(g.name)}`}
                    className="gs-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 12, fontWeight: 700 }}
                  >
                    Ver Perfil →
                  </Link>
                </div>

                <div style={{ fontSize: 11, color: 'var(--gs-muted)', fontWeight: 600 }}>
                  {g.competitionCount} {g.competitionCount === 1 ? 'competición' : 'competiciones'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
