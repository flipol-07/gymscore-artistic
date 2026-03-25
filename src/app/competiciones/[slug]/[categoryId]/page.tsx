import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { getCategory, getRankings } from '@/features/competitions/data/demo-data'
import { FEMALE_APPARATUS, MALE_APPARATUS, APPARATUS_NAMES, type Apparatus } from '@/features/competitions/types'
import { RankingsTable } from '@/features/competitions/components/rankings-table'

interface Props {
  params: Promise<{ slug: string; categoryId: string }>
}

export default async function ResultadosPage({ params }: Props) {
  const { slug, categoryId } = await params
  const category = getCategory(categoryId)
  if (!category) notFound()

  const rankings = getRankings(categoryId)
  const apparatus: Apparatus[] = category.gender === 'female' ? FEMALE_APPARATUS : MALE_APPARATUS

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
              <Link href={`/competiciones/${slug}`} style={{ color: 'var(--gs-primary)' }}>
                {category.competitionName}
              </Link>
              {' → '}
              {category.name}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gs-text)', marginBottom: 4 }}>
              {category.name}
            </h1>
            <div style={{ fontSize: 14, color: 'var(--gs-muted)' }}>
              {category.gender === 'female' ? 'Gimnasia Artística Femenina (GAF)' : 'Gimnasia Artística Masculina (GAM)'}
              {' · '}{rankings.length} gimnastas
            </div>
          </div>
        </div>

        {/* Apparatus tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gs-border)' }}>
          <div className="gs-container" style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            <Link
              href={`/competiciones/${slug}/${categoryId}`}
              style={{
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--gs-primary)',
                borderBottom: '2px solid var(--gs-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              General
            </Link>
            {apparatus.map((app) => (
              <Link
                key={app}
                href={`/competiciones/${slug}/${categoryId}/${app}`}
                style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  color: 'var(--gs-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {APPARATUS_NAMES[app]}
              </Link>
            ))}
          </div>
        </div>

        {/* Rankings table */}
        <div className="gs-container" style={{ padding: '24px 16px' }}>
          <div className="gs-card" style={{ overflow: 'hidden' }}>
            <RankingsTable
              rankings={rankings}
              apparatus={apparatus}
              slug={slug}
              categoryId={categoryId}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
