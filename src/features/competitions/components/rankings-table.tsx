'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Trophy, Star, Share2, X, ChevronRight } from 'lucide-react'
import { APPARATUS_NAMES, FEMALE_APPARATUS, MALE_APPARATUS } from '../types'
import type { RankingEntry, Apparatus } from '../types'
import { useFavorites } from '@/shared/hooks/use-favorites'
import { ResultCard } from './result-card'
import { ApparatusIcon } from './apparatus-icon'

interface RankingsTableProps {
  entries: RankingEntry[]
  gender: 'female' | 'male'
}

const APPARATUS_COLORS: Record<Apparatus, string> = {
  vault:  '#6366F1',
  bars:   '#EC4899',
  beam:   '#F59E0B',
  floor:  '#10B981',
  pommel: '#3B82F6',
  rings:  '#EF4444',
  p_bars: '#8B5CF6',
  h_bar:  '#14B8A6',
}

const APPARATUS_BGS: Record<Apparatus, string> = {
  vault: 'https://images.unsplash.com/photo-1590725350314-e590059f0b18?q=80&w=800&auto=format&fit=crop',
  bars: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop',
  beam: 'https://images.unsplash.com/photo-1629168434771-4ce8b0007fe9?q=80&w=800&auto=format&fit=crop',
  floor: 'https://images.unsplash.com/photo-1518610196726-25e8bc1dc6ee?q=80&w=800&auto=format&fit=crop',
  pommel: 'https://images.unsplash.com/photo-1590725350285-d8cfcc54cecd?q=80&w=800&auto=format&fit=crop',
  rings: 'https://images.unsplash.com/photo-1610478052136-15ec41b31a1a?q=80&w=800&auto=format&fit=crop',
  p_bars: 'https://images.unsplash.com/photo-1541252876612-e8c187be7aa6?q=80&w=800&auto=format&fit=crop',
  h_bar: 'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?q=80&w=800&auto=format&fit=crop',
}

