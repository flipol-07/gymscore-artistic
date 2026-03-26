'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  logoHref?: string
  programUrl?: string
  isAdmin?: boolean
  showBack?: boolean
  backHref?: string
  onBack?: () => void
}

export function Navbar({ 
  logoHref = "/", 
  programUrl, 
  isAdmin = false, 
  showBack = false,
  backHref,
  onBack 
}: NavbarProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="gs-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, position: 'relative' }}>
          {/* Top Left: Back or Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {(isAdmin || showBack) ? (
              <button 
                onClick={handleBack}
                className="gs-btn-secondary"
                style={{ width: 36, height: 36, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ←
              </button>
            ) : (
              <Link href={logoHref} style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="GymScore" style={{ height: 40, width: 'auto' }} />
              </Link>
            )}
          </div>

          {/* Center Title (Admin Only) */}
          {isAdmin && (
            <div style={{ 
              position: 'absolute', 
              left: '50%', 
              transform: 'translateX(-50%)',
              fontSize: 13,
              fontWeight: 800,
              color: 'var(--gs-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em'
            }}>
              ADMIN
            </div>
          )}

          {/* Top Right: Navigation & Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <button
                onClick={async () => {
                  const { createClient } = await import('@/lib/supabase/client')
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/admin')
                }}
                className="gs-btn-secondary"
                style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 600, color: '#ef4444' }}
              >
                Cerrar Sesión
              </button>
            )}
            {!isAdmin ? (
              <>
                <Link 
                  href="/" 
                  className="gs-btn-secondary" 
                  style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 600 }}
                >
                  Inicio
                </Link>
                <Link 
                  href="/admin" 
                  className="gs-btn-control"
                  style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 600 }}
                >
                  Control
                </Link>
              </>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="gs-btn-secondary"
                style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 13, fontWeight: 600 }}
              >
                Inicio
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
