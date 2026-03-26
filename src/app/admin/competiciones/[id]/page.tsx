'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import { FEMALE_APPARATUS, MALE_APPARATUS, APPARATUS_NAMES, APPARATUS_ICONS, type Apparatus } from '@/features/competitions/types'
import type { RankingEntry, Competition, CompetitionSession, Promotion } from '@/features/competitions/types'
import { processProgramAction } from '@/features/competitions/actions/process-program'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

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
  const router = useRouter()
  const slug = params.id as string
  
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [sessions, setSessions] = useState<CompetitionSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [activePromotionId, setActivePromotionId] = useState<string | null>(null)
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isAdminView, setIsAdminView] = useState(false)
  const [isSuper, setIsSuper] = useState(false)
  
  interface AdminProfile { id: string, email: string, full_name?: string }
  interface AssignedAdmin { id: string, profile_id: string, profiles: { id: string, email: string } }

  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPass, setNewAdminPass] = useState('')
  const [assignedAdmins, setAssignedAdmins] = useState<AssignedAdmin[]>([])
  const [allAdmins, setAllAdmins] = useState<AdminProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Fetch Competition and its Sessions
  useEffect(() => {
    async function loadComp() {
      const { data: { user } } = await createBrowserClient().auth.getUser()
      if (user) {
        const { data: prof } = await createBrowserClient().from('profiles').select('role').eq('id', user.id).single()
        setIsSuper(prof?.role === 'superadmin')
      }

      const comp = await service.getCompetitionBySlug(slug)
      if (comp) {
        setCompetition(comp)
        const sess = await service.getSessions(comp.id)
        setSessions(sess)
        if (sess.length > 0) setActiveSessionId(sess[0].id)
        
        // Load assigned admins
        const { data: adm } = await createBrowserClient()
          .from('competition_admins')
          .select('id, profile_id, profiles(id, email)')
          .eq('competition_id', comp.id)
        
        const normalized = (adm || []).map((a: any) => ({
          ...a,
          profiles: Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
        })) as AssignedAdmin[]
        
        setAssignedAdmins(normalized)
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

  // NEW: Fetch all admins when opening Admin view
  useEffect(() => {
    if (isAdminView && isSuper) {
      import('@/features/competitions/actions/assign-admin').then(m => m.getAllAdminsAction().then(setAllAdmins))
    }
  }, [isAdminView, isSuper])

  const handleAssignAdmin = async (profileId: string) => {
    if (!competition) return
    setProcessing(true)
    try {
      const { assignAdminAction } = await import('@/features/competitions/actions/assign-admin')
      await assignAdminAction(profileId, competition.id)
      alert('Administrador asignado correctamente.')
      window.location.reload()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPass || !competition) return
    setProcessing(true)
    
    try {
      const { createAdminAction } = await import('@/features/competitions/actions/create-admin')
      const result = await createAdminAction(newAdminEmail, newAdminPass, competition.id)
      
      if (result.success) {
        alert(result.message || 'Administrador creado y asignado con éxito.')
        setNewAdminEmail('')
        setNewAdminPass('')
        window.location.reload()
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateScore = async (inscriptionId: string, app: Apparatus, val: number) => {
    const { success } = await service.updateScore(inscriptionId, app, val)
    if (success) {
      setScores(prev => ({ 
        ...prev, 
        [inscriptionId]: { ...prev[inscriptionId], [app]: val }
      }))
    } else {
      alert('Error guardando la nota en Supabase')
    }
  }

  const handleBack = () => {
    router.push('/admin')
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
        await processProgramAction(competition.id, base64)
        alert('¡Programa procesado con éxito! Se han creado las categorías y gimnastas.')
        window.location.reload()
      }
    } catch (err) {
      alert('Error procesando programa')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', fontWeight: 'bold' }}>Cargando datos reales...</div>
  if (!competition) return <div style={{ padding: 40, textAlign: 'center' }}>Competición no encontrada.</div>

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const activePromotion = promotions.find((p) => p.id === activePromotionId)
  const apparatusList: Apparatus[] = activePromotion?.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

  const filteredAllAdmins = allAdmins.filter(a => 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !assignedAdmins.some(assigned => assigned.profile_id === a.id)
  )

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
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
               <label className="gs-btn-secondary" style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: processing ? 'default' : 'pointer', opacity: processing ? 0.5 : 1 }}>
                {processing ? 'Procesando...' : 'Subir programa (AI)'}
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={processing} />
              </label>
              
              {isSuper && (
                <button 
                  className={`gs-btn-${isAdminView ? 'primary' : 'secondary'}`}
                  style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14 }}
                  onClick={() => setIsAdminView(!isAdminView)}
                >
                  {isAdminView ? '← Volver a Mesa' : 'Gestionar Admins'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="gs-container" style={{ padding: '32px 16px' }}>
          {/* Jornada & Ubicación */}
        {isAdminView ? (
          <div className="gs-container" style={{ padding: '32px 16px', maxWidth: 650, margin: '0 auto' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {/* Left: Search & Assign Existing */}
                <div>
                   <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Buscar Administrador</h2>
                   
                   <div style={{ position: 'relative', marginBottom: 20 }}>
                     <input 
                      className="gs-input" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Buscar por email o nombre..." 
                      style={{ paddingLeft: 40 }}
                     />
                     <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
                      {filteredAllAdmins.map(a => (
                        <div key={a.id} className="gs-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ lineHeight: 1.2 }}>
                             <div style={{ fontWeight: 700, fontSize: 13 }}>{a.email.split('@')[0]}</div>
                             <div style={{ fontSize: 11, color: 'var(--gs-muted)' }}>{a.email}</div>
                           </div>
                           <button 
                             className="gs-btn-control" 
                             style={{ padding: '4px 12px', fontSize: 11 }}
                             disabled={processing}
                             onClick={() => handleAssignAdmin(a.id)}
                           >
                            Asignar
                           </button>
                        </div>
                      ))}
                      {filteredAllAdmins.length === 0 && (
                        <p style={{ fontSize: 13, color: 'var(--gs-muted)', textAlign: 'center', padding: 20 }}>No se encontraron administradores disponibles.</p>
                      )}
                   </div>
                </div>

                {/* Right: Create NEW if not exists */}
                <div style={{ borderLeft: '1px solid var(--gs-border)', paddingLeft: 32 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Nuevo Administrador</h2>
                    <div className="gs-card" style={{ padding: '24px' }}>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--gs-muted)' }}>EMAIL</label>
                          <input className="gs-input" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="admin@evento.com" />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--gs-muted)' }}>CONTRASEÑA</label>
                          <input className="gs-input" type="password" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} placeholder="••••••••" />
                        </div>
                        <button 
                          className="gs-btn-primary" 
                          style={{ width: '100%', justifyContent: 'center' }}
                          disabled={processing}
                          onClick={handleCreateAdmin}
                        >
                          Crear y Asignar
                        </button>
                    </div>
                </div>
             </div>

             {/* Bottom: Current Admins for THIS event */}
             <div style={{ marginTop: 60, paddingTop: 32, borderTop: '2px solid var(--gs-border)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111', textTransform: 'uppercase', marginBottom: 20 }}>
                  Administradores de este Evento
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {assignedAdmins.map(a => (
                    <div key={a.id} className="gs-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.profiles?.email}</div>
                      <div className="gs-badge gs-badge-female" style={{ padding: '2px 8px', fontSize: 9 }}>ASIGNADO</div>
                    </div>
                  ))}
                  {assignedAdmins.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--gs-muted)', padding: 20, gridColumn: '1/-1' }}>No hay administradores específicos asignados.</p>
                  )}
                </div>
             </div>
          </div>
        ) : (
          <div className="gs-container" style={{ padding: '32px 16px' }}>
            {/* Jornada & Ubicación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gs-text)' }}>
                Jornada
              </span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(competition.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', textDecorationLine: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '4px' }}
              >
                {competition.location}
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

            {/* Promotions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {promotions.map((prom) => {
                const isActive = activePromotionId === prom.id
                const currentApparatus = prom.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

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
                            {currentApparatus.map(app => (
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
                            {isActive ? 'Cerrar ↑' : 'Gestionar →'}
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
                                  {currentApparatus.map(app => (
                                    <th key={app} style={{ padding: '10px', textAlign: 'center' }}>
                                      <div style={{ display: 'flex', justifyContent: 'center' }} title={APPARATUS_NAMES[app]}>
                                        <img src={APPARATUS_ICONS[app]} alt={app} style={{ height: 16, opacity: 0.6 }} />
                                      </div>
                                    </th>
                                  ))}
                                  <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rankings.map((entry) => {
                                  const key = entry.inscriptionId
                                  const entryOverrides = scores[key] ?? {}
                                  const total = computeTotal(entry, currentApparatus, entryOverrides)

                                  return (
                                    <tr key={key} style={{ borderBottom: '1px solid var(--gs-border)' }}>
                                      <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>{entry.gymnastName}</td>
                                      {currentApparatus.map(app => {
                                        const scoreKey = `${key}-${app}`
                                        const original = getScore(entry, app)
                                        const current = entryOverrides[app] ?? original
                                        const isEditing = editingScore === scoreKey

                                        return (
                                          <td key={app} style={{ textAlign: 'center', padding: '12px 6px' }}>
                                            {isEditing ? (
                                              <input
                                                type="number"
                                                step="0.05"
                                                className="gs-input"
                                                defaultValue={current}
                                                autoFocus
                                                style={{ width: 60, height: 32, padding: '0 4px', textAlign: 'center', fontSize: 13 }}
                                                onBlur={async (e) => {
                                                  const val = parseFloat(e.target.value)
                                                  if (!isNaN(val)) {
                                                    handleUpdateScore(key, app, val)
                                                  }
                                                  setEditingScore(null)
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.target as any).blur()}
                                              />
                                            ) : (
                                              <button 
                                                onClick={() => setEditingScore(scoreKey)}
                                                style={{ 
                                                  background: 'transparent', 
                                                  border: 'none', 
                                                  cursor: 'pointer', 
                                                  fontWeight: 500, 
                                                  color: 'var(--gs-text)', 
                                                  fontSize: 13,
                                                  fontVariantNumeric: 'tabular-nums'
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
              {promotions.length === 0 && (
                <div className="gs-card" style={{ padding: '64px 0', textAlign: 'center' }}>
                  <p style={{ color: 'var(--gs-muted)', fontSize: 15 }}>Carga un programa PDF para sincronizar las categorías automáticamente.</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
