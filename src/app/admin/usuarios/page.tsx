'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { createClient } from '@/lib/supabase/client'
import * as service from '@/features/competitions/services/competition-service'
import type { Competition } from '@/features/competitions/types'

export default function UsersAdminPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [isSuper, setIsSuper] = useState(false)
  const [emailToInvite, setEmailToInvite] = useState('')
  const [selectedCompId, setSelectedCompId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin')
        return
      }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (prof?.role !== 'superadmin') {
        router.push('/admin')
        return
      }
      setIsSuper(true)
      
      const [comps, users] = await Promise.all([
        service.getCompetitions(),
        supabase.from('profiles').select('*').neq('role', 'superadmin')
      ])
      setCompetitions(comps)
      setProfiles(users.data || [])
    }
    check()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { success, error } = await service.inviteAdmin(emailToInvite, selectedCompId)
    if (success) {
      alert('¡Asignado con éxito!')
      setEmailToInvite('')
      setSelectedCompId('')
    } else {
      alert('Error: ' + error)
    }
    setLoading(false)
  }

  if (!isSuper) return null

  return (
    <div style={{ minHeight: '100vh', flexDirection: 'column', background: 'var(--gs-bg)', display: 'flex' }}>
      <Navbar isAdmin onBack={() => router.push('/admin')} />
      <main style={{ flex: 1, padding: '40px 16px' }}>
        <div className="gs-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            
            {/* Assign Form */}
            <div className="gs-card" style={{ padding: '32px' }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Asignar Administrador</h1>
              <form onSubmit={handleInvite}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gs-muted)' }}>
                    EMAIL DEL ADMINISTRADOR
                  </label>
                  <input 
                    className="gs-input" 
                    type="email"
                    value={emailToInvite} 
                    onChange={e => setEmailToInvite(e.target.value)} 
                    required 
                    placeholder="admin@ejemplo.com"
                  />
                  <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Note: El usuario debe haber iniciado sesión al menos una vez para aparecer en el sistema.</p>
                </div>
                
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gs-muted)' }}>
                    EVENTO ASIGNADO
                  </label>
                  <select 
                    className="gs-input"
                    value={selectedCompId}
                    onChange={e => setSelectedCompId(e.target.value)}
                    required
                  >
                    <option value="">Selecciona un evento...</option>
                    {competitions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="gs-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', height: 48 }}
                  disabled={loading}
                >
                  {loading ? 'Asignando...' : 'Asignar Acceso'}
                </button>
              </form>
            </div>

            {/* Existing Users List */}
            <div className="gs-card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Usuarios en el Sistema</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {profiles.map(p => (
                  <div key={p.id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--gs-border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--gs-text)', fontSize: 14 }}>{p.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--gs-muted)' }}>Rol: {p.role}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
