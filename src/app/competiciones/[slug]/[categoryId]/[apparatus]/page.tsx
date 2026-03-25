import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCategory, getApparatusRankings } from '@/features/competitions/data/demo-data'
import { APPARATUS_NAMES, APPARATUS_ICONS, type Apparatus } from '@/features/competitions/types'

interface Props {
  params: Promise<{ slug: string; categoryId: string; apparatus: string }>
}

export default async function AparatoPage({ params }: Props) {
  const { slug, categoryId, apparatus } = await params
  const category = getCategory(categoryId)
  if (!category) notFound()

  const apparatusKey = apparatus as Apparatus
  const apparatusName = APPARATUS_NAMES[apparatusKey]
  if (!apparatusName) notFound()

  const scores = getApparatusRankings(categoryId, apparatusKey)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gs-bg)' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)', padding: '28px 0' }}>
          <div className="gs-container">
            <div style={{ fontSize: 13, color: 'var(--gs-muted)', marginBottom: 8 }}>
              <Link href="/" style={{ color: 'var(--gs-primary)' }}>Inicio</Link>
              {' → '}
              <Link href={`/competiciones/${slug}`} style={{ color: 'var(--gs-primary)' }}>{category.competitionName}</Link>
              {' → '}
              <Link href={`/competiciones/${slug}/${categoryId}`} style={{ color: 'var(--gs-primary)' }}>{category.name}</Link>
              {' → '}
              {apparatusName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <img
                src={APPARATUS_ICONS[apparatusKey]}
                alt={apparatusName}
                style={{ height: 32, width: 'auto' }}
              />
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>
                {apparatusName} — {category.name}
              </h1>
            </div>
            <div style={{ fontSize: 14, color: 'var(--gs-muted)' }}>
              {scores.length} participantes · Mejor nota: {scores[0]?.finalScore.toFixed(3) ?? '—'}
            </div>
          </div>
        </div>

        {/* Scores table */}
        <div className="gs-container" style={{ padding: '24px 16px' }}>
          <div className="gs-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="gs-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Gimnasta</th>
                    <th>Club</th>
                    <th style={{ textAlign: 'center' }}>Dificultad (D)</th>
                    <th style={{ textAlign: 'center' }}>Ejecución (E)</th>
                    <th style={{ textAlign: 'center' }}>Penalización</th>
                    <th style={{ textAlign: 'right' }}>Nota Final</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--gs-muted)' }}>{score.position}</td>
                      <td style={{ fontWeight: 500 }}>{score.gymnastName}</td>
                      <td style={{ fontSize: 13, color: 'var(--gs-muted)' }}>{score.clubName}</td>
                      <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>{score.dScore.toFixed(3)}</td>
                      <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>{score.eScore.toFixed(3)}</td>
                      <td style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 14, color: score.penalty > 0 ? '#ef4444' : 'var(--gs-muted)' }}>
                        {score.penalty > 0 ? `-${score.penalty.toFixed(1)}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
                        {score.finalScore.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link
              href={`/competiciones/${slug}/${categoryId}`}
              className="gs-btn-secondary"
              style={{ fontSize: 13 }}
            >
              ← Volver a clasificación general
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
