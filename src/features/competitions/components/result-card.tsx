'use client'

import { createPortal } from 'react-dom'
import { useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { X, Download } from 'lucide-react'
import { APPARATUS_NAMES, FEMALE_APPARATUS, MALE_APPARATUS } from '../types'
import type { RankingEntry, Apparatus } from '../types'
import { ApparatusIcon } from './apparatus-icon'

interface ResultCardProps {
  entry: RankingEntry
  gender: 'female' | 'male'
  onClose: () => void
}

const MEDAL_LABEL: Record<number, string> = { 1: 'ORO', 2: 'PLATA', 3: 'BRONCE' }
const MEDAL_COLOR: Record<number, string> = { 1: '#D4AF37', 2: '#9CA3AF', 3: '#B87333' }

export function ResultCard({ entry, gender, onClose }: ResultCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const cardRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  const apparatus: Apparatus[] = gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS
  const scores = apparatus.map(app => ({
    app,
    score: entry[`${app}Score` as keyof RankingEntry] as number,
  })).filter(s => s.score > 0)

  const isMedal = entry.position <= 3
  const accentColor = isMedal ? MEDAL_COLOR[entry.position] : '#4C6FD9'

  const handleDownload = async () => {
    if (!cardRef.current) return
    setLoading(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        width: 900,
        height: 540,
      })
      const link = document.createElement('a')
      link.download = `diploma-${entry.gymnastName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error generating diploma:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div
      onClick={onClose}
      className="diploma-modal-overlay"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999999, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 940, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* THE DIPLOMA — horizontal 5:3 ratio */}
        <div
          ref={cardRef}
          className="print-diploma"
          style={{
            width: 900, height: 540,
            maxWidth: '100%',
            background: '#FAFAF8',
            borderRadius: 16,
            display: 'flex',
            overflow: 'hidden',
            fontFamily: 'Georgia, "Times New Roman", serif',
            position: 'relative',
          }}
        >
          {/* Left accent stripe */}
          <div style={{
            width: 12, background: accentColor, flexShrink: 0,
          }} />

          {/* Gold/accent side panel */}
          <div style={{
            width: 220, flexShrink: 0,
            background: accentColor,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 30, gap: 20,
          }}>
            {/* Position badge */}
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.15)',
            }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: 'system-ui' }}>
                {entry.position}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
                {isMedal ? MEDAL_LABEL[entry.position] : 'PUESTO'}
              </span>
            </div>

            {/* Club flag */}
            {entry.clubFlag && (
              <img src={entry.clubFlag} alt="" style={{ height: 32, borderRadius: 4, opacity: 0.9 }} />
            )}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontFamily: 'system-ui', fontWeight: 600 }}>
              {entry.clubName}
            </div>

            {/* Total score */}
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui' }}>
                Total
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: 'system-ui', letterSpacing: '-0.02em' }}>
                {entry.totalScore.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '44px 48px', position: 'relative' }}>
            {/* Decorative corner lines */}
            <div style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, opacity: 0.3 }} />
            <div style={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}`, opacity: 0.3 }} />

            {/* Header */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'system-ui', marginBottom: 4 }}>
                Diploma de Participación · Gimnasia Artística
              </div>
              <div style={{ height: 1, background: `linear-gradient(to right, ${accentColor}, transparent)`, marginBottom: 18 }} />
            </div>

            {/* Certifies line */}
            <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic', marginBottom: 8 }}>
              Se certifica que
            </div>

            {/* Gymnast name — main element */}
            <div style={{
              fontSize: 38, fontWeight: 700, color: '#1A1A1A',
              lineHeight: 1.1, marginBottom: 16,
              letterSpacing: '-0.01em',
            }}>
              {entry.gymnastName}
            </div>

            {/* Participation text */}
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>
              ha participado en la competición de Gimnasia Artística<br />
              y ha obtenido el <strong style={{ color: accentColor }}>puesto {entry.position}º</strong> en la categoría correspondiente.
            </div>

            {/* Scores row */}
            {scores.length > 0 && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 'auto' }}>
                {scores.map(({ app, score }) => (
                  <div key={app} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ color: '#999', fontSize: 13, display: 'flex', alignItems: 'center' }}>
                      <ApparatusIcon apparatus={app} size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'system-ui', lineHeight: 1 }}>
                        {APPARATUS_NAMES[app]}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#333', fontFamily: 'system-ui', lineHeight: 1.2 }}>
                        {score.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#bbb', fontFamily: 'system-ui', letterSpacing: '0.05em' }}>
                GymScore · gymscore.app
              </div>
              <div style={{ fontSize: 11, color: '#ccc', fontFamily: 'system-ui' }}>
                {gender === 'female' ? 'Modalidad Femenina' : 'Modalidad Masculina'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="diploma-actions" style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#fff', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 14,
            }}
          >
            <X size={18} /> Cerrar
          </button>

          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              flex: 2, height: 48, borderRadius: 12,
              background: '#fff', border: 'none',
              color: '#000', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 14,
            }}
          >
            {loading ? 'Generando...' : <><Download size={18} /> Descargar PNG</>}
          </button>
        </div>

        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
          Diploma horizontal listo para descargar o compartir
        </div>
      </div>
    </div>,
    document.body
  )
}
