'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import {
  getCompetition,
  getSessions,
  getPromotions,
  getRankings,
} from '@/features/competitions/data/demo-data'
import { FEMALE_APPARATUS, MALE_APPARATUS, APPARATUS_NAMES, APPARATUS_ICONS, type Apparatus } from '@/features/competitions/types'
import type { RankingEntry } from '@/features/competitions/types'

function getScore(entry: RankingEntry, app: Apparatus): number {
  switch (app) {
    case 'vault': return entry.vaultScore
    case 'bars': return entry.barsScore
    case 'beam': return entry.beamScore
    case 'floor': return entry.floorScore
    default: return 0
  }
}

function computeTotal(entry: RankingEntry, apparatus: Apparatus[], overrides: Record<string, number>): number {
  return apparatus.reduce((sum, app) => sum + (overrides[app] ?? getScore(entry, app)), 0)
}

export default function AdminCompeticionPage() {
  const params = useParams()
  const slug = params.id as string
  const competition = getCompetition(slug)
  const sessions = competition ? getSessions(slug) : []

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id ?? '')
  const [activePromotionId, setActivePromotionId] = useState<string | null>(null)
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({})

  if (!competition) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--gs-muted)' }}>
        Competición no encontrada.{' '}
        <Link href="/admin" style={{ color: 'var(--gs-primary)' }}>Volver</Link>
      </div>
    )
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const promotions = activeSessionId ? getPromotions(activeSessionId) : []
  const activePromotion = promotions.find((p) => p.id === activePromotionId)
  const rankings = activePromotion ? getRankings(activePromotion.categoryId) : []
  const apparatus: Apparatus[] = activePromotion?.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      {/* Admin nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="gs-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ fontSize: 13, color: 'var(--gs-muted)' }}>← Volver</Link>
            <span style={{ color: 'var(--gs-border)' }}>|</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--gs-text)' }}>{competition.name}</span>
          </div>
          <Link href={`/competiciones/${slug}`} style={{ fontSize: 13, color: 'var(--gs-primary)' }}>
            Ver público →
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <div className="gs-container" style={{ padding: '20px 16px' }}>

          {/* Jornada tabs */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--gs-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Jornada
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSessionId(s.id); setActivePromotionId(null) }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: activeSessionId === s.id ? 'var(--gs-text)' : '#fff',
                    color: activeSessionId === s.id ? '#fff' : 'var(--gs-text)',
                    borderColor: activeSessionId === s.id ? 'var(--gs-text)' : 'var(--gs-border)',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Promotions selector */}
          {promotions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--gs-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Promoción
              </div>
              <div className="gs-card" style={{ overflow: 'hidden' }}>
                {promotions.map((prom, i) => (
                  <div
                    key={prom.id}
                    onClick={() => setActivePromotionId(prom.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: i < promotions.length - 1 ? '1px solid var(--gs-border)' : 'none',
                      cursor: 'pointer',
                      background: activePromotionId === prom.id ? '#f0f4ff' : '#fff',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: prom.status === 'active' ? '#ef4444' : prom.status === 'finished' ? '#22c55e' : '#ccc',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{prom.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--gs-muted)' }}>{prom.gymnast_count} gimnastas</span>
                      {prom.status === 'pending' && (
                        <button
                          className="gs-btn-primary"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={(e) => { e.stopPropagation(); setActivePromotionId(prom.id) }}
                        >
                          Comenzar
                        </button>
                      )}
                      {prom.status === 'active' && (
                        <span className="gs-badge gs-badge-live">● Activo</span>
                      )}
                      {prom.status === 'finished' && (
                        <span className="gs-badge gs-badge-finished">Finalizado</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score editor */}
          {activePromotion && rankings.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600 }}>
                  {activePromotion.name} — Puntuaciones
                </h2>
                <span style={{ fontSize: 12, color: 'var(--gs-muted)' }}>
                  Haz clic en una nota para editarla
                </span>
              </div>

              <div className="gs-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="gs-table" style={{ minWidth: 560 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Gimnasta</th>
                        <th>Club</th>
                        {apparatus.map((app) => (
                          <th key={app} style={{ textAlign: 'center', minWidth: 72 }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }} title={APPARATUS_NAMES[app]}>
                              <img
                                src={APPARATUS_ICONS[app]}
                                alt={APPARATUS_NAMES[app]}
                                style={{ height: 20, width: 'auto', opacity: 0.7 }}
                              />
                            </div>
                          </th>
                        ))}
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.map((entry) => {
                        const key = entry.inscriptionId
                        const entryOverrides = scores[key] ?? {}
                        const total = computeTotal(entry, apparatus, entryOverrides)

                        return (
                          <tr key={key}>
                            <td style={{ fontWeight: 600, color: 'var(--gs-muted)' }}>{entry.position}</td>
                            <td style={{ fontWeight: 500 }}>{entry.gymnastName}</td>
                            <td style={{ fontSize: 13, color: 'var(--gs-muted)' }}>{entry.clubName}</td>
                            {apparatus.map((app) => {
                              const scoreKey = `${key}-${app}`
                              const original = getScore(entry, app)
                              const current = entryOverrides[app] ?? original
                              const isEditing = editingScore === scoreKey

                              return (
                                <td key={app} style={{ textAlign: 'center', padding: '8px 6px' }}>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      step="0.05"
                                      min="0"
                                      max="20"
                                      defaultValue={current}
                                      autoFocus
                                      style={{
                                        width: 64,
                                        textAlign: 'center',
                                        fontSize: 13,
                                        padding: '4px 6px',
                                        border: '1px solid var(--gs-primary)',
                                        borderRadius: 4,
                                        outline: 'none',
                                        background: '#f0f4ff',
                                      }}
                                      onBlur={(e) => {
                                        const val = parseFloat(e.target.value)
                                        if (!isNaN(val)) {
                                          setScores((prev) => ({
                                            ...prev,
                                            [key]: { ...prev[key], [app]: val },
                                          }))
                                        }
                                        setEditingScore(null)
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                                        if (e.key === 'Escape') setEditingScore(null)
                                      }}
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingScore(scoreKey)}
                                      style={{
                                        width: 64,
                                        textAlign: 'center',
                                        fontSize: 13,
                                        padding: '4px 6px',
                                        border: '1px solid transparent',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        background: entryOverrides[app] !== undefined ? '#f0f4ff' : 'transparent',
                                        color: entryOverrides[app] !== undefined ? 'var(--gs-primary)' : 'var(--gs-text)',
                                        fontWeight: entryOverrides[app] !== undefined ? 600 : 400,
                                        fontVariantNumeric: 'tabular-nums',
                                      }}
                                    >
                                      {current.toFixed(3)}
                                    </button>
                                  )}
                                </td>
                              )
                            })}
                            <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums', paddingRight: 12 }}>
                              {total.toFixed(3)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="gs-btn-primary"
                  onClick={() => alert('Guardado (demo)')}
                >
                  Guardar cambios
                </button>
                <button
                  className="gs-btn-secondary"
                  onClick={() => setScores((prev) => {
                    const next = { ...prev }
                    rankings.forEach((e) => { delete next[e.inscriptionId] })
                    return next
                  })}
                >
                  Restaurar
                </button>
              </div>
            </div>
          )}

          {activePromotion && rankings.length === 0 && (
            <p style={{ color: 'var(--gs-muted)', fontSize: 14, padding: '24px 0' }}>
              No hay gymnastas inscritas en esta promoción.
            </p>
          )}

          {!activePromotion && promotions.length > 0 && (
            <p style={{ color: 'var(--gs-muted)', fontSize: 14, padding: '24px 0' }}>
              Selecciona una promoción para ver y editar las puntuaciones.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
