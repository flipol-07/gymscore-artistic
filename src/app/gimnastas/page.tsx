'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import * as service from '@/features/competitions/services/competition-service'
import { Search, ChevronRight, User } from 'lucide-react'

export default function GimnastasSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ name: string; club: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const data = await service.searchGymnasts(query)
      setResults(data)
      setLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 0' }}>
        <div className="gs-container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gs-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              EXPLORAR
            </h2>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 12, letterSpacing: '-0.03em' }}>
              Buscador de Gimnastas y Clubes
            </h1>
            <p style={{ color: 'var(--gs-muted)', maxWidth: 500, margin: '0 auto', fontSize: 15 }}>
              Encuentra el historial de una deportista o busca a todos los participantes de un club en concreto.
            </p>
          </div>

          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 32 }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--gs-muted)' }}>
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Ej: Aida, Gymnastic, Saltos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  borderRadius: 16,
                  border: '1px solid var(--gs-border)',
                  fontSize: 16,
                  fontWeight: 500,
                  outline: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  background: '#fff'
                }}
                className="gs-search-input"
              />
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--gs-muted)', fontSize: 14 }}>
                  Buscando...
                </div>
              )}

              {!loading && results.length > 0 && results.map((g, idx) => (
                <Link 
                  key={idx} 
                  href={`/gimnastas/${encodeURIComponent(g.name)}`}
                  className="gs-card hover:border-blue-200 transition-all"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 12, 
                      background: 'var(--gs-primary-light)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--gs-primary)'
                    }}>
                      <User size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gs-text)' }}>{g.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--gs-muted)' }}>{g.club}</div>
                    </div>
                  </div>
                  <ChevronRight size={20} color="var(--gs-border)" />
                </Link>
              ))}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 20, border: '1px dashed var(--gs-border)' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>No se encontraron resultados</div>
                  <div style={{ fontSize: 14, color: 'var(--gs-muted)' }}>
                    Prueba con otro nombre o revisa la ortografía.
                  </div>
                </div>
              )}

              {query.length < 2 && !loading && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--gs-muted)' }}>
                  <div style={{ fontSize: 14, fontStyle: 'italic' }}>
                    Escribe al menos 2 letras para empezar la búsqueda.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
