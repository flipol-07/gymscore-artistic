'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { APPARATUS_NAMES, APPARATUS_ICONS, type RankingEntry, type Apparatus } from '@/features/competitions/types'

interface RankingsTableProps {
  rankings: RankingEntry[]
  apparatus: Apparatus[]
  slug: string
  categoryId: string
}

function getApparatusScore(entry: RankingEntry, app: Apparatus): number {
  switch (app) {
    case 'vault': return entry.vaultScore
    case 'bars': return entry.barsScore
    case 'beam': return entry.beamScore
    case 'floor': return entry.floorScore
    default: return 0
  }
}

function MedalBadge({ pos }: { pos: number }) {
  const colors: Record<number, string> = { 1: '#d4af37', 2: '#a0a0a0', 3: '#cd7f32' }
  if (pos === 1) return <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '50%', color: '#D97706', fontWeight: 800, fontSize: 13 }}>1</span>
  if (pos === 2) return <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '50%', color: '#64748B', fontWeight: 800, fontSize: 13 }}>2</span>
  if (pos === 3) return <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '50%', color: '#B91C1C', fontWeight: 800, fontSize: 13 }}>3</span>
  return <span style={{ width: 24, textAlign: 'center', fontWeight: 600, fontSize: 14, color: '#94A3B8' }}>{pos}</span>
}

export function RankingsTable({ rankings, apparatus, slug, categoryId }: RankingsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--gs-border)' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>#</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Gimnasta</th>
            <th className="hidden md:table-cell" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Club</th>
            {apparatus.map((app) => (
              <th key={app} className="hidden sm:table-cell" style={{ padding: '12px', textAlign: 'center' }}>
                <Link
                  href={`/competiciones/${slug}/${categoryId}/${app}`}
                  style={{ display: 'flex', justifyContent: 'center' }}
                  title={APPARATUS_NAMES[app]}
                >
                  <img
                    src={APPARATUS_ICONS[app]}
                    alt={APPARATUS_NAMES[app]}
                    style={{ height: 20, width: 'auto', opacity: 0.8 }}
                  />
                </Link>
              </th>
            ))}
            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((entry) => (
            <React.Fragment key={entry.inscriptionId}>
              <tr 
                onClick={() => toggleRow(entry.inscriptionId)}
                style={{ 
                  cursor: 'pointer',
                  borderBottom: expandedRow === entry.inscriptionId ? 'none' : '1px solid var(--gs-border)',
                  background: expandedRow === entry.inscriptionId ? 'rgba(76, 111, 217, 0.03)' : 'transparent',
                  transition: 'background 0.2s'
                }}
                className="gs-table-row"
              >
                <td style={{ padding: '14px 16px' }}><MedalBadge pos={entry.position} /></td>
                <td style={{ padding: '14px 16px' }}>
                  <Link 
                    href={`/gimnastas/${encodeURIComponent(entry.gymnastName)}`}
                    className="hover:underline"
                    style={{ fontWeight: 700, color: 'var(--gs-primary)', fontSize: 15, textDecoration: 'none' }}
                  >
                    {entry.gymnastName}
                  </Link>
                  <div className="md:hidden" style={{ fontSize: 12, color: 'var(--gs-muted)', marginTop: 2 }}>{entry.clubName}</div>
                </td>
                <td className="hidden md:table-cell" style={{ padding: '14px 16px', color: 'var(--gs-muted)', fontSize: 14 }}>
                  {entry.clubName}
                </td>
                {apparatus.map((app) => (
                  <td key={app} className="hidden sm:table-cell" style={{ padding: '14px 12px', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 500 }}>
                    {getApparatusScore(entry, app).toFixed(3)}
                  </td>
                ))}
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--gs-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {entry.totalScore.toFixed(3)}
                  </div>
                </td>
              </tr>
              {expandedRow === entry.inscriptionId && (
                <tr style={{ background: 'rgba(76, 111, 217, 0.03)', borderBottom: '1px solid var(--gs-border)' }}>
                  <td colSpan={3 + (apparatus.length)} style={{ padding: '0 16px 16px' }}>
                    <div style={{ 
                      background: '#fff', 
                      borderRadius: 12, 
                      padding: 16, 
                      border: '1px solid var(--gs-border)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                      gap: 12,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      {apparatus.map((app) => (
                        <Link 
                          key={app} 
                          href={`/competiciones/${slug}/${categoryId}/${app}`}
                          className="hover:bg-slate-50 transition-colors"
                          style={{ 
                            textAlign: 'center', 
                            padding: '8px', 
                            borderRadius: '8px', 
                            border: '1px solid transparent',
                            display: 'block',
                            color: 'inherit'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                            <img src={APPARATUS_ICONS[app]} alt={APPARATUS_NAMES[app]} style={{ height: 18, width: 'auto' }} />
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--gs-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 2 }}>
                            {APPARATUS_NAMES[app]}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gs-primary)' }}>
                            {getApparatusScore(entry, app).toFixed(3)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
