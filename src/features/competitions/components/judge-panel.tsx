'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Search, Trash2 } from 'lucide-react'
import {
  APPARATUS_NAMES,
  FEMALE_APPARATUS,
  MALE_APPARATUS,
} from '../types'
import type { Apparatus } from '../types'
import { ApparatusIcon } from './apparatus-icon'
import {
  findInscriptionByDorsal,
  getJudgePanelData,
  type JudgeInscription,
  type JudgePanelData,
} from '../actions/judge-panel'
import { deleteScoreAction, saveScoreAction } from '../actions/admin-mutations'

interface Props {
  slug: string
  promotionId: string
}

type Feedback = { kind: 'ok' | 'error'; text: string } | null

export function JudgePanel({ slug, promotionId }: Props) {
  const [data, setData] = useState<JudgePanelData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apparatus, setApparatus] = useState<Apparatus>('vault')
  const [dorsal, setDorsal] = useState('')
  const [dScore, setDScore] = useState('')
  const [eScore, setEScore] = useState('')
  const [nScore, setNScore] = useState('')
  const [matched, setMatched] = useState<{ id: string; name: string } | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [isPending, startTransition] = useTransition()

  async function refresh() {
    const res = await getJudgePanelData(promotionId)
    if ('ok' in res && res.ok) {
      setData(res)
      setError(null)
    } else {
      setError((res as any).error ?? 'Error al cargar datos.')
    }
  }

  useEffect(() => { refresh() }, [promotionId])

  const apparatusList: Apparatus[] = useMemo(() => {
    if (!data) return FEMALE_APPARATUS
    return data.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS
  }, [data])

  const isCompetitionDay = useMemo(() => {
    if (!data) return true
    return data.competitionDate === data.todayMadrid
  }, [data])

  // Calcular nota en vivo
  const computedScore = useMemo(() => {
    const d = parseFloat(dScore) || 0
    const e = parseFloat(eScore) || 0
    const n = parseFloat(nScore) || 0
    const raw = 10 + d - e - n
    return Math.max(0, Math.round(raw * 1000) / 1000)
  }, [dScore, eScore, nScore])

  const wouldBeNegative = useMemo(() => {
    const d = parseFloat(dScore) || 0
    const e = parseFloat(eScore) || 0
    const n = parseFloat(nScore) || 0
    return (10 + d - e - n) < -0.001
  }, [dScore, eScore, nScore])

  // Resolver dorsal → gimnasta (mejora 1)
  useEffect(() => {
    setFeedback(null)
    const num = parseInt(dorsal, 10)
    if (!Number.isFinite(num) || num <= 0) {
      setMatched(null)
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      const res = await findInscriptionByDorsal(promotionId, num)
      if (cancelled) return
      if (res.ok) {
        setMatched({ id: res.inscriptionId, name: res.gymnastName })
      } else {
        setMatched(null)
        setFeedback({ kind: 'error', text: res.error })
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [dorsal, promotionId])

  // Prefill desde nota existente
  useEffect(() => {
    if (!data || !matched) return
    const ins = data.inscriptions.find(i => i.inscriptionId === matched.id)
    const existing = ins?.scores[apparatus]
    if (existing) {
      setDScore(existing.d ? String(existing.d) : '')
      setEScore(existing.e ? String(existing.e) : '')
      setNScore(existing.n ? String(existing.n) : '')
    } else {
      setDScore(''); setEScore(''); setNScore('')
    }
  }, [matched, apparatus, data])

  function resetForm() {
    setDorsal('')
    setDScore('')
    setEScore('')
    setNScore('')
    setMatched(null)
    setFeedback(null)
  }

  async function handleSave() {
    if (!data || !matched) {
      setFeedback({ kind: 'error', text: 'Introduce un dorsal válido.' })
      return
    }
    if (wouldBeNegative) {
      setFeedback({ kind: 'error', text: 'Las deducciones dejarían la nota en negativo.' })
      return
    }
    setFeedback(null)
    startTransition(async () => {
      const res = await saveScoreAction({
        competitionId: data.competitionId,
        inscriptionId: matched.id,
        apparatus,
        dorsal: parseInt(dorsal, 10),
        promotionId,
        dScore: parseFloat(dScore) || 0,
        eScore: parseFloat(eScore) || 0,
        nScore: parseFloat(nScore) || 0,
      })
      if (res.ok) {
        setFeedback({
          kind: 'ok',
          text: `Guardado: ${matched.name} — ${APPARATUS_NAMES[apparatus]} ${(res.score ?? computedScore).toFixed(3)}`,
        })
        await refresh()
        // Mantener apparatus seleccionado, limpiar dorsal para siguiente gimnasta
        setDorsal(''); setMatched(null)
        setDScore(''); setEScore(''); setNScore('')
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'Error al guardar.' })
      }
    })
  }

  async function handleDelete(inscriptionId: string, app: Apparatus) {
    if (!data) return
    if (!confirm(`¿Borrar nota de ${APPARATUS_NAMES[app]}?`)) return
    startTransition(async () => {
      const res = await deleteScoreAction({
        competitionId: data.competitionId,
        inscriptionId,
        apparatus: app,
      })
      if (res.ok) {
        await refresh()
        setFeedback({ kind: 'ok', text: 'Nota borrada.' })
      } else {
        setFeedback({ kind: 'error', text: res.error ?? 'Error al borrar.' })
      }
    })
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#EF4444', fontWeight: 700 }}>{error}</div>
        <Link href={`/competiciones/${slug}`} style={{ display: 'inline-block', marginTop: 12 }}>
          Volver
        </Link>
      </div>
    )
  }
  if (!data) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Cargando panel…</div>
  }

  return (
    <div style={{ padding: '12px 14px 80px' }}>
      <div style={{
        background: '#7F1D1D', color: '#fff', padding: '10px 14px',
        borderRadius: 8, marginBottom: 12, fontSize: 12, fontWeight: 700,
      }}>
        ⚠️ ADMIN · AÑADIR / EDITAR RESULTADOS
        <div style={{ fontWeight: 500, fontSize: 11, opacity: 0.9 }}>
          Estás modificando datos oficiales
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Link
          href={`/competiciones/${slug}/${promotionId}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 700, color: 'var(--gs-primary)', textDecoration: 'none',
            padding: '6px 10px', borderRadius: 8, background: 'var(--gs-bg)',
          }}
        >
          <ArrowLeft size={14} /> Volver al listado
        </Link>
      </div>

      <h1 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        {data.competitionName}
      </h1>
      <div style={{ fontSize: 13, color: 'var(--gs-muted)', marginBottom: 14 }}>
        Categoría: <strong style={{ color: 'var(--gs-text)' }}>{data.categoryName}</strong>
        {' · '}Fecha: {data.competitionDate}
      </div>

      {!isCompetitionDay && (
        <div style={{
          background: '#FEF3C7', color: '#92400E', padding: '10px 12px',
          borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 600,
        }}>
          ⚠️ Hoy no es el día de la competición ({data.competitionDate}). Los jueces de mesa
          no pueden meter notas fuera de fecha.
        </div>
      )}

      {/* Selector de aparato */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Aparato
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {apparatusList.map(app => {
            const active = app === apparatus
            return (
              <button
                key={app}
                type="button"
                onClick={() => setApparatus(app)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 10,
                  background: active ? 'var(--gs-primary)' : '#fff',
                  color: active ? '#fff' : 'var(--gs-text)',
                  border: active ? '2px solid var(--gs-primary)' : '1px solid var(--gs-border)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}
              >
                <ApparatusIcon apparatus={app} size={18} tintColor={active ? '#fff' : '#475569'} />
                {APPARATUS_NAMES[app]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: '#fff', border: '1px solid var(--gs-border)',
        borderRadius: 12, padding: 14, marginBottom: 14,
      }}>
        <Field label="Dorsal">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              inputMode="numeric"
              value={dorsal}
              onChange={e => setDorsal(e.target.value)}
              placeholder="0"
              style={inputStyle()}
            />
            <Search size={14} color="var(--gs-muted)" />
          </div>
          {matched && (
            <div style={{ fontSize: 12, color: 'var(--gs-success)', marginTop: 4, fontWeight: 600 }}>
              ✓ {matched.name}
            </div>
          )}
        </Field>

        <Field label="Dificultad (D)">
          <input
            type="number" step="0.1" min="0" max="10"
            value={dScore}
            onChange={e => setDScore(e.target.value)}
            placeholder="0.0"
            style={inputStyle()}
          />
        </Field>

        <Field label="Deducción NE (Ejecución)">
          <input
            type="number" step="0.1" min="0" max="10"
            value={eScore}
            onChange={e => setEScore(e.target.value)}
            placeholder="0.0"
            style={inputStyle()}
          />
        </Field>

        <Field label="Deducción Neutral">
          <input
            type="number" step="0.1" min="0" max="10"
            value={nScore}
            onChange={e => setNScore(e.target.value)}
            placeholder="0.0"
            style={inputStyle()}
          />
        </Field>

        <div style={{
          marginTop: 8, padding: 10, borderRadius: 10,
          background: wouldBeNegative ? '#FEE2E2' : 'var(--gs-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: 'var(--gs-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Nota Final
          </span>
          <span style={{
            fontSize: 22, fontWeight: 900,
            color: wouldBeNegative ? '#EF4444' : 'var(--gs-primary)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em',
          }}>
            {computedScore.toFixed(3)}
          </span>
        </div>
        {wouldBeNegative && (
          <div style={{ fontSize: 11, color: '#EF4444', marginTop: 6, fontWeight: 600 }}>
            ⚠️ Las deducciones dejarían la nota en negativo. Revisa los valores.
          </div>
        )}

        {feedback && (
          <div style={{
            marginTop: 8, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: feedback.kind === 'ok' ? '#D1FAE5' : '#FEE2E2',
            color: feedback.kind === 'ok' ? '#065F46' : '#7F1D1D',
          }}>
            {feedback.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={handleSave}
            disabled={isPending || !matched || wouldBeNegative}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 10, border: 'none',
              background: 'var(--gs-primary)', color: '#fff', fontWeight: 800, fontSize: 13,
              cursor: isPending || !matched ? 'not-allowed' : 'pointer',
              opacity: isPending || !matched || wouldBeNegative ? 0.5 : 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Save size={14} /> {isPending ? 'Guardando…' : 'Guardar nota'}
          </button>
          <button
            onClick={resetForm}
            type="button"
            style={{
              padding: '10px 12px', borderRadius: 10, border: '1px solid var(--gs-border)',
              background: '#fff', color: 'var(--gs-text)', fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Listado de gimnastas con notas */}
      <h2 style={{ fontSize: 13, fontWeight: 800, margin: '14px 0 6px' }}>
        Gimnastas del grupo
      </h2>
      <div style={{
        background: '#fff', border: '1px solid var(--gs-border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--gs-bg)' }}>
              <th style={th()}>Dor.</th>
              <th style={{ ...th(), textAlign: 'left' }}>Gimnasta</th>
              {apparatusList.map(app => (
                <th key={app} style={th()}>
                  <ApparatusIcon apparatus={app} size={16} tintColor="#475569" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.inscriptions.map(ins => (
              <Row
                key={ins.inscriptionId}
                ins={ins}
                apparatusList={apparatusList}
                onDelete={(app) => handleDelete(ins.inscriptionId, app)}
                onPickDorsal={() => { if (ins.dorsal != null) setDorsal(String(ins.dorsal)) }}
              />
            ))}
            {data.inscriptions.length === 0 && (
              <tr><td colSpan={2 + apparatusList.length} style={{ padding: 14, textAlign: 'center', color: 'var(--gs-muted)' }}>
                Sin gimnastas en este grupo.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({
  ins, apparatusList, onDelete, onPickDorsal,
}: {
  ins: JudgeInscription
  apparatusList: Apparatus[]
  onDelete: (app: Apparatus) => void
  onPickDorsal: () => void
}) {
  return (
    <tr style={{ borderTop: '1px solid var(--gs-border)' }}>
      <td style={td()} onClick={onPickDorsal}>
        <span style={{ fontWeight: 800, color: 'var(--gs-primary)', cursor: 'pointer' }}>
          {ins.dorsal ?? '—'}
        </span>
      </td>
      <td style={{ ...td(), textAlign: 'left' }}>
        <div style={{ fontWeight: 700 }}>{ins.gymnastName}</div>
        <div style={{ fontSize: 10, color: 'var(--gs-muted)' }}>{ins.clubName}</div>
      </td>
      {apparatusList.map(app => {
        const s = ins.scores[app]
        return (
          <td key={app} style={{ ...td(), textAlign: 'center' }}>
            {s ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--gs-text)' }}>
                  {s.total.toFixed(3)}
                </span>
                <button
                  onClick={() => onDelete(app)}
                  title="Borrar nota"
                  style={{
                    background: 'none', border: 'none', padding: 2, cursor: 'pointer',
                    color: '#94A3B8', display: 'inline-flex',
                  }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ) : (
              <span style={{ color: '#CBD5E1' }}>—</span>
            )}
          </td>
        )
      })}
    </tr>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{
        display: 'block', fontSize: 10, fontWeight: 700,
        color: 'var(--gs-muted)', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 4,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid var(--gs-border)', fontSize: 14, fontWeight: 600,
    background: '#fff', color: 'var(--gs-text)', fontVariantNumeric: 'tabular-nums',
  }
}

function th(): React.CSSProperties {
  return {
    padding: '8px 4px', textAlign: 'center',
    fontSize: 9, fontWeight: 700, color: 'var(--gs-muted)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  }
}

function td(): React.CSSProperties {
  return { padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }
}
