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

      <div className="ranking-table-container">
        <table className="ranking-table ranking-table-main">
          <colgroup>
            <col className="ranking-col-pos" />
            <col className="ranking-col-gymnast" />
            {visibleApparatus.map(app => (
              <col key={`col-${app}`} className="ranking-col-apparatus" />
            ))}
            {!focusApparatus && <col className="ranking-col-total" />}
            <col className="ranking-col-share" />
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--gs-bg)', borderBottom: '2px solid var(--gs-border)' }}>
              <th style={{ padding: '8px 0', textAlign: 'center' }}></th>
              <th style={{ padding: '8px 4px', textAlign: 'left' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Gim.
                </span>
              </th>
              {visibleApparatus.map(app => (
                <th
                  key={app}
                  onClick={() => setFocusApparatus(focusApparatus === app ? null : app)}
                  style={{ padding: '6px 2px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                  title={`Ver ranking de ${APPARATUS_NAMES[app]}`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <div style={{ color: APPARATUS_COLORS[app] }}>
                      <ApparatusIcon apparatus={app} size={16} />
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                      {APPARATUS_NAMES[app].slice(0, 3)}
                    </span>
                  </div>
                </th>
              ))}
              {!focusApparatus && (
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Tot.</span>
                </th>
              )}
              <th style={{ padding: '8px 0' }}></th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((entry) => {
              const isFav = isFavorite(entry.gymnastName)
              return (
                <tr
                  key={entry.inscriptionId}
                  style={{ borderBottom: '1px solid var(--gs-border)' }}
                  className="ranking-row"
                >
                  {/* Position */}
                  <td style={{ padding: '10px 0', textAlign: 'center' }}>
                    {entry.position <= 3 ? (
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: entry.position === 1 ? '#FFD700' : entry.position === 2 ? '#C0C0C0' : '#CD7F32',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <Trophy size={10} color="#fff" />
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>{entry.position}</span>
                    )}
                  </td>

                  {/* Gymnast + club */}
                  <td style={{ padding: '10px 4px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => toggleFavorite(entry.gymnastName)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isFav ? '#FFD700' : '#E2E8F0', flexShrink: 0 }}
                      >
                        <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <Link
                          href={`/gimnastas/${encodeURIComponent(entry.gymnastName)}`}
                          style={{ 
                            fontWeight: 800, 
                            color: 'var(--gs-text)', 
                            fontSize: 12, 
                            letterSpacing: '-0.02em', 
                            lineHeight: 1,
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          className="gymnast-link"
                        >
                          {entry.gymnastName}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                          {entry.clubFlag && <img src={entry.clubFlag} alt="" style={{ height: 9, borderRadius: 1 }} />}
                          <span style={{ 
                            fontSize: 9, 
                            color: 'var(--gs-muted)', 
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block'
                          }}>
                            {entry.clubName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Apparatus scores */}
                  {visibleApparatus.map(app => {
                    const score = entry[`${app}Score` as keyof RankingEntry] as number
                    return (
                      <td key={app} style={{ padding: '10px 2px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: score > 0 ? APPARATUS_COLORS[app] : '#CBD5E1',
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.03em'
                        }}>
                          {score > 0 ? score.toFixed(1) : '—'} 
                        </span>
                      </td>
                    )
                  })}

                  {/* Total */}
                  {!focusApparatus && (
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--gs-text)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                        {entry.totalScore.toFixed(1)}
                      </span>
                    </td>
                  )}

                  {/* Share */}
                  <td style={{ padding: '10px 0', textAlign: 'center' }}>
                    <button
                      onClick={() => setShowCard(entry)}
                      style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: 'var(--gs-primary)', borderRadius: 4 }}
                      title="Diploma"
                    >
                      <Share2 size={14} />
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
