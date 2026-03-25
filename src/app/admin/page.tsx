'use client'

import Link from 'next/link'
import { useState } from 'react'
import { getCompetitions } from '@/features/competitions/data/demo-data'
import type { Competition } from '@/features/competitions/types'

function StatusBadge({ status }: { status: Competition['status'] }) {
  if (status === 'active') return <span className="gs-badge gs-badge-live">● En directo</span>
  if (status === 'finished') return <span className="gs-badge gs-badge-finished">Finalizado</span>
  return <span className="gs-badge gs-badge-finished">Borrador</span>
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const competitions = getCompetitions()
  const active = competitions.filter((c) => c.status === 'active')
  const rest = competitions.filter((c) => c.status !== 'active')

  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gs-bg)', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gs-text)', marginBottom: 4 }}>
              gym<span style={{ color: 'var(--gs-primary)' }}>score</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--gs-muted)' }}>Mesa de Control</div>
          </div>

          <div className="gs-card" style={{ padding: 24 }}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (password === 'admin123') {
                  setLoggedIn(true)
                  setError('')
                } else {
                  setError('Contraseña incorrecta')
                }
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--gs-text)' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  className="gs-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {error && (
                <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</p>
              )}
              <button
                type="submit"
                className="gs-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}
              >
                Acceder
              </button>
            </form>
            <p style={{ fontSize: 12, color: 'var(--gs-muted)', textAlign: 'center', marginTop: 16 }}>
              Demo: contraseña <strong>admin123</strong>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      {/* Admin nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="gs-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--gs-text)' }}>
            gym<span style={{ color: 'var(--gs-primary)' }}>score</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--gs-muted)', fontWeight: 400 }}>Mesa de Control</span>
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--gs-muted)' }}>Ver sitio →</Link>
            <button
              onClick={() => setLoggedIn(false)}
              className="gs-btn-secondary"
              style={{ fontSize: 13 }}
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <div className="gs-container" style={{ padding: '24px 16px' }}>

          {/* Active competitions */}
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                Eventos activos
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {active.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/admin/competiciones/${comp.slug}`}
                    className="gs-card"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: 12 }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{comp.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--gs-muted)', marginTop: 2 }}>
                        {comp.location} · {comp.categoryCount} categorías
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <StatusBadge status={comp.status} />
                      <span style={{ color: 'var(--gs-primary)', fontSize: 13, fontWeight: 500 }}>Abrir →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All competitions */}
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              Todas las competiciones
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rest.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/admin/competiciones/${comp.slug}`}
                  className="gs-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', gap: 12 }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{comp.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--gs-muted)', marginTop: 2 }}>
                      {comp.location} · {comp.date} · {comp.categoryCount} categorías
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <StatusBadge status={comp.status} />
                    <span style={{ color: 'var(--gs-muted)', fontSize: 13 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
