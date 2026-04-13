import { Competition, CompetitionSession, Promotion, RankingEntry } from '../types'

export const DEMO_COMPETITIONS: Competition[] = [
  { id: 'comp-1', name: 'Trofeo Kinetic Artistic 2024', slug: 'trofeo-kinetic-2024', location: 'Barcelona, España', date: '2024-05-15', status: 'active', categoryCount: 5, isPublished: true },
  { id: 'comp-2', name: 'Copa Catalana Base', slug: 'copa-catalana-base', location: 'Girona, España', date: '2024-06-10', status: 'finished', categoryCount: 5, isPublished: true },
  { id: 'comp-3', name: 'Campeonato Autonómico GAF', slug: 'campeonato-gaf', location: 'Vilanova i la Geltrú', date: '2024-04-20', status: 'finished', categoryCount: 6, isPublished: true },
  { id: 'comp-4', name: 'Open Gym Artistic', slug: 'open-gym-2024', location: 'Madrid', date: '2024-07-02', status: 'active', categoryCount: 4, isPublished: false },
  { id: 'comp-5', name: 'Memorial Joaquín Blume', slug: 'blume-2024', location: 'Barcelona', date: '2024-11-15', status: 'draft', categoryCount: 5, isPublished: false },
]

export const DEMO_SESSIONS: CompetitionSession[] = [
  { id: 'ses-1-1', competitionId: 'comp-1', name: 'Jornada Sábado Mañana', date: '2024-05-15', order: 1 },
  { id: 'ses-1-2', competitionId: 'comp-1', name: 'Jornada Sábado Tarde', date: '2024-05-15', order: 2 },
  { id: 'ses-2-1', competitionId: 'comp-2', name: 'Jornada Mañana', date: '2024-06-10', order: 1 },
  { id: 'ses-2-2', competitionId: 'comp-2', name: 'Jornada Tarde', date: '2024-06-10', order: 2 },
  { id: 'ses-2-3', competitionId: 'comp-2', name: 'Jornada Domingo', date: '2024-06-11', order: 3 },
  { id: 'ses-3-1', competitionId: 'comp-3', name: 'Sesión 1', date: '2024-04-20', order: 1 },
  { id: 'ses-3-2', competitionId: 'comp-3', name: 'Sesión 2', date: '2024-04-21', order: 2 },
  { id: 'ses-3-3', competitionId: 'comp-3', name: 'Sesión 3', date: '2024-04-21', order: 3 },
  { id: 'ses-4-1', competitionId: 'comp-4', name: 'Día 1', date: '2024-07-02', order: 1 },
  { id: 'ses-4-2', competitionId: 'comp-4', name: 'Día 2', date: '2024-07-03', order: 2 },
  { id: 'ses-5-1', competitionId: 'comp-5', name: 'Fase Clasificatoria', date: '2024-11-15', order: 1 },
  { id: 'ses-5-2', competitionId: 'comp-5', name: 'Finales Aparatos 1', date: '2024-11-16', order: 2 },
  { id: 'ses-5-3', competitionId: 'comp-5', name: 'Finales Aparatos 2', date: '2024-11-17', order: 3 },
]

