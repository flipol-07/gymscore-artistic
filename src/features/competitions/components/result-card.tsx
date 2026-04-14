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
      style={{ 
        position: 'fixed', inset: 0, 
        background: 'rgba(0,0,0,0.92)', 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 20, 
        backdropFilter: 'blur(8px)',
        cursor: 'default'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
      >
        {/* Scale Container for Mobile Preview */}
        <div style={{ 
          width: '800px', 
          height: '450px', 
          transform: typeof window !== 'undefined' && window.innerWidth < 840 ? `scale(${(window.innerWidth - 40) / 800})` : 'none',
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div 
            ref={cardRef}
            style={{ 
              width: '800px', 
              height: '450px', 
              background: '#fff', 
              display: 'flex',
              overflow: 'hidden',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Left Column - High Contrast */}
            <div style={{ 
              width: '40%', 
              background: entry.position === 1 ? 'linear-gradient(135deg, #d4af37 0%, #f1c40f 100%)' : 
                          entry.position === 2 ? 'linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%)' :
                          entry.position === 3 ? 'linear-gradient(135deg, #a0522d 0%, #cd7f32 100%)' :
                          'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              textAlign: 'center'
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
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 400, marginTop: typeof window !== 'undefined' && window.innerWidth < 840 ? -60 : 0 }}>
          <button
            onClick={onClose}
            className="gs-btn-secondary"
            style={{
              flex: 1, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13,
            }}
          >
            <X size={16} /> Cerrar
          </button>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="gs-btn-primary"
            style={{
              flex: 2, height: 44, borderRadius: 12,
              background: '#fff', border: 'none',
              color: '#000', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13,
            }}
          >
            {loading ? 'Generando...' : <><Download size={18} /> Descargar PNG</>}
          </button>
        </div>

        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: typeof window !== 'undefined' && window.innerWidth < 840 ? -40 : 0 }}>
          Previsualización del diploma (calidad optimizada para compartir)
        </div>
      </div>
    </div>,
    document.body
  )
}
