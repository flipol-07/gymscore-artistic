'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    
    setLoading(true)
    setError('')
    
    try {
      const comp = await service.getCompetitionByPassword(password)
      if (comp) {
        // Automatically authenticate for this competition in this session
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`event_auth_${comp.id}`, 'true')
        }
        router.push(`/admin/competiciones/${comp.slug}`)
      } else {
        setError('Contraseña incorrecta o evento no vigente.')
        setLoading(false)
      }
    } catch (err) {
      setError('Error al conectar con el servidor.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="gs-card" style={{ padding: '48px 40px', textAlign: 'center' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                background: 'var(--gs-primary-light)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <span style={{ fontSize: 24 }}>🔑</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--gs-text)', marginBottom: 8, letterSpacing: '-0.04em' }}>
                CONTROL DE MESA
              </h1>
              <p style={{ color: 'var(--gs-muted)', fontSize: 13, fontWeight: 500 }}>
                Introduce la contraseña de tu evento para entrar a evaluación.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 24 }}>
                <input
                  type="password"
                  className="gs-input"
                  placeholder="Contraseña del evento"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ height: 52, textAlign: 'center', fontSize: 18, fontWeight: 600, borderRadius: 12 }}
                  required
                  autoFocus
                />
                {error && (
                  <p style={{ fontSize: 13, color: '#ef4444', marginTop: 12, fontWeight: 600 }}>{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="gs-btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', height: 52, borderRadius: 12, fontSize: 16, fontWeight: 700 }}
              >
                {loading ? 'Verificando...' : 'Acceder al Evento'}
              </button>
            </form>
            
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--gs-border)' }}>
              <p style={{ fontSize: 12, color: 'var(--gs-muted)', lineHeight: 1.5 }}>
                Esta es una zona de acceso restringido para personal técnico y evaluadores oficiales.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
