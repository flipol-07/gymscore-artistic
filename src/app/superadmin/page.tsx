'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { createClient } from '@/lib/supabase/client'
import * as service from '@/features/competitions/services/competition-service'
import type { Competition } from '@/features/competitions/types'

export default function SuperAdminPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<{ role: string } | null>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [hasNoUsers, setHasNoUsers] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if DB is empty to allow first sign up
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      setHasNoUsers(count === 0)
      
      if (session) {
        setUser(session.user)
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          
        if (prof?.role === 'superadmin') {
          setProfile(prof)
          const all = await service.getCompetitions()
          setCompetitions(all)
        } else {
          // If not superadmin, sign out
          await supabase.auth.signOut()
          setUser(null)
          setError('Solo los superadministradores pueden acceder aquí.')
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')
    
    if (isRegistering) {
      const { error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) {
        setError(authError.message)
        setAuthLoading(false)
        return
      }
      alert('¡Cuenta creada! El primer usuario es Superadmin por defecto.')
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Email o contraseña incorrectos')
        setAuthLoading(false)
        return
      }
    }
    window.location.reload()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontWeight: 700, color: 'var(--gs-muted)' }}>Autenticando...</p>
    </div>
  )

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div className="gs-card" style={{ padding: '40px 32px' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--gs-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Super Admin
                </h1>
                <div style={{ height: 4, width: 40, background: 'var(--gs-primary)', margin: '0 auto', borderRadius: 2 }}></div>
              </div>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Email</label>
                  <input type="email" className="gs-input" placeholder="admin@gymscore.es" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>Contraseña</label>
                  <input type="password" className="gs-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginTop: 8, fontWeight: 500 }}>{error}</p>}
                </div>
                <button type="submit" className="gs-btn-primary" disabled={authLoading} style={{ width: '100%', justifyContent: 'center', height: 48, borderRadius: 12, fontSize: 16, fontWeight: 700 }}>
                  {authLoading ? 'Procesando...' : (isRegistering ? 'Crear Superadmin' : 'Acceder')}
                </button>
              </form>

              {hasNoUsers && !isRegistering && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button onClick={() => setIsRegistering(true)} style={{ background: 'none', border: 'none', color: 'var(--gs-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Primer acceso: Crear Superadmin</button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar isAdmin onBack={handleLogout} />
      <main style={{ flex: 1 }}>
        <div className="gs-container" style={{ padding: '40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontSize: 13, fontWeight: 800, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Panel de Superadmin</h1>
              <p style={{ fontSize: 14, color: 'var(--gs-muted)' }}>Identificado como: <strong>{user.email}</strong></p>
            </div>
            <button className="gs-btn-primary" onClick={() => router.push('/admin/competiciones/nuevo')}>+ Crear Evento</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600, margin: '0 auto' }}>
            {competitions.length === 0 ? (
              <div className="gs-card" style={{ padding: '64px 0', textAlign: 'center' }}>
                <p style={{ color: 'var(--gs-muted)', fontSize: 15 }}>No hay competiciones en el sistema.</p>
              </div>
            ) : (
              competitions.map((comp) => (
                <Link key={comp.id} href={`/admin/competiciones/${comp.slug}`} className="gs-card" style={{ display: 'block', padding: '24px 32px', textDecoration: 'none', transition: 'transform 0.2s', position: 'relative' }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 900, fontSize: 24, color: 'var(--gs-text)', marginBottom: 4, letterSpacing: '-0.02em' }}>{comp.name}</div>
                    <div style={{ fontSize: 14, color: 'var(--gs-muted)', fontWeight: 500 }}>
                      {comp.categoryCount} categorías • {comp.isPublished ? '🔴 Publicado' : '⚪ Borrador'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase' }}>{comp.date}</div>
                    <div className="gs-btn-secondary" style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>GESTIONAR →</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
