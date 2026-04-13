'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import type { CompetitionStatus } from '@/features/competitions/types'
import { FEMALE_APPARATUS, MALE_APPARATUS, APPARATUS_NAMES, type Apparatus } from '@/features/competitions/types'
import type { RankingEntry, Competition, CompetitionSession, Promotion } from '@/features/competitions/types'
import { processProgramAction } from '@/features/competitions/actions/process-program'
import { processCsvAction } from '@/features/competitions/actions/process-csv'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

function getScore(entry: RankingEntry, app: Apparatus): number {
  switch (app) {
    case 'vault': return entry.vaultScore
    case 'bars': return entry.barsScore
    case 'beam': return entry.beamScore
    case 'floor': return entry.floorScore
    case 'pommel': return entry.pommelScore
    case 'rings': return entry.ringsScore
    case 'p_bars': return entry.p_barsScore
    case 'h_bar': return entry.h_barScore
    default: return 0
  }
}

function computeTotal(entry: RankingEntry, apparatus: Apparatus[], overrides: Record<string, { total: number }>): number {
  return apparatus.reduce((sum, app) => sum + (overrides[app]?.total ?? getScore(entry, app)), 0)
}

export default function AdminCompeticionPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string
  
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [sessions, setSessions] = useState<CompetitionSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [activePromotionId, setActivePromotionId] = useState<string | null>(null)
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  
  const [editingScore, setEditingScore] = useState<{ id: string, app: Apparatus } | null>(null)
  const [tempScore, setTempScore] = useState<string>('')
  const [scores, setScores] = useState<Record<string, Record<string, { total: number }>>>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  const [isSuper, setIsSuper] = useState(false)
  const [isEventAuthenticated, setIsEventAuthenticated] = useState(false)
  const [enteredPassword, setEnteredPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // 1. Fetch Competition and Auth status
  useEffect(() => {
    async function loadComp() {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setIsSuper(prof?.role === 'superadmin')
      }

      const comp = await service.getCompetitionBySlug(slug)
      if (comp) {
        setCompetition(comp)
        const sess = await service.getSessions(comp.id)
        setSessions(sess)
        if (sess.length > 0) setActiveSessionId(sess[0].id)
        
        // Check session storage for event password
        if (typeof window !== 'undefined') {
          const authKey = `event_auth_${comp.id}`
          const savedPass = sessionStorage.getItem(authKey)
          if (savedPass && savedPass !== 'true') {
            setIsEventAuthenticated(true)
            setEnteredPassword(savedPass)
          } else if (savedPass === 'true') {
            // Old format — just mark authenticated, password must be re-entered
            setIsEventAuthenticated(true)
          }
        }
      }
      setLoading(false)
    }
    loadComp()
  }, [slug])

  // Fetch Promotions when Session changes
  useEffect(() => {
    if (activeSessionId) {
      service.getPromotions(activeSessionId).then(setPromotions)
    }
  }, [activeSessionId])

  // Fetch Rankings when Promotion expands
  useEffect(() => {
    if (activePromotionId) {
      service.getRankings(activePromotionId).then(setRankings)
    } else {
      setRankings([])
    }
  }, [activePromotionId])

  const handleVerifyEventPassword = async () => {
    if (!competition) return
    setProcessing(true)
    const ok = await service.verifyEventPassword(competition.id, enteredPassword)
    if (ok) {
        setIsEventAuthenticated(true)
        sessionStorage.setItem(`event_auth_${competition.id}`, enteredPassword)
    } else {
        alert('Contraseña del evento incorrecta')
    }
    setProcessing(false)
  }

  const handleUpdateEventPassword = async () => {
    if (!competition || !newPassword) return
    setProcessing(true)
    const { success } = await service.updateCompetitionAdminPassword(competition.id, newPassword)
    if (success) {
      alert('Contraseña del evento actualizada.')
      setNewPassword('')
      // Update local state to show the new pass in its place if Super
      setCompetition(prev => prev ? { ...prev, adminPassword: newPassword } : null)
    } else {
      alert('Error actualizando contraseña.')
    }
    setProcessing(false)
  }

  const handleUpdateScore = async (inscriptionId: string, app: Apparatus, val: number) => {
    const pass = isSuper ? competition?.adminPassword : enteredPassword
    const { success } = await service.updateScore(inscriptionId, app, val, 0, pass || undefined)
    if (success) {
      setScores(prev => ({ 
        ...prev, 
        [inscriptionId]: { 
          ...prev[inscriptionId], 
          [app]: { total: val } 
        }
      }))
    } else {
      alert('Error guardando la nota en Supabase')
    }
  }

  const handleBack = () => {
    if (isSuper) {
      router.push('/superadmin')
    } else {
      router.push('/')
    }
  }

  const handleToggleVisibility = async () => {
    if (!competition) return
    const newStatus = !competition.isPublished
    const { success } = await service.updateCompetitionVisibility(competition.id, newStatus)
    if (success) {
      setCompetition({ ...competition, isPublished: newStatus })
    } else {
      alert('Error actualizando la visibilidad')
    }
  }

  const handleStatusChange = async (newStatus: CompetitionStatus) => {
    if (!competition) return
    const { success } = await service.updateCompetitionStatus(competition.id, newStatus)
    if (success) {
      setCompetition({ ...competition, status: newStatus })
    } else {
      alert('Error actualizando el estado')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !competition) return
    
    setProcessing(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const pass = isSuper ? competition.adminPassword : enteredPassword
        await processProgramAction(competition.id, base64, pass || undefined)
        alert('¡Programa procesado con éxito! Se han creado las categorías y gimnastas.')
        window.location.reload()
      }
    } catch (err) {
      alert('Error procesando programa')
    } finally {
      setProcessing(false)
    }
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !competition) return
    
    setProcessing(true)
    try {
      const text = await file.text()
      const pass = isSuper ? competition.adminPassword : enteredPassword
      await processCsvAction(competition.id, text, pass || undefined)
      alert('¡CSV procesado con éxito! Se han creado las jornadas, categorías y gimnastas.')
      window.location.reload()
    } catch (err: any) {
      alert('Error procesando CSV: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 'bold' }}>Cargando datos reales...</div>
  if (!competition) return <div style={{ padding: 40, textAlign: 'center' }}>Competición no encontrada.</div>

  // --- ACCESS CONTROL ---
  if (!isSuper && !isEventAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gs-bg)' }}>
        <div className="gs-card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontWeight: 800, marginBottom: 12, fontSize: 24, letterSpacing: '-0.02em' }}>Acceso a Mesa</h1>
          <div style={{ fontSize: 13, color: 'var(--gs-muted)', fontWeight: 500, marginBottom: 24 }}>
            Introduce la contraseña para gestionar <br/><span style={{ color: 'var(--gs-text)' }}>{competition.name}</span>
          </div>
          <input 
            type="password" 
            className="gs-input" 
            placeholder="Contraseña del evento" 
            value={enteredPassword}
            onChange={e => setEnteredPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerifyEventPassword()}
            style={{ marginBottom: 16, textAlign: 'center' }}
          />
          <button 
            className="gs-btn-primary" 
            style={{ width: '100%', justifyContent: 'center', height: 44, borderRadius: 10 }}
            onClick={handleVerifyEventPassword}
            disabled={processing}
          >
            {processing ? 'Verificando...' : 'Entrar'}
          </button>
          
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gs-border)' }}>
            <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--gs-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const activePromotion = promotions.find((p) => p.id === activePromotionId)
  const apparatus: Apparatus[] = activePromotion?.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar isAdmin onBack={handleBack} />

      <main style={{ flex: 1 }}>
        {/* Event Header */}
        <div style={{ background: '#fff', padding: '40px 0', borderBottom: '1px solid var(--gs-border)' }}>
          <div className="gs-container" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 20, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {competition.name}
            </h1>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
               <label className="gs-btn-secondary" style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: processing ? 'default' : 'pointer', opacity: processing ? 0.5 : 1 }}>
                {processing ? 'Procesando...' : 'Subir PDF (AI)'}
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={processing} />
              </label>

              <label className="gs-btn-secondary" style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: processing ? 'default' : 'pointer', opacity: processing ? 0.5 : 1 }}>
                {processing ? 'Procesando...' : 'Subir CSV'}
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} disabled={processing} />
              </label>
              
              {isSuper && (
                <button
                  className={`gs-btn-${competition.isPublished ? 'secondary' : 'primary'}`}
                  style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14 }}
                  onClick={handleToggleVisibility}
                >
                  {competition.isPublished ? 'Ocultar Evento' : 'Publicar Evento'}
                </button>
              )}

              {isSuper && (
                <select
                  value={competition.status}
                  onChange={e => handleStatusChange(e.target.value as CompetitionStatus)}
                  style={{
                    height: 44,
                    padding: '0 16px',
                    borderRadius: 12,
                    border: '1px solid var(--gs-border)',
                    background: competition.status === 'active' ? '#dcfce7' : competition.status === 'finished' ? '#f1f5f9' : '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    color: competition.status === 'active' ? '#16a34a' : 'var(--gs-text)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="draft">Borrador</option>
                  <option value="active">● En directo</option>
                  <option value="finished">Finalizado</option>
                </select>
              )}

              {isSuper && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={newPassword ? "text" : (competition.adminPassword ? "text" : "password")} 
                      className="gs-input" 
                      placeholder="Nueva contraseña mesa"
                      value={newPassword || (competition.adminPassword || '')}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{ 
                        width: 200, 
                        height: 44, 
                        fontSize: 14, 
                        fontWeight: 600,
                        backgroundColor: !newPassword ? 'var(--gs-bg)' : '#fff',
                        color: !newPassword ? 'var(--gs-muted)' : 'var(--gs-text)'
                      }} 
                    />
                    {!newPassword && competition.adminPassword && (
                      <div style={{ position: 'absolute', top: -18, left: 4, fontSize: 10, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>
                        Pass Actual
                      </div>
                    )}
                  </div>
                  <button 
                    className="gs-btn-secondary"
                    style={{ padding: '0 16px', borderRadius: 12, fontWeight: 700, fontSize: 14, height: 44 }}
                    onClick={handleUpdateEventPassword}
                  >
                    Actualizar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="gs-container" style={{ padding: '32px 16px' }}>
          {/* Main Content (Mesa view) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gs-text)' }}>
              Configuración de Jornada (Muestreo)
            </span>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(competition.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gs-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              📍 {competition.location}
            </a>
          </div>

          <div style={{ marginBottom: 40 }}>
            <select 
              value={activeSessionId}
              onChange={(e) => { setActiveSessionId(e.target.value); setActivePromotionId(null) }}
              style={{ 
                width: '100%', 
                height: 52, 
                padding: '0 16px', 
                borderRadius: 12, 
                border: '1px solid var(--gs-border)',
                background: '#fff',
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--gs-text)',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '16px'
              }}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              {sessions.length === 0 && <option value="">Sin jornadas procesadas</option>}
            </select>
          </div>

          {/* Promotions list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {promotions.map((prom) => {
              const isActive = activePromotionId === prom.id
              const appList = prom.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

              return (
                <div 
                  key={prom.id} 
                  className="gs-card"
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden',
                    border: isActive ? '2px solid var(--gs-primary)' : '1px solid var(--gs-border)'
                  }}
                >
                  <div 
                    onClick={() => setActivePromotionId(isActive ? null : prom.id)}
                    style={{ padding: '24px', cursor: 'pointer', position: 'relative' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gs-text)', marginBottom: 2 }}>
                          {prom.name}
                        </h3>
                        <div style={{ fontSize: 13, color: 'var(--gs-muted)', fontWeight: 500, marginBottom: 12 }}>
                          {prom.gymnast_count} gimnastas
                        </div>
                        
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {appList.map(app => (
                            <span 
                              key={app} 
                              style={{ 
                                fontSize: 11, 
                                fontWeight: 700, 
                                color: 'var(--gs-muted)', 
                                border: '1px solid var(--gs-border)', 
                                padding: '2px 8px', 
                                borderRadius: 6,
                                background: '#fff'
                              }}
                            >
                              {APPARATUS_NAMES[app]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className={`gs-badge gs-badge-${prom.gender}`} style={{ marginBottom: 16, display: 'inline-block' }}>
                          {prom.gender === 'female' ? 'Femenino' : 'Masculino'}
                        </div>
                        <div style={{ color: 'var(--gs-primary)', fontSize: 13, fontWeight: 700 }}>
                          {isActive ? 'Cerrar ↑' : 'Gestionar Notas →'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div style={{ background: 'var(--gs-bg)', padding: '16px 24px', borderTop: '1px solid var(--gs-border)' }}>
                      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gs-border)', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: 'var(--gs-bg)', borderBottom: '1px solid var(--gs-border)' }}>
                                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Gimnasta</th>
                                {appList.map(app => (
                                  <th key={app} style={{ padding: '10px', textAlign: 'center' }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }} title={APPARATUS_NAMES[app]}>
                                      {APPARATUS_NAMES[app].slice(0, 3)}
                                    </span>
                                  </th>
                                ))}
                                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rankings.map((entry) => {
                                const key = entry.inscriptionId
                                const entryOverrides = scores[key] ?? {}
                                const total = computeTotal(entry, appList, entryOverrides)

                                return (
                                  <tr key={key} style={{ borderBottom: '1px solid var(--gs-border)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>{entry.gymnastName}</td>
                                    {appList.map(app => {
                                      const original = getScore(entry, app)
                                      const current = entryOverrides[app]?.total ?? original
                                      const isEditing = editingScore?.id === key && editingScore?.app === app

                                      return (
                                        <td key={app} style={{ textAlign: 'center', padding: '12px 6px' }}>
                                          {isEditing ? (
                                            <input
                                              type="number"
                                              step="0.01"
                                              className="gs-input"
                                              value={tempScore}
                                              onChange={e => setTempScore(e.target.value)}
                                              onBlur={() => {
                                                const val = parseFloat(tempScore) || 0
                                                handleUpdateScore(key, app, val)
                                                setEditingScore(null)
                                              }}
                                              onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                  const val = parseFloat(tempScore) || 0
                                                  handleUpdateScore(key, app, val)
                                                  setEditingScore(null)
                                                }
                                              }}
                                              autoFocus
                                              style={{ width: 60, height: 32, textAlign: 'center', fontSize: 14, fontWeight: 700, padding: 0 }}
                                            />
                                          ) : (
                                            <button 
                                              onClick={() => {
                                                setTempScore(current.toString())
                                                setEditingScore({ id: key, app })
                                              }}
                                              style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontWeight: 800, 
                                                color: 'var(--gs-text)', 
                                                fontSize: 16 
                                              }}
                                            >
                                              {current.toFixed(2)}
                                            </button>
                                          )}
                                        </td>
                                      )
                                    })}
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: 14, color: 'var(--gs-text)' }}>
                                      {total.toFixed(2)}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
