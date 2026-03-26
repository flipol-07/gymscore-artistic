export type Gender = 'female' | 'male'
export type CompetitionStatus = 'draft' | 'active' | 'finished'
export type PromotionStatus = 'pending' | 'active' | 'finished'
export type Apparatus = 'vault' | 'bars' | 'beam' | 'floor' | 'pommel' | 'rings' | 'p_bars' | 'h_bar'

// Jornada: agrupación temporal dentro de un evento
export interface CompetitionSession {
  id: string
  competitionId: string
  name: string   // "Jornada 1", "Jornada Mañana", etc.
  date: string
  location?: string
  order: number
}

// Promoción: agrupación de categorías dentro de una jornada
export interface Promotion {
  id: string
  sessionId: string
  competitionId: string
  categoryId: string  // links to existing Category
  name: string        // "Promoción 4", "Escolar Cadete", etc.
  gender: Gender
  gymnast_count: number
  status: PromotionStatus
}

export interface Club {
  id: string
  name: string
  flagUrl?: string
}

export interface Competition {
  id: string
  name: string
  slug: string
  location: string
  date: string
  status: CompetitionStatus
  programUrl?: string
  categoryCount?: number
}

export interface Category {
  id: string
  competitionId: string
  name: string
  gender: Gender
  session: number
  sortOrder: number
  gymnastCount?: number
}

export interface Gymnast {
  id: string
  fullName: string
  clubId?: string
}

export interface Inscription {
  id: string
  gymnastId: string
  categoryId: string
  clubId?: string
}

export interface Score {
  id: string
  inscriptionId: string
  apparatus: Apparatus
  dScore: number
  eScore: number
  penalty: number
  finalScore: number
}

export interface RankingEntry {
  position: number
  inscriptionId: string
  gymnastName: string
  clubName: string
  clubFlag?: string
  vaultScore: number
  barsScore: number
  beamScore: number
  floorScore: number
  totalScore: number
}

export interface ApparatusScore {
  position: number
  gymnastName: string
  clubName: string
  clubFlag?: string
  dScore: number
  eScore: number
  penalty: number
  finalScore: number
}

export interface GymnastHistory {
  competitionName: string
  competitionSlug: string
  categoryName: string
  categoryId: string
  date: string
  clubName: string
  vaultScore: number
  barsScore: number
  beamScore: number
  floorScore: number
  totalScore: number
}

export const FEMALE_APPARATUS: Apparatus[] = ['vault', 'bars', 'beam', 'floor']
export const MALE_APPARATUS: Apparatus[] = ['floor', 'pommel', 'rings', 'vault', 'p_bars', 'h_bar']

export const APPARATUS_NAMES: Record<Apparatus, string> = {
  vault: 'Salto',
  bars: 'Paralelas',
  beam: 'Barra',
  floor: 'Suelo',
  pommel: 'Caballo',
  rings: 'Anillas',
  p_bars: 'Paralelas',
  h_bar: 'Barra fija',
}

export const APPARATUS_ICONS: Record<Apparatus, string> = {
  vault: '/icons/apparatus/vault.png',
  bars: '/icons/apparatus/bars.png',
  beam: '/icons/apparatus/beam.png',
  floor: '/icons/apparatus/floor.png',
  pommel: 'CircleDashed',
  rings: 'Circle',
  p_bars: 'Columns',
  h_bar: 'Maximize2',
}
