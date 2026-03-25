import Link from 'next/link'
import { APPARATUS_NAMES, APPARATUS_ICONS, type RankingEntry, type Apparatus } from '@/features/competitions/types'

interface RankingsTableProps {
  rankings: RankingEntry[]
  apparatus: Apparatus[]
  slug: string
  categoryId: string
}

function getApparatusScore(entry: RankingEntry, app: Apparatus): number {
  switch (app) {
    case 'vault': return entry.vaultScore
    case 'bars': return entry.barsScore
    case 'beam': return entry.beamScore
    case 'floor': return entry.floorScore
    default: return 0
  }
}

function MedalBadge({ pos }: { pos: number }) {
  const colors: Record<number, string> = { 1: '#d4af37', 2: '#a0a0a0', 3: '#cd7f32' }
  if (pos > 3) return <span style={{ fontWeight: 600, fontSize: 14, color: '#666' }}>{pos}</span>
  return (
    <span style={{ fontWeight: 700, fontSize: 14, color: colors[pos] }}>
      {pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}
    </span>
  )
}

export function RankingsTable({ rankings, apparatus, slug, categoryId }: RankingsTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="gs-table" style={{ minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ width: 48 }}>#</th>
            <th>Gimnasta</th>
            <th>Club</th>
            {apparatus.map((app) => (
              <th key={app} style={{ textAlign: 'center' }}>
                <Link
                  href={`/competiciones/${slug}/${categoryId}/${app}`}
                  style={{ display: 'flex', justifyContent: 'center' }}
                  title={APPARATUS_NAMES[app]}
                >
                  <img
                    src={APPARATUS_ICONS[app]}
                    alt={APPARATUS_NAMES[app]}
                    style={{ height: 24, width: 'auto', opacity: 0.8 }}
                  />
                </Link>
              </th>
            ))}
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((entry) => (
            <tr key={entry.inscriptionId}>
              <td><MedalBadge pos={entry.position} /></td>
              <td>
                <Link
                  href={`/gimnastas/${encodeURIComponent(entry.gymnastName)}`}
                  style={{ fontWeight: 500, color: 'var(--gs-text)' }}
                >
                  {entry.gymnastName}
                </Link>
              </td>
              <td style={{ color: 'var(--gs-muted)', fontSize: 13 }}>{entry.clubName}</td>
              {apparatus.map((app) => (
                <td key={app} style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 14 }}>
                  {getApparatusScore(entry, app).toFixed(3)}
                </td>
              ))}
              <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
                {entry.totalScore.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