export function RankingsTable({ entries, gender }: RankingsTableProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [showCard, setShowCard] = useState<RankingEntry | null>(null)
  const [focusApparatus, setFocusApparatus] = useState<Apparatus | null>(null)

  const baseApparatus: Apparatus[] = gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS
  const visibleApparatus = focusApparatus ? [focusApparatus] : baseApparatus

  const displayEntries = useMemo(() => {
    if (!focusApparatus) return entries
    
    const scoreKey = `${focusApparatus}Score` as keyof RankingEntry
    return [...entries]
      .filter(e => (e[scoreKey] as number) > 0)
      .sort((a, b) => (b[scoreKey] as number) - (a[scoreKey] as number))
      .map((entry, index) => ({
        ...entry,
        position: index + 1
      }))
  }, [entries, focusApparatus])

  if (entries.length === 0) {
    return (
      <div style={{ padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🏅</div>
        <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--gs-text)', marginBottom: 6 }}>Sin resultados todavía</div>
        <div style={{ fontSize: 14, color: 'var(--gs-muted)' }}>Las notas aparecerán aquí en cuanto se registren.</div>
      </div>
    )
  }

  return (
    <>
      {/* Apparatus chips — tap to see focused ranking */}
      <div style={{
        padding: '16px 16px 12px',
        display: 'flex', gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        <button
          onClick={() => setFocusApparatus(null)}
          style={{
            flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '10px 14px', borderRadius: 14,
            background: focusApparatus === null ? '#111' : '#f1f5f9',
            border: `1.5px solid ${focusApparatus === null ? '#000' : '#e2e8f0'}`,
            cursor: 'pointer', color: focusApparatus === null ? '#fff' : '#64748b',
            transition: 'all 0.15s', minWidth: 68,
            boxShadow: focusApparatus === null ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Todas</span>
        </button>
        {baseApparatus.map(app => {
          const isFocused = focusApparatus === app
          return (
          <button
            key={app}
            onClick={() => setFocusApparatus(isFocused ? null : app)}
            style={{
              flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '10px 14px', borderRadius: 14,
              background: isFocused ? APPARATUS_COLORS[app] : APPARATUS_COLORS[app] + '12',
              border: `1.5px solid ${isFocused ? APPARATUS_COLORS[app] : APPARATUS_COLORS[app] + '30'}`,
              cursor: 'pointer', color: isFocused ? '#fff' : APPARATUS_COLORS[app],
              transition: 'all 0.15s', minWidth: 68,
              boxShadow: isFocused ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              transform: isFocused ? 'translateY(-2px)' : 'none',
            }}
          >
            <ApparatusIcon apparatus={app} size={22} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
              {APPARATUS_NAMES[app]}
            </span>
          </button>
        )})}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr style={{ background: 'var(--gs-bg)', borderBottom: '2px solid var(--gs-border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'center', width: 44 }}></th>
              <th style={{ padding: '12px 16px', textAlign: 'left', minWidth: 160 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Gimnasta
                </span>
              </th>
              {visibleApparatus.map(app => (
                <th
                  key={app}
                  onClick={() => setFocusApparatus(focusApparatus === app ? null : app)}
                  style={{ padding: '10px 12px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                  title={`Ver ranking de ${APPARATUS_NAMES[app]}`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ color: APPARATUS_COLORS[app] }}>
                      <ApparatusIcon apparatus={app} size={20} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {APPARATUS_NAMES[app].slice(0, 3)}
                    </span>
                  </div>
                </th>
              ))}
              {!focusApparatus && (
                <th style={{ padding: '12px 16px', textAlign: 'right', paddingRight: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                </th>
              )}
              <th style={{ padding: '12px 16px', width: 46 }}></th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((entry) => {
              const isFav = isFavorite(entry.inscriptionId)
              return (
                <tr
                  key={entry.inscriptionId}
                  style={{ borderBottom: '1px solid var(--gs-border)' }}
                  className="ranking-row"
                >
                  {/* Position */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {entry.position <= 3 ? (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: entry.position === 1 ? '#FFD700' : entry.position === 2 ? '#C0C0C0' : '#CD7F32',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                      }}>
                        <Trophy size={13} color="#fff" />
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>{entry.position}</span>
                    )}
                  </td>

                  {/* Gymnast + club */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <button
                        onClick={() => toggleFavorite(entry.inscriptionId)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isFav ? '#FFD700' : '#E2E8F0', flexShrink: 0 }}
                      >
                        <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <div>
                        <Link
                          href={`/gimnastas/${encodeURIComponent(entry.gymnastName)}`}
                          style={{ fontWeight: 800, color: 'var(--gs-text)', fontSize: 14, letterSpacing: '-0.01em', lineHeight: 1.2 }}
                          className="gymnast-link"
                        >
                          {entry.gymnastName}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          {entry.clubFlag && <img src={entry.clubFlag} alt="" style={{ height: 11, borderRadius: 2 }} />}
                          <span style={{ fontSize: 11, color: 'var(--gs-muted)', fontWeight: 500 }}>{entry.clubName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Apparatus scores */}
                  {visibleApparatus.map(app => {
                    const score = entry[`${app}Score` as keyof RankingEntry] as number
                    return (
                      <td key={app} style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 14, fontWeight: 700,
                          color: score > 0 ? APPARATUS_COLORS[app] : '#CBD5E1',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {score > 0 ? score.toFixed(2) : '—'}
                        </span>
                      </td>
                    )
                  })}

                  {/* Total */}
                  {!focusApparatus && (
                    <td style={{ padding: '14px 16px', textAlign: 'right', paddingRight: 20 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--gs-text)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                        {entry.totalScore.toFixed(2)}
                      </span>
                    </td>
                  )}

                  {/* Share */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => setShowCard(entry)}
                      style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: 'var(--gs-primary)', borderRadius: 8 }}
                      title="Diploma"
                    >
                      <Share2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showCard && (
        <ResultCard
          entry={showCard}
          gender={gender}
          onClose={() => setShowCard(null)}
        />
      )}
    </>
  )
}
