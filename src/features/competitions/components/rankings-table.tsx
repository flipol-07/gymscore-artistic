'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Trophy, Star, Share2, ChevronDown } from 'lucide-react'
import { APPARATUS_NAMES, FEMALE_APPARATUS, MALE_APPARATUS } from '../types'
import type { RankingEntry, Apparatus } from '../types'
import { useFavorites } from '@/shared/hooks/use-favorites'
import { ResultCard } from './result-card'
import { ApparatusIcon } from './apparatus-icon'
import { ScoreBreakdown } from './score-breakdown-popover'

interface RankingsTableProps {
  entries: RankingEntry[]
  gender: 'female' | 'male'
  /** Si se pasa, resalta y hace scroll a la fila de ese gimnasta */
  focusGymnast?: string | null
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

export function RankingsTable({ entries, gender, focusGymnast }: RankingsTableProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [showCard, setShowCard] = useState<RankingEntry | null>(null)
  const [focusApparatus, setFocusApparatus] = useState<Apparatus | null>(null)
  const focusRowRef = useRef<HTMLTableRowElement>(null)

  const baseApparatus: Apparatus[] = gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

  // Scroll a la fila enfocada cuando llegan las entries
  useEffect(() => {
    if (!focusGymnast || entries.length === 0) return
    const timer = setTimeout(() => {
      focusRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
    return () => clearTimeout(timer)
  }, [focusGymnast, entries.length])

  const displayEntries = useMemo(() => {
    if (!focusApparatus) return entries
    const scoreKey = `${focusApparatus}Score` as keyof RankingEntry
    return [...entries]
      .filter(e => (e[scoreKey] as number) > 0)
      .sort((a, b) => (b[scoreKey] as number) - (a[scoreKey] as number))
      .map((entry, index) => ({ ...entry, position: index + 1 }))
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

  // Detectar si alguna entrada tiene desglose D/E para mostrar el aviso
  const hasAnyBreakdown = entries.some(e =>
    baseApparatus.some(app => {
      const d = (e[`${app}DScore` as keyof RankingEntry] as number) ?? 0
      const eVal = (e[`${app}EScore` as keyof RankingEntry] as number) ?? 0
      return d > 0 || eVal > 0
    })
  )

  return (
    <>
      {hasAnyBreakdown && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          fontSize: 11,
          color: 'var(--gs-muted)',
          background: 'var(--gs-bg)',
          borderBottom: '1px solid var(--gs-border)',
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'var(--gs-primary)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            flexShrink: 0,
          }}>i</span>
          <span>Pulsa una nota de cualquier aparato para ver el desglose <strong style={{ color: 'var(--gs-primary)' }}>D</strong> + <strong style={{ color: 'var(--gs-success)' }}>E</strong>{' '}+ <strong style={{ color: 'var(--gs-live)' }}>Pen</strong>.</span>
        </div>
      )}
      <div className="ranking-table-container">
        <table className="ranking-table ranking-table-main">
          <colgroup>
            <col className="ranking-col-pos" />
            <col className="ranking-col-gymnast" />
            {baseApparatus.map(app => (
              <col key={`col-${app}`} className="ranking-col-apparatus" />
            ))}
            <col className="ranking-col-total" />
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
              {baseApparatus.map(app => {
                const isFocused = focusApparatus === app
                const isAnyFocused = focusApparatus !== null
                // Default: cada icono con su color. Cuando uno está activo: el resto en gris.
                const color = isAnyFocused
                  ? (isFocused ? APPARATUS_COLORS[app] : '#CBD5E1')
                  : APPARATUS_COLORS[app]
                return (
                  <th
                    key={app}
                    onClick={() => setFocusApparatus(isFocused ? null : app)}
                    style={{ padding: '6px 2px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    title={`Ordenar por ${APPARATUS_NAMES[app]}`}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <ApparatusIcon apparatus={app} size={28} tintColor={color} />
                      {isFocused && (
                        <ChevronDown size={10} color={APPARATUS_COLORS[app]} strokeWidth={3} />
                      )}
                    </div>
                  </th>
                )
              })}
              <th className="col-total-hide" style={{ padding: '8px 4px', textAlign: 'right' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: focusApparatus ? '#CBD5E1' : 'var(--gs-muted)', textTransform: 'uppercase' }}>Tot.</span>
              </th>
              <th style={{ padding: '8px 0' }}></th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((entry) => {
              const isFav = isFavorite(entry.gymnastName)
              const isFocused = !!focusGymnast && entry.gymnastName === focusGymnast
              return (
                <tr
                  key={entry.inscriptionId}
                  ref={isFocused ? focusRowRef : undefined}
                  style={{
                    borderBottom: '1px solid var(--gs-border)',
                    background: isFocused ? 'rgba(76, 111, 217, 0.08)' : undefined,
                    boxShadow: isFocused ? 'inset 3px 0 0 var(--gs-primary)' : undefined,
                    transition: 'background 0.3s',
                  }}
                  className="ranking-row"
                >
                  {/* Position */}
                  <td style={{ padding: '8px 0', textAlign: 'center' }}>
                    {entry.position <= 3 ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: entry.position === 1 ? '#FFD700' : entry.position === 2 ? '#C0C0C0' : '#CD7F32',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <Trophy size={9} color="#fff" />
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>{entry.position}</span>
                    )}
                  </td>

                  {/* Gymnast + club + total (mobile inline) */}
                  <td style={{ padding: '8px 2px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <button
                        onClick={() => toggleFavorite(entry.gymnastName)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isFav ? '#FFD700' : '#E2E8F0', flexShrink: 0 }}
                      >
                        <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <Link
                          href={`/gimnastas/${encodeURIComponent(entry.gymnastName)}`}
                          style={{
                            fontWeight: 800,
                            color: 'var(--gs-text)',
                            fontSize: 11,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          className="gymnast-link"
                        >
                          {entry.gymnastName}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {entry.clubFlag && <img src={entry.clubFlag} alt="" style={{ height: 8, borderRadius: 1 }} />}
                            <span style={{
                              fontSize: 8,
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
                          {/* Total score inline on mobile */}
                          <span className="total-inline-mobile" style={{
                            fontSize: 9,
                            fontWeight: 900,
                            color: focusApparatus ? '#CBD5E1' : '#334155',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                            flexShrink: 0,
                          }}>
                            {entry.totalScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Apparatus scores — all columns always visible */}
                  {baseApparatus.map(app => {
                    const isFocused = focusApparatus === app
                    const isAnyFocused = focusApparatus !== null
                    const score = entry[`${app}Score` as keyof RankingEntry] as number
                    const dScore = entry[`${app}DScore` as keyof RankingEntry] as number ?? 0
                    const eScore = entry[`${app}EScore` as keyof RankingEntry] as number ?? 0
                    const activeColor = APPARATUS_COLORS[app]
                    const dimmed = isAnyFocused && !isFocused
                    // Penalización = total - D - E (solo si hay D o E registrados)
                    const hasBreakdown = dScore > 0 || eScore > 0
                    const penalty = hasBreakdown
                      ? Math.round((score - dScore - eScore) * 1000) / 1000
                      : 0
                    const showPenalty = penalty < -0.001
                    return (
                      <td key={app} style={{ padding: '10px 2px', textAlign: 'center' }}>
                        <ScoreBreakdown
                          dScore={dScore}
                          eScore={eScore}
                          totalScore={score}
                          color={activeColor}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
                            <span className="score-cell" style={{
                              fontSize: isFocused ? 13 : 12,
                              fontWeight: isFocused ? 900 : 700,
                              color: dimmed ? '#CBD5E1' : (score > 0 ? activeColor : '#CBD5E1'),
                              fontVariantNumeric: 'tabular-nums',
                              letterSpacing: '-0.03em',
                              transition: 'color 0.15s',
                            }}>
                              {score > 0 ? score.toFixed(3) : '—'}
                            </span>
                            {showPenalty && (
                              <span style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: dimmed ? '#CBD5E1' : '#EF4444',
                                fontVariantNumeric: 'tabular-nums',
                                letterSpacing: '-0.02em',
                                marginTop: 1,
                              }} title="Penalización">
                                {penalty.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </ScoreBreakdown>
                      </td>
                    )
                  })}

                  {/* Total — hidden on mobile (shown inline in gymnast cell) */}
                  <td className="col-total-hide" style={{ padding: '10px 4px', textAlign: 'right' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 900,
                      color: focusApparatus ? '#CBD5E1' : 'var(--gs-text)',
                      letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
                      transition: 'color 0.15s',
                    }}>
                      {entry.totalScore.toFixed(1)}
                    </span>
                  </td>

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
