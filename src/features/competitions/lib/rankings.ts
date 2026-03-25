import type { RankingEntry, Apparatus } from '@/features/competitions/types'

export function getApparatusScoreFromRanking(entry: any, apparatus: Apparatus): number {
  switch (apparatus) {
    case 'vault': return entry.vaultScore || 0
    case 'bars': return entry.barsScore || 0
    case 'beam': return entry.beamScore || 0
    case 'floor': return entry.floorScore || 0
    case 'pommel': return entry.pommelScore || 0
    case 'rings': return entry.ringsScore || 0
    case 'p_bars': return entry.p_barsScore || 0
    case 'h_bar': return entry.h_barScore || 0
    default: return 0
  }
}
