'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { createClient } from '@/lib/supabase/client'
import * as service from '@/features/competitions/services/competition-service'

export default function CreateCompetitionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuper, setIsSuper] = useState(false)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/superadmin')
        return
      }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (prof?.role !== 'superadmin') {
        router.push('/superadmin')
        return
      }
      setIsSuper(true)
    }
    check()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { success, data, error } = await service.createCompetition(name, location, date)
    if (success && data) {
      router.push(`/admin/competiciones/${data.slug}`)
    } else {
      alert('Error: ' + error?.message)
      setLoading(false)
    }
  }

  if (!isSuper) return null

  return (
    <div style={{ minHeight: '100vh', flexDirection: 'column', background: 'var(--gs-bg)', display: 'flex' }}>
      <Navbar isAdmin onBack={() => router.push('/superadmin')} />
      <main style={{ flex: 1, padding: '40px 16px' }}>
        <div className="gs-container" style={{ maxWidth: 500 }}>
          <div className="gs-card" style={{ padding: '32px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Nuevo Evento</h1>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gs-muted)' }}>
                  NOMBRE DEL EVENTO
                </label>
                <input 
                  className="gs-input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="Ej: Copa de Invierno de Gimnasia"
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gs-muted)' }}>
                  UBICACIÓN
                </label>
                <input 
                  className="gs-input" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  required 
                  placeholder="Almería, Pabellón Central"
                />
              </div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--gs-muted)' }}>
                  FECHA
                </label>
                <input 
                  type="date"
                  className="gs-input" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="gs-btn-primary" 
                style={{ width: '100%', justifyContent: 'center', height: 48 }}
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Competición'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