export const DEMO_PROMOTIONS: Promotion[] = [
  { id: 'prom-1-1', sessionId: 'ses-1-1', competitionId: 'comp-1', categoryId: 'cat-1-1', name: 'Base 1', gender: 'female', gymnast_count: 12, status: 'finished' },
  { id: 'prom-1-2', sessionId: 'ses-1-1', competitionId: 'comp-1', categoryId: 'cat-1-2', name: 'Base 2', gender: 'female', gymnast_count: 15, status: 'finished' },
  { id: 'prom-1-3', sessionId: 'ses-1-2', competitionId: 'comp-1', categoryId: 'cat-1-3', name: 'Base 3', gender: 'female', gymnast_count: 10, status: 'active' },
  { id: 'prom-1-4', sessionId: 'ses-1-2', competitionId: 'comp-1', categoryId: 'cat-1-4', name: 'Vía Olímpica 1', gender: 'female', gymnast_count: 8, status: 'pending' },
  { id: 'prom-2-1', sessionId: 'ses-2-1', competitionId: 'comp-2', categoryId: 'cat-2-1', name: 'Nivel 1', gender: 'female', gymnast_count: 20, status: 'finished' },
  { id: 'prom-2-2', sessionId: 'ses-2-1', competitionId: 'comp-2', categoryId: 'cat-2-2', name: 'Nivel 2', gender: 'female', gymnast_count: 18, status: 'finished' },
  { id: 'prom-2-3', sessionId: 'ses-2-2', competitionId: 'comp-2', categoryId: 'cat-2-3', name: 'Nivel 3', gender: 'female', gymnast_count: 15, status: 'finished' },
  { id: 'prom-2-4', sessionId: 'ses-2-2', competitionId: 'comp-2', categoryId: 'cat-2-4', name: 'Escolar Cadete', gender: 'female', gymnast_count: 11, status: 'finished' },
  { id: 'prom-2-5', sessionId: 'ses-2-3', competitionId: 'comp-2', categoryId: 'cat-2-5', name: 'Escolar Senior', gender: 'female', gymnast_count: 10, status: 'finished' },
  { id: 'prom-3-1', sessionId: 'ses-3-1', competitionId: 'comp-3', categoryId: 'cat-3-1', name: 'Alevín Copa', gender: 'female', gymnast_count: 12, status: 'finished' },
  { id: 'prom-3-2', sessionId: 'ses-3-1', competitionId: 'comp-3', categoryId: 'cat-3-2', name: 'Infantil Copa', gender: 'female', gymnast_count: 10, status: 'finished' },
  { id: 'prom-3-3', sessionId: 'ses-3-2', competitionId: 'comp-3', categoryId: 'cat-3-3', name: 'Cadete Copa', gender: 'female', gymnast_count: 10, status: 'finished' },
  { id: 'prom-3-4', sessionId: 'ses-3-2', competitionId: 'comp-3', categoryId: 'cat-3-4', name: 'Junior Copa', gender: 'female', gymnast_count: 11, status: 'finished' },
  { id: 'prom-3-5', sessionId: 'ses-3-3', competitionId: 'comp-3', categoryId: 'cat-3-5', name: 'Senior Copa', gender: 'female', gymnast_count: 10, status: 'finished' },
  { id: 'prom-3-6', sessionId: 'ses-3-3', competitionId: 'comp-3', categoryId: 'cat-3-6', name: 'Absoluta', gender: 'female', gymnast_count: 10, status: 'finished' },
  { id: 'prom-4-1', sessionId: 'ses-4-1', competitionId: 'comp-4', categoryId: 'cat-4-1', name: 'Prebenjamín', gender: 'female', gymnast_count: 10, status: 'finished' },
  { id: 'prom-4-2', sessionId: 'ses-4-1', competitionId: 'comp-4', categoryId: 'cat-4-2', name: 'Benjamín', gender: 'female', gymnast_count: 11, status: 'active' },
  { id: 'prom-4-3', sessionId: 'ses-4-2', competitionId: 'comp-4', categoryId: 'cat-4-3', name: 'Alevín', gender: 'female', gymnast_count: 11, status: 'pending' },
  { id: 'prom-4-4', sessionId: 'ses-4-2', competitionId: 'comp-4', categoryId: 'cat-4-4', name: 'Infantil-Cadete', gender: 'female', gymnast_count: 11, status: 'pending' },
  { id: 'prom-5-1', sessionId: 'ses-5-1', competitionId: 'comp-5', categoryId: 'cat-5-1', name: 'Base 1', gender: 'female', gymnast_count: 8, status: 'pending' },
  { id: 'prom-5-2', sessionId: 'ses-5-1', competitionId: 'comp-5', categoryId: 'cat-5-2', name: 'Base 2', gender: 'female', gymnast_count: 9, status: 'pending' },
  { id: 'prom-5-3', sessionId: 'ses-5-2', competitionId: 'comp-5', categoryId: 'cat-5-3', name: 'Base 3', gender: 'female', gymnast_count: 8, status: 'pending' },
  { id: 'prom-5-4', sessionId: 'ses-5-2', competitionId: 'comp-5', categoryId: 'cat-5-4', name: 'Alevín', gender: 'female', gymnast_count: 10, status: 'pending' },
  { id: 'prom-5-5', sessionId: 'ses-5-3', competitionId: 'comp-5', categoryId: 'cat-5-5', name: 'Infantil', gender: 'female', gymnast_count: 8, status: 'pending' },
]

const zeroMale = { pommelScore: 0, ringsScore: 0, p_barsScore: 0, h_barScore: 0 }
export const DEMO_RANKINGS: RankingEntry[] = [
  { position: 1, inscriptionId: 'ins-1', gymnastName: 'Lucía García', clubName: 'C.G. Barcelona', vaultScore: 12.500, barsScore: 11.800, beamScore: 13.200, floorScore: 12.100, totalScore: 49.600, ...zeroMale },
  { position: 2, inscriptionId: 'ins-2', gymnastName: 'Abril Martínez', clubName: 'Salt i Vol', vaultScore: 12.400, barsScore: 12.100, beamScore: 11.500, floorScore: 12.400, totalScore: 48.400, ...zeroMale },
  { position: 3, inscriptionId: 'ins-3', gymnastName: 'Martina Soler', clubName: 'Gimnàstic Osona', vaultScore: 11.800, barsScore: 10.950, beamScore: 12.700, floorScore: 11.900, totalScore: 47.350, ...zeroMale },
  { position: 4, inscriptionId: 'ins-4', gymnastName: 'Sofía Rodríguez', clubName: 'C.G. Barcelona', vaultScore: 12.100, barsScore: 11.200, beamScore: 11.900, floorScore: 11.500, totalScore: 46.700, ...zeroMale },
  { position: 5, inscriptionId: 'ins-5', gymnastName: 'Emma Puig', clubName: 'Salt i Vol', vaultScore: 11.950, barsScore: 10.500, beamScore: 12.100, floorScore: 12.000, totalScore: 46.550, ...zeroMale },
  { position: 6, inscriptionId: 'ins-6', gymnastName: 'Júlia Valls', clubName: 'Gimnàstic Osona', vaultScore: 12.000, barsScore: 11.400, beamScore: 10.800, floorScore: 11.850, totalScore: 46.050, ...zeroMale },
]
