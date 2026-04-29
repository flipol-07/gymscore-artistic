'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreBreakdownProps {
  dScore: number
  eScore: number
  totalScore: number
  color: string
  children: React.ReactNode
}

export function ScoreBreakdown({ dScore, eScore, totalScore, color, children }: ScoreBreakdownProps) {
  const hasDesglose = dScore > 0 || eScore > 0
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const justOpenedRef = useRef(false)

  const nd = hasDesglose ? Math.round((totalScore - dScore - eScore) * 1000) / 1000 : 0
  const showND = Math.abs(nd) > 0.001

  function computePosition() {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const left = Math.max(70, Math.min(window.innerWidth - 70, rect.left + rect.width / 2))
    setPos({
      top: rect.bottom + 6 + window.scrollY,
      left,
    })
  }

  function open() {
    if (!hasDesglose) return
    computePosition()
    setVisible(true)
    // Marcar que acabamos de abrir para ignorar el primer click outside
    justOpenedRef.current = true
    setTimeout(() => { justOpenedRef.current = false }, 0)
  }

  function close() { setVisible(false) }

  // Cerrar al hacer click fuera (móvil + desktop persistente)
  useEffect(() => {
    if (!visible) return
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      // Ignorar el click que acaba de abrir el popover
      if (justOpenedRef.current) return
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setVisible(false)
    }
    // Pequeño delay para no capturar el evento que abrió
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside)
      document.addEventListener('touchstart', handleOutside)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [visible])

  // Cerrar al hacer scroll
  useEffect(() => {
    if (!visible) return
    const handleScroll = () => setVisible(false)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visible])

  if (!hasDesglose) return <>{children}</>

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (visible) close()
          else open()
        }}
        className="score-breakdown-trigger"
        style={{
          display: 'inline-block',
          cursor: 'pointer',
          position: 'relative',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          font: 'inherit',
          color: 'inherit',
          ['--breakdown-color' as string]: color,
        } as React.CSSProperties}
        aria-label={`Ver desglose D ${dScore.toFixed(3)}, E ${eScore.toFixed(3)}`}
      >
        {children}
      </button>

      {visible && (
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#ffffff',
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: '0 8px 28px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06)',
            border: '1px solid var(--gs-border)',
            whiteSpace: 'nowrap',
          }}
        >
          {/* arrow with border */}
          <span style={{
            position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '7px solid var(--gs-border)',
          }} />
          <span style={{
            position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '6px solid #ffffff',
          }} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
            <ScorePill label="D" value={dScore} color="var(--gs-primary)" />
            <span style={{ width: 1, background: 'var(--gs-border)' }} />
            <ScorePill label="E" value={eScore} color="var(--gs-success)" />
            {showND && (
              <>
                <span style={{ width: 1, background: 'var(--gs-border)' }} />
                <ScorePill label="Pen" value={nd} color="var(--gs-live)" />
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 44, padding: '0 2px' }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
        {value.toFixed(label === 'Pen' ? 2 : 3)}
      </div>
    </div>
  )
}
