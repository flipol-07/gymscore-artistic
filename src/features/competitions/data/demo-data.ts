import type {
  Competition,
  Category,
  Club,
  RankingEntry,
  ApparatusScore,
  GymnastHistory,
  Apparatus,
} from '../types'

// ─── Clubs ──────────────────────────────────────────────────────────────────

const clubs: Club[] = [
  { id: 'club-1', name: 'Club Gimnástico Akros', flagUrl: '/flags/akros.png' },
  { id: 'club-2', name: 'Club La Barca Jerez', flagUrl: '/flags/labarca.png' },
  { id: 'club-3', name: 'Gimnástico Sur', flagUrl: '/flags/gsur.png' },
  { id: 'club-4', name: 'CGR Cartuja', flagUrl: '/flags/cartuja.png' },
  { id: 'club-5', name: 'Club Jaén Gimnasia', flagUrl: '/flags/jaen.png' },
  { id: 'club-6', name: 'CD Marisma Huelva', flagUrl: '/flags/marisma.png' },
  { id: 'club-7', name: 'Gimnástica Portuense', flagUrl: '/flags/portuense.png' },
  { id: 'club-8', name: 'CG Bahía de Cádiz', flagUrl: '/flags/bahia.png' },
  { id: 'club-9', name: 'Club Elite Córdoba', flagUrl: '/flags/elite.png' },
  { id: 'club-10', name: 'Escuela Gimnasia Triana', flagUrl: '/flags/triana.png' },
]

// ─── Competitions ───────────────────────────────────────────────────────────

const competitions: Competition[] = [
  {
    id: 'comp-1',
    name: 'Trofeo GAF Ciudad de Utrera',
    slug: 'trofeo-gaf-ciudad-de-utrera-2026',
    location: 'Pabellón Municipal de Utrera',
    date: '2026-03-15',
    status: 'finished',
    categoryCount: 6,
  },
  {
    id: 'comp-2',
    name: 'Trofeo de Navidad Ciudad de Lucena',
    slug: 'trofeo-navidad-lucena-2025',
    location: 'Polideportivo Ciudad de Lucena',
    date: '2025-12-20',
    status: 'finished',
    categoryCount: 5,
  },
  {
    id: 'comp-3',
    name: 'Copa Andalucía GAF 1ª Fase',
    slug: 'copa-andalucia-gaf-1-fase-2026',
    location: 'Centro Deportivo San Pablo, Sevilla',
    date: '2026-02-08',
    status: 'finished',
    categoryCount: 6,
  },
  {
    id: 'comp-4',
    name: 'Campeonato Provincial de Cádiz',
    slug: 'campeonato-provincial-cadiz-2026',
    location: 'Pabellón Fernando Portillo, Cádiz',
    date: '2026-03-22',
    status: 'active',
    categoryCount: 4,
  },
  {
    id: 'comp-5',
    name: 'I Trofeo Primavera Gimnástica Portuense',
    slug: 'trofeo-primavera-portuense-2026',
    location: 'Polideportivo El Puerto de Santa María',
    date: '2026-04-12',
    status: 'draft',
    categoryCount: 5,
  },
]

// ─── Categories ─────────────────────────────────────────────────────────────

const categories: (Category & { competitionSlug: string; competitionName: string })[] = [
  // Trofeo GAF Ciudad de Utrera (comp-1)
  { id: 'cat-1-1', competitionId: 'comp-1', competitionSlug: 'trofeo-gaf-ciudad-de-utrera-2026', competitionName: 'Trofeo GAF Ciudad de Utrera', name: 'Prebenjamín', gender: 'female', session: 1, sortOrder: 1 },
  { id: 'cat-1-2', competitionId: 'comp-1', competitionSlug: 'trofeo-gaf-ciudad-de-utrera-2026', competitionName: 'Trofeo GAF Ciudad de Utrera', name: 'Benjamín', gender: 'female', session: 1, sortOrder: 2 },
  { id: 'cat-1-3', competitionId: 'comp-1', competitionSlug: 'trofeo-gaf-ciudad-de-utrera-2026', competitionName: 'Trofeo GAF Ciudad de Utrera', name: 'Alevín', gender: 'female', session: 2, sortOrder: 3 },
  { id: 'cat-1-4', competitionId: 'comp-1', competitionSlug: 'trofeo-gaf-ciudad-de-utrera-2026', competitionName: 'Trofeo GAF Ciudad de Utrera', name: 'Infantil', gender: 'female', session: 2, sortOrder: 4 },
  { id: 'cat-1-5', competitionId: 'comp-1', competitionSlug: 'trofeo-gaf-ciudad-de-utrera-2026', competitionName: 'Trofeo GAF Ciudad de Utrera', name: 'Cadete', gender: 'female', session: 3, sortOrder: 5 },
  { id: 'cat-1-6', competitionId: 'comp-1', competitionSlug: 'trofeo-gaf-ciudad-de-utrera-2026', competitionName: 'Trofeo GAF Ciudad de Utrera', name: 'Junior-Senior', gender: 'female', session: 3, sortOrder: 6 },

  // Trofeo de Navidad Ciudad de Lucena (comp-2)
  { id: 'cat-2-1', competitionId: 'comp-2', competitionSlug: 'trofeo-navidad-lucena-2025', competitionName: 'Trofeo de Navidad Ciudad de Lucena', name: 'Base 1', gender: 'female', session: 1, sortOrder: 1 },
  { id: 'cat-2-2', competitionId: 'comp-2', competitionSlug: 'trofeo-navidad-lucena-2025', competitionName: 'Trofeo de Navidad Ciudad de Lucena', name: 'Base 2', gender: 'female', session: 1, sortOrder: 2 },
  { id: 'cat-2-3', competitionId: 'comp-2', competitionSlug: 'trofeo-navidad-lucena-2025', competitionName: 'Trofeo de Navidad Ciudad de Lucena', name: 'Base 3', gender: 'female', session: 2, sortOrder: 3 },
  { id: 'cat-2-4', competitionId: 'comp-2', competitionSlug: 'trofeo-navidad-lucena-2025', competitionName: 'Trofeo de Navidad Ciudad de Lucena', name: 'Escolar Cadete', gender: 'female', session: 2, sortOrder: 4 },
  { id: 'cat-2-5', competitionId: 'comp-2', competitionSlug: 'trofeo-navidad-lucena-2025', competitionName: 'Trofeo de Navidad Ciudad de Lucena', name: 'Escolar Senior', gender: 'female', session: 3, sortOrder: 5 },

  // Copa Andalucía GAF 1ª Fase (comp-3)
  { id: 'cat-3-1', competitionId: 'comp-3', competitionSlug: 'copa-andalucia-gaf-1-fase-2026', competitionName: 'Copa Andalucía GAF 1ª Fase', name: 'Alevín Copa', gender: 'female', session: 1, sortOrder: 1 },
  { id: 'cat-3-2', competitionId: 'comp-3', competitionSlug: 'copa-andalucia-gaf-1-fase-2026', competitionName: 'Copa Andalucía GAF 1ª Fase', name: 'Infantil Copa', gender: 'female', session: 1, sortOrder: 2 },
  { id: 'cat-3-3', competitionId: 'comp-3', competitionSlug: 'copa-andalucia-gaf-1-fase-2026', competitionName: 'Copa Andalucía GAF 1ª Fase', name: 'Cadete Copa', gender: 'female', session: 2, sortOrder: 3 },
  { id: 'cat-3-4', competitionId: 'comp-3', competitionSlug: 'copa-andalucia-gaf-1-fase-2026', competitionName: 'Copa Andalucía GAF 1ª Fase', name: 'Junior Copa', gender: 'female', session: 2, sortOrder: 4 },
  { id: 'cat-3-5', competitionId: 'comp-3', competitionSlug: 'copa-andalucia-gaf-1-fase-2026', competitionName: 'Copa Andalucía GAF 1ª Fase', name: 'Senior Copa', gender: 'female', session: 3, sortOrder: 5 },
  { id: 'cat-3-6', competitionId: 'comp-3', competitionSlug: 'copa-andalucia-gaf-1-fase-2026', competitionName: 'Copa Andalucía GAF 1ª Fase', name: 'Absoluta', gender: 'female', session: 3, sortOrder: 6 },

  // Campeonato Provincial de Cádiz (comp-4)
  { id: 'cat-4-1', competitionId: 'comp-4', competitionSlug: 'campeonato-provincial-cadiz-2026', competitionName: 'Campeonato Provincial de Cádiz', name: 'Prebenjamín', gender: 'female', session: 1, sortOrder: 1 },
  { id: 'cat-4-2', competitionId: 'comp-4', competitionSlug: 'campeonato-provincial-cadiz-2026', competitionName: 'Campeonato Provincial de Cádiz', name: 'Benjamín', gender: 'female', session: 1, sortOrder: 2 },
  { id: 'cat-4-3', competitionId: 'comp-4', competitionSlug: 'campeonato-provincial-cadiz-2026', competitionName: 'Campeonato Provincial de Cádiz', name: 'Alevín', gender: 'female', session: 2, sortOrder: 3 },
  { id: 'cat-4-4', competitionId: 'comp-4', competitionSlug: 'campeonato-provincial-cadiz-2026', competitionName: 'Campeonato Provincial de Cádiz', name: 'Infantil-Cadete', gender: 'female', session: 2, sortOrder: 4 },

  // I Trofeo Primavera Gimnástica Portuense (comp-5)
  { id: 'cat-5-1', competitionId: 'comp-5', competitionSlug: 'trofeo-primavera-portuense-2026', competitionName: 'I Trofeo Primavera Gimnástica Portuense', name: 'Base 1', gender: 'female', session: 1, sortOrder: 1 },
  { id: 'cat-5-2', competitionId: 'comp-5', competitionSlug: 'trofeo-primavera-portuense-2026', competitionName: 'I Trofeo Primavera Gimnástica Portuense', name: 'Base 2', gender: 'female', session: 1, sortOrder: 2 },
  { id: 'cat-5-3', competitionId: 'comp-5', competitionSlug: 'trofeo-primavera-portuense-2026', competitionName: 'I Trofeo Primavera Gimnástica Portuense', name: 'Base 3', gender: 'female', session: 2, sortOrder: 3 },
  { id: 'cat-5-4', competitionId: 'comp-5', competitionSlug: 'trofeo-primavera-portuense-2026', competitionName: 'I Trofeo Primavera Gimnástica Portuense', name: 'Alevín', gender: 'female', session: 2, sortOrder: 4 },
  { id: 'cat-5-5', competitionId: 'comp-5', competitionSlug: 'trofeo-primavera-portuense-2026', competitionName: 'I Trofeo Primavera Gimnástica Portuense', name: 'Infantil', gender: 'female', session: 3, sortOrder: 5 },
]

// ─── Gymnast score data per category ────────────────────────────────────────
// Each entry: [gymnastName, clubIndex, vault, bars, beam, floor]
// D-score and E-score will be derived from the final score for apparatus rankings

interface RawScore {
  gymnastName: string
  clubIdx: number
  vault: number
  bars: number
  beam: number
  floor: number
}

function raw(name: string, clubIdx: number, vault: number, bars: number, beam: number, floor: number): RawScore {
  return { gymnastName: name, clubIdx, vault, bars, beam, floor }
}

const categoryScores: Record<string, RawScore[]> = {
  // ─── Trofeo GAF Ciudad de Utrera ────────────────────────────
  'cat-1-1': [ // Prebenjamín
    raw('Lucía Martínez Reyes', 0, 9.45, 8.20, 8.75, 9.10),
    raw('Carmen Ruiz Delgado', 2, 9.30, 7.90, 9.00, 8.80),
    raw('Alba Fernández López', 1, 9.10, 8.50, 8.30, 8.90),
    raw('Paula García Navarro', 3, 8.85, 7.60, 8.60, 9.20),
    raw('Marta Jiménez Torres', 4, 9.20, 7.40, 8.10, 8.50),
    raw('Sofía López Moreno', 6, 8.70, 8.00, 7.90, 8.60),
    raw('Elena Romero Castro', 5, 8.90, 7.30, 8.40, 8.30),
    raw('Noa Herrera Molina', 7, 8.60, 7.80, 7.70, 8.40),
    raw('Valentina Ortiz Ruiz', 8, 8.50, 7.10, 8.20, 8.10),
    raw('Daniela Morales Sánchez', 9, 8.40, 7.50, 7.60, 7.90),
  ],
  'cat-1-2': [ // Benjamín
    raw('Adriana Vega Pérez', 0, 10.10, 8.80, 9.20, 9.40),
    raw('Irene Castillo Muñoz', 1, 9.80, 8.60, 9.50, 9.00),
    raw('Laura Díaz Serrano', 3, 9.90, 8.30, 8.80, 9.30),
    raw('Celia Navarro Gil', 2, 9.60, 9.00, 8.60, 8.90),
    raw('Marina Santos Blanco', 4, 9.70, 8.10, 9.10, 8.70),
    raw('Rocío Peña Cordero', 5, 9.40, 8.40, 8.50, 9.10),
    raw('Ana Belén Ríos Cano', 6, 9.50, 7.90, 8.90, 8.60),
    raw('Inés Molina Guerrero', 7, 9.30, 8.20, 8.30, 8.80),
    raw('Julia Campos Ortega', 8, 9.20, 7.70, 8.70, 8.40),
    raw('Clara Ramos Flores', 9, 9.00, 8.00, 8.10, 8.50),
    raw('Lola Aguilar Paredes', 0, 9.10, 7.60, 8.40, 8.70),
  ],
  'cat-1-3': [ // Alevín
    raw('Valeria Soto Medina', 0, 10.50, 9.20, 9.60, 9.50),
    raw('Candela Torres Ruiz', 2, 10.30, 9.00, 9.40, 9.70),
    raw('Nerea Gutiérrez Lara', 1, 10.10, 9.40, 9.10, 9.30),
    raw('Claudia Herrero Vidal', 3, 10.00, 8.80, 9.50, 9.20),
    raw('Alma Prieto Marín', 4, 9.80, 9.10, 9.00, 9.60),
    raw('Sara Domínguez Pardo', 6, 9.90, 8.60, 9.30, 9.10),
    raw('Emma Reyes Cabrera', 5, 9.70, 9.30, 8.80, 9.00),
    raw('Martina Iglesias Peña', 7, 9.60, 8.50, 9.20, 8.90),
    raw('Blanca Méndez Rivas', 8, 9.50, 8.90, 8.70, 9.10),
    raw('Aitana Pascual Fuentes', 9, 9.40, 8.40, 8.90, 8.80),
    raw('Laia Vargas Robles', 0, 9.30, 8.70, 8.60, 8.70),
    raw('Carla Montero Calvo', 2, 9.20, 8.30, 8.40, 9.00),
  ],
  'cat-1-4': [ // Infantil
    raw('Andrea Ruiz Espinosa', 0, 10.80, 9.50, 9.80, 9.70),
    raw('Natalia Vega Moreno', 1, 10.60, 9.70, 9.40, 9.60),
    raw('Isabel Romero Caballero', 3, 10.40, 9.30, 9.60, 9.50),
    raw('Luna García Herrera', 2, 10.50, 9.10, 9.70, 9.30),
    raw('Olivia Fernández Ramos', 4, 10.20, 9.60, 9.20, 9.40),
    raw('Vera Santos Domínguez', 6, 10.30, 8.90, 9.50, 9.20),
    raw('Jimena López Gallego', 5, 10.10, 9.20, 9.10, 9.50),
    raw('Ariadna Martín Bravo', 7, 10.00, 9.00, 9.30, 9.10),
    raw('Alejandra Díaz Nieto', 8, 9.90, 8.80, 9.00, 9.30),
    raw('Naia Pérez Montoya', 9, 9.80, 9.10, 8.80, 9.00),
  ],
  'cat-1-5': [ // Cadete
    raw('Lucía Martínez Reyes', 0, 11.00, 9.80, 9.90, 9.80),
    raw('Patricia Sánchez Luna', 2, 10.80, 9.60, 10.00, 9.60),
    raw('Míriam Alonso Prado', 1, 10.90, 9.40, 9.70, 9.70),
    raw('Cristina Herrera Soler', 3, 10.70, 9.70, 9.50, 9.50),
    raw('Victoria Navarro Ibáñez', 4, 10.60, 9.20, 9.80, 9.40),
    raw('Ainhoa Torres Aguilar', 5, 10.50, 9.50, 9.30, 9.60),
    raw('Diana Molina Crespo', 6, 10.40, 9.10, 9.60, 9.30),
    raw('Irene Castillo Muñoz', 7, 10.30, 9.30, 9.20, 9.50),
    raw('Eva Prieto León', 8, 10.20, 9.00, 9.40, 9.20),
  ],
  'cat-1-6': [ // Junior-Senior
    raw('Andrea Ruiz Espinosa', 0, 11.20, 10.10, 10.20, 10.00),
    raw('Natalia Vega Moreno', 1, 11.00, 10.30, 9.80, 10.10),
    raw('Carmen Ruiz Delgado', 2, 10.90, 9.90, 10.00, 10.20),
    raw('Sofía López Moreno', 3, 10.80, 10.00, 9.90, 9.80),
    raw('Laura Díaz Serrano', 4, 10.70, 9.80, 10.10, 9.70),
    raw('Ana Belén Ríos Cano', 6, 10.60, 9.70, 9.70, 9.90),
    raw('Marina Santos Blanco', 5, 10.50, 9.60, 9.80, 9.60),
    raw('Rocío Peña Cordero', 7, 10.40, 9.50, 9.50, 9.80),
  ],

  // ─── Trofeo de Navidad Ciudad de Lucena ─────────────────────
  'cat-2-1': [ // Base 1
    raw('Lucía Martínez Reyes', 0, 9.00, 7.80, 8.30, 8.70),
    raw('Noa Herrera Molina', 7, 8.80, 7.50, 8.50, 8.40),
    raw('Sofía López Moreno', 6, 8.90, 7.60, 8.00, 8.60),
    raw('Valentina Ortiz Ruiz', 8, 8.60, 7.30, 8.10, 8.30),
    raw('Daniela Morales Sánchez', 9, 8.50, 7.20, 7.80, 8.00),
    raw('Elena Romero Castro', 5, 8.70, 7.40, 7.90, 8.20),
    raw('Paula García Navarro', 3, 8.40, 7.70, 8.20, 7.90),
    raw('Marta Jiménez Torres', 4, 8.80, 7.00, 7.70, 8.50),
  ],
  'cat-2-2': [ // Base 2
    raw('Adriana Vega Pérez', 0, 9.60, 8.40, 8.80, 9.00),
    raw('Celia Navarro Gil', 2, 9.40, 8.70, 8.50, 8.70),
    raw('Irene Castillo Muñoz', 1, 9.30, 8.20, 9.00, 8.60),
    raw('Rocío Peña Cordero', 5, 9.20, 8.00, 8.60, 8.80),
    raw('Laura Díaz Serrano', 3, 9.50, 7.90, 8.30, 8.90),
    raw('Marina Santos Blanco', 4, 9.10, 8.30, 8.40, 8.50),
    raw('Ana Belén Ríos Cano', 6, 9.00, 8.10, 8.70, 8.30),
    raw('Inés Molina Guerrero', 7, 8.90, 7.80, 8.20, 8.40),
    raw('Clara Ramos Flores', 9, 8.80, 8.00, 8.00, 8.60),
  ],
  'cat-2-3': [ // Base 3
    raw('Valeria Soto Medina', 0, 10.20, 9.00, 9.30, 9.40),
    raw('Candela Torres Ruiz', 2, 10.00, 8.70, 9.50, 9.20),
    raw('Nerea Gutiérrez Lara', 1, 9.80, 9.10, 9.00, 9.30),
    raw('Claudia Herrero Vidal', 3, 9.90, 8.60, 9.20, 9.10),
    raw('Alma Prieto Marín', 4, 9.70, 8.90, 8.80, 9.40),
    raw('Sara Domínguez Pardo', 6, 9.60, 8.40, 9.10, 9.00),
    raw('Emma Reyes Cabrera', 5, 9.50, 8.80, 8.70, 8.90),
    raw('Martina Iglesias Peña', 7, 9.40, 8.50, 8.90, 8.80),
    raw('Blanca Méndez Rivas', 8, 9.30, 8.30, 8.60, 8.70),
    raw('Aitana Pascual Fuentes', 9, 9.20, 8.60, 8.40, 8.60),
  ],
  'cat-2-4': [ // Escolar Cadete
    raw('Patricia Sánchez Luna', 2, 10.50, 9.30, 9.60, 9.50),
    raw('Lucía Martínez Reyes', 0, 10.70, 9.50, 9.40, 9.30),
    raw('Míriam Alonso Prado', 1, 10.40, 9.20, 9.50, 9.40),
    raw('Cristina Herrera Soler', 3, 10.30, 9.40, 9.20, 9.30),
    raw('Victoria Navarro Ibáñez', 4, 10.20, 9.00, 9.30, 9.50),
    raw('Ainhoa Torres Aguilar', 5, 10.10, 9.10, 9.10, 9.20),
    raw('Diana Molina Crespo', 6, 10.00, 8.90, 9.40, 9.00),
    raw('Eva Prieto León', 8, 9.90, 8.80, 9.00, 9.10),
    raw('Irene Castillo Muñoz', 7, 9.80, 9.30, 8.80, 8.90),
  ],
  'cat-2-5': [ // Escolar Senior
    raw('Andrea Ruiz Espinosa', 0, 10.90, 9.80, 10.00, 9.80),
    raw('Natalia Vega Moreno', 1, 10.70, 10.00, 9.60, 9.70),
    raw('Carmen Ruiz Delgado', 2, 10.60, 9.60, 9.80, 9.90),
    raw('Sofía López Moreno', 3, 10.50, 9.70, 9.50, 9.60),
    raw('Laura Díaz Serrano', 4, 10.40, 9.50, 9.70, 9.40),
    raw('Ana Belén Ríos Cano', 6, 10.30, 9.40, 9.40, 9.50),
    raw('Marina Santos Blanco', 5, 10.20, 9.30, 9.30, 9.30),
    raw('Rocío Peña Cordero', 7, 10.10, 9.20, 9.10, 9.40),
  ],

  // ─── Copa Andalucía GAF 1ª Fase ────────────────────────────
  'cat-3-1': [ // Alevín Copa
    raw('Valeria Soto Medina', 0, 10.60, 9.30, 9.70, 9.60),
    raw('Candela Torres Ruiz', 2, 10.40, 9.10, 9.50, 9.80),
    raw('Nerea Gutiérrez Lara', 1, 10.20, 9.50, 9.20, 9.40),
    raw('Claudia Herrero Vidal', 3, 10.10, 8.90, 9.60, 9.30),
    raw('Alma Prieto Marín', 4, 9.90, 9.20, 9.10, 9.70),
    raw('Sara Domínguez Pardo', 6, 10.00, 8.70, 9.40, 9.20),
    raw('Emma Reyes Cabrera', 5, 9.80, 9.40, 8.90, 9.10),
    raw('Martina Iglesias Peña', 7, 9.70, 8.60, 9.30, 9.00),
    raw('Blanca Méndez Rivas', 8, 9.60, 9.00, 8.80, 9.20),
    raw('Aitana Pascual Fuentes', 9, 9.50, 8.50, 9.00, 8.90),
    raw('Laia Vargas Robles', 0, 9.40, 8.80, 8.70, 8.80),
    raw('Carla Montero Calvo', 2, 9.30, 8.40, 8.50, 9.10),
  ],
  'cat-3-2': [ // Infantil Copa
    raw('Andrea Ruiz Espinosa', 0, 10.90, 9.60, 9.90, 9.80),
    raw('Natalia Vega Moreno', 1, 10.70, 9.80, 9.50, 9.70),
    raw('Isabel Romero Caballero', 3, 10.50, 9.40, 9.70, 9.60),
    raw('Luna García Herrera', 2, 10.60, 9.20, 9.80, 9.40),
    raw('Olivia Fernández Ramos', 4, 10.30, 9.70, 9.30, 9.50),
    raw('Vera Santos Domínguez', 6, 10.40, 9.00, 9.60, 9.30),
    raw('Jimena López Gallego', 5, 10.20, 9.30, 9.20, 9.60),
    raw('Ariadna Martín Bravo', 7, 10.10, 9.10, 9.40, 9.20),
    raw('Alejandra Díaz Nieto', 8, 10.00, 8.90, 9.10, 9.40),
    raw('Naia Pérez Montoya', 9, 9.90, 9.20, 8.90, 9.10),
  ],
  'cat-3-3': [ // Cadete Copa
    raw('Lucía Martínez Reyes', 0, 11.10, 9.90, 10.00, 9.90),
    raw('Patricia Sánchez Luna', 2, 10.90, 9.70, 10.10, 9.70),
    raw('Míriam Alonso Prado', 1, 11.00, 9.50, 9.80, 9.80),
    raw('Cristina Herrera Soler', 3, 10.80, 9.80, 9.60, 9.60),
    raw('Victoria Navarro Ibáñez', 4, 10.70, 9.30, 9.90, 9.50),
    raw('Ainhoa Torres Aguilar', 5, 10.60, 9.60, 9.40, 9.70),
    raw('Diana Molina Crespo', 6, 10.50, 9.20, 9.70, 9.40),
    raw('Irene Castillo Muñoz', 7, 10.40, 9.40, 9.30, 9.60),
    raw('Eva Prieto León', 8, 10.30, 9.10, 9.50, 9.30),
  ],
  'cat-3-4': [ // Junior Copa
    raw('Andrea Ruiz Espinosa', 0, 11.30, 10.20, 10.30, 10.10),
    raw('Natalia Vega Moreno', 1, 11.10, 10.40, 9.90, 10.20),
    raw('Carmen Ruiz Delgado', 2, 11.00, 10.00, 10.10, 10.30),
    raw('Sofía López Moreno', 3, 10.90, 10.10, 10.00, 9.90),
    raw('Laura Díaz Serrano', 4, 10.80, 9.90, 10.20, 9.80),
    raw('Ana Belén Ríos Cano', 6, 10.70, 9.80, 9.80, 10.00),
    raw('Marina Santos Blanco', 5, 10.60, 9.70, 9.90, 9.70),
    raw('Rocío Peña Cordero', 7, 10.50, 9.60, 9.60, 9.90),
  ],
  'cat-3-5': [ // Senior Copa
    raw('Andrea Ruiz Espinosa', 0, 11.40, 10.30, 10.40, 10.20),
    raw('Natalia Vega Moreno', 1, 11.20, 10.50, 10.00, 10.30),
    raw('Carmen Ruiz Delgado', 2, 11.10, 10.10, 10.20, 10.40),
    raw('Sofía López Moreno', 3, 11.00, 10.20, 10.10, 10.00),
    raw('Laura Díaz Serrano', 4, 10.90, 10.00, 10.30, 9.90),
    raw('Cristina Herrera Soler', 5, 10.80, 9.90, 9.90, 10.10),
    raw('Victoria Navarro Ibáñez', 6, 10.70, 9.80, 10.00, 9.80),
  ],
  'cat-3-6': [ // Absoluta
    raw('Andrea Ruiz Espinosa', 0, 11.50, 10.40, 10.50, 10.30),
    raw('Natalia Vega Moreno', 1, 11.30, 10.60, 10.10, 10.40),
    raw('Carmen Ruiz Delgado', 2, 11.20, 10.20, 10.30, 10.50),
    raw('Patricia Sánchez Luna', 3, 11.10, 10.30, 10.20, 10.10),
    raw('Míriam Alonso Prado', 4, 11.00, 10.10, 10.40, 10.00),
    raw('Lucía Martínez Reyes', 5, 10.90, 10.00, 10.00, 10.20),
  ],

  // ─── Campeonato Provincial de Cádiz ─────────────────────────
  'cat-4-1': [ // Prebenjamín
    raw('Noa Herrera Molina', 7, 9.10, 7.90, 8.40, 8.80),
    raw('Alba Fernández López', 1, 9.00, 8.30, 8.20, 8.70),
    raw('Carmen Ruiz Delgado', 2, 8.90, 7.70, 8.60, 8.50),
    raw('Paula García Navarro', 3, 8.80, 7.50, 8.30, 8.90),
    raw('Marta Jiménez Torres', 4, 8.70, 7.80, 8.00, 8.40),
    raw('Sofía López Moreno', 6, 8.60, 7.60, 7.80, 8.60),
    raw('Elena Romero Castro', 5, 8.50, 7.30, 8.10, 8.20),
    raw('Valentina Ortiz Ruiz', 8, 8.40, 7.40, 7.90, 8.00),
    raw('Daniela Morales Sánchez', 9, 8.30, 7.20, 7.70, 7.80),
  ],
  'cat-4-2': [ // Benjamín
    raw('Adriana Vega Pérez', 0, 10.00, 8.70, 9.10, 9.30),
    raw('Irene Castillo Muñoz', 1, 9.70, 8.50, 9.40, 8.90),
    raw('Celia Navarro Gil', 2, 9.50, 8.90, 8.50, 8.80),
    raw('Laura Díaz Serrano', 3, 9.80, 8.20, 8.70, 9.20),
    raw('Marina Santos Blanco', 4, 9.60, 8.00, 9.00, 8.60),
    raw('Rocío Peña Cordero', 5, 9.30, 8.30, 8.40, 9.00),
    raw('Ana Belén Ríos Cano', 6, 9.40, 7.80, 8.80, 8.50),
    raw('Inés Molina Guerrero', 7, 9.20, 8.10, 8.20, 8.70),
    raw('Julia Campos Ortega', 8, 9.10, 7.60, 8.60, 8.30),
    raw('Lola Aguilar Paredes', 0, 9.00, 7.90, 8.30, 8.60),
  ],
  'cat-4-3': [ // Alevín
    raw('Valeria Soto Medina', 0, 10.40, 9.10, 9.50, 9.40),
    raw('Candela Torres Ruiz', 2, 10.20, 8.90, 9.30, 9.60),
    raw('Nerea Gutiérrez Lara', 1, 10.00, 9.30, 9.00, 9.20),
    raw('Claudia Herrero Vidal', 3, 9.90, 8.70, 9.40, 9.10),
    raw('Alma Prieto Marín', 4, 9.80, 9.00, 8.90, 9.50),
    raw('Sara Domínguez Pardo', 6, 9.70, 8.50, 9.20, 9.00),
    raw('Emma Reyes Cabrera', 5, 9.60, 9.20, 8.70, 8.90),
    raw('Martina Iglesias Peña', 7, 9.50, 8.40, 9.10, 8.80),
    raw('Blanca Méndez Rivas', 8, 9.40, 8.80, 8.60, 9.00),
    raw('Aitana Pascual Fuentes', 9, 9.30, 8.30, 8.80, 8.70),
    raw('Laia Vargas Robles', 0, 9.20, 8.60, 8.50, 8.60),
  ],
  'cat-4-4': [ // Infantil-Cadete
    raw('Andrea Ruiz Espinosa', 0, 10.70, 9.40, 9.70, 9.60),
    raw('Natalia Vega Moreno', 1, 10.50, 9.60, 9.30, 9.50),
    raw('Isabel Romero Caballero', 3, 10.30, 9.20, 9.50, 9.40),
    raw('Luna García Herrera', 2, 10.40, 9.00, 9.60, 9.20),
    raw('Olivia Fernández Ramos', 4, 10.10, 9.50, 9.10, 9.30),
    raw('Vera Santos Domínguez', 6, 10.20, 8.80, 9.40, 9.10),
    raw('Jimena López Gallego', 5, 10.00, 9.10, 9.00, 9.40),
    raw('Ariadna Martín Bravo', 7, 9.90, 8.90, 9.20, 9.00),
    raw('Patricia Sánchez Luna', 2, 10.60, 9.30, 9.80, 9.30),
    raw('Míriam Alonso Prado', 1, 10.40, 9.70, 9.10, 9.50),
    raw('Cristina Herrera Soler', 3, 10.30, 9.40, 9.30, 9.20),
  ],

  // ─── I Trofeo Primavera Gimnástica Portuense ────────────────
  'cat-5-1': [ // Base 1
    raw('Lucía Martínez Reyes', 0, 9.20, 8.00, 8.50, 8.90),
    raw('Carmen Ruiz Delgado', 2, 9.00, 7.70, 8.70, 8.60),
    raw('Alba Fernández López', 1, 8.80, 8.20, 8.10, 8.70),
    raw('Paula García Navarro', 3, 8.70, 7.40, 8.40, 9.00),
    raw('Marta Jiménez Torres', 4, 9.00, 7.20, 7.90, 8.30),
    raw('Sofía López Moreno', 6, 8.50, 7.80, 7.70, 8.40),
    raw('Elena Romero Castro', 5, 8.60, 7.10, 8.20, 8.10),
    raw('Noa Herrera Molina', 7, 8.40, 7.60, 7.50, 8.20),
  ],
  'cat-5-2': [ // Base 2
    raw('Adriana Vega Pérez', 0, 9.80, 8.60, 9.00, 9.20),
    raw('Irene Castillo Muñoz', 1, 9.50, 8.40, 9.20, 8.80),
    raw('Laura Díaz Serrano', 3, 9.60, 8.10, 8.60, 9.10),
    raw('Celia Navarro Gil', 2, 9.30, 8.80, 8.40, 8.70),
    raw('Marina Santos Blanco', 4, 9.40, 7.90, 8.80, 8.50),
    raw('Rocío Peña Cordero', 5, 9.10, 8.20, 8.30, 8.90),
    raw('Ana Belén Ríos Cano', 6, 9.20, 7.70, 8.70, 8.40),
    raw('Inés Molina Guerrero', 7, 9.00, 8.00, 8.10, 8.60),
    raw('Clara Ramos Flores', 9, 8.80, 7.80, 7.90, 8.30),
  ],
  'cat-5-3': [ // Base 3
    raw('Valeria Soto Medina', 0, 10.30, 9.10, 9.40, 9.50),
    raw('Candela Torres Ruiz', 2, 10.10, 8.80, 9.60, 9.30),
    raw('Nerea Gutiérrez Lara', 1, 9.90, 9.20, 9.10, 9.40),
    raw('Claudia Herrero Vidal', 3, 10.00, 8.70, 9.30, 9.20),
    raw('Alma Prieto Marín', 4, 9.80, 9.00, 8.90, 9.50),
    raw('Sara Domínguez Pardo', 6, 9.70, 8.50, 9.20, 9.10),
    raw('Emma Reyes Cabrera', 5, 9.60, 8.90, 8.80, 9.00),
    raw('Martina Iglesias Peña', 7, 9.50, 8.60, 9.00, 8.90),
  ],
  'cat-5-4': [ // Alevín
    raw('Valeria Soto Medina', 0, 10.50, 9.20, 9.60, 9.50),
    raw('Candela Torres Ruiz', 2, 10.30, 9.00, 9.40, 9.70),
    raw('Nerea Gutiérrez Lara', 1, 10.10, 9.40, 9.10, 9.30),
    raw('Claudia Herrero Vidal', 3, 10.00, 8.80, 9.50, 9.20),
    raw('Alma Prieto Marín', 4, 9.80, 9.10, 9.00, 9.60),
    raw('Sara Domínguez Pardo', 6, 9.90, 8.60, 9.30, 9.10),
    raw('Emma Reyes Cabrera', 5, 9.70, 9.30, 8.80, 9.00),
    raw('Martina Iglesias Peña', 7, 9.60, 8.50, 9.20, 8.90),
    raw('Blanca Méndez Rivas', 8, 9.50, 8.90, 8.70, 9.10),
    raw('Aitana Pascual Fuentes', 9, 9.40, 8.40, 8.90, 8.80),
  ],
  'cat-5-5': [ // Infantil
    raw('Andrea Ruiz Espinosa', 0, 10.80, 9.50, 9.80, 9.70),
    raw('Natalia Vega Moreno', 1, 10.60, 9.70, 9.40, 9.60),
    raw('Isabel Romero Caballero', 3, 10.40, 9.30, 9.60, 9.50),
    raw('Luna García Herrera', 2, 10.50, 9.10, 9.70, 9.30),
    raw('Olivia Fernández Ramos', 4, 10.20, 9.60, 9.20, 9.40),
    raw('Vera Santos Domínguez', 6, 10.30, 8.90, 9.50, 9.20),
    raw('Jimena López Gallego', 5, 10.10, 9.20, 9.10, 9.50),
    raw('Ariadna Martín Bravo', 7, 10.00, 9.00, 9.30, 9.10),
  ],
}

// ─── Helper: round to 2 decimals ────────────────────────────────────────────

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Build ranking entries from raw scores ──────────────────────────────────

function buildRankings(catId: string): RankingEntry[] {
  const scores = categoryScores[catId]
  if (!scores) return []

  const entries: RankingEntry[] = scores.map((s, idx) => {
    const club = clubs[s.clubIdx]
    const total = r2(s.vault + s.bars + s.beam + s.floor)
    return {
      position: 0,
      inscriptionId: `insc-${catId}-${idx}`,
      gymnastName: s.gymnastName,
      clubName: club.name,
      clubFlag: club.flagUrl,
      vaultScore: s.vault,
      barsScore: s.bars,
      beamScore: s.beam,
      floorScore: s.floor,
      totalScore: total,
    }
  })

  entries.sort((a, b) => b.totalScore - a.totalScore)
  entries.forEach((e, i) => { e.position = i + 1 })
  return entries
}

// ─── Build apparatus rankings ───────────────────────────────────────────────

function buildApparatusRankings(catId: string, apparatus: Apparatus): ApparatusScore[] {
  const scores = categoryScores[catId]
  if (!scores) return []

  const apparatusKey: Record<string, keyof RawScore> = {
    vault: 'vault',
    bars: 'bars',
    beam: 'beam',
    floor: 'floor',
  }

  const key = apparatusKey[apparatus]
  if (!key) return []

  const entries: ApparatusScore[] = scores.map((s) => {
    const club = clubs[s.clubIdx]
    const finalScore = s[key] as number
    // Derive D and E scores from final (D typically 2-5, E = final - D)
    const dScore = r2(Math.min(finalScore * 0.4, 5.0))
    const eScore = r2(finalScore - dScore)
    return {
      position: 0,
      gymnastName: s.gymnastName,
      clubName: club.name,
      clubFlag: club.flagUrl,
      dScore,
      eScore,
      penalty: 0,
      finalScore,
    }
  })

  entries.sort((a, b) => b.finalScore - a.finalScore)
  entries.forEach((e, i) => { e.position = i + 1 })
  return entries
}

// ─── Build gymnast history ──────────────────────────────────────────────────

function buildGymnastHistory(gymnastName: string): GymnastHistory[] {
  const history: GymnastHistory[] = []

  for (const cat of categories) {
    const scores = categoryScores[cat.id]
    if (!scores) continue

    const match = scores.find((s) => s.gymnastName === gymnastName)
    if (!match) continue

    const comp = competitions.find((c) => c.id === cat.competitionId)
    if (!comp) continue

    const club = clubs[match.clubIdx]
    history.push({
      competitionName: comp.name,
      competitionSlug: comp.slug,
      categoryName: cat.name,
      categoryId: cat.id,
      date: comp.date,
      clubName: club.name,
      vaultScore: match.vault,
      barsScore: match.bars,
      beamScore: match.beam,
      floorScore: match.floor,
      totalScore: r2(match.vault + match.bars + match.beam + match.floor),
    })
  }

  history.sort((a, b) => b.date.localeCompare(a.date))
  return history
}

// ─── Exported API functions ─────────────────────────────────────────────────

export function getCompetitions(): Competition[] {
  return [...competitions]
    .map((c) => {
      const cats = categories.filter((cat) => cat.competitionId === c.id)
      return { ...c, categoryCount: cats.length }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getCompetition(slug: string): Competition | undefined {
  const comp = competitions.find((c) => c.slug === slug)
  if (!comp) return undefined
  const cats = categories.filter((cat) => cat.competitionId === comp.id)
  return { ...comp, categoryCount: cats.length }
}

export function getCategories(competitionSlug: string): Category[] {
  const comp = competitions.find((c) => c.slug === competitionSlug)
  if (!comp) return []

  return categories
    .filter((cat) => cat.competitionId === comp.id)
    .map((cat) => {
      const scores = categoryScores[cat.id]
      return { ...cat, gymnastCount: scores ? scores.length : 0 }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getCategory(categoryId: string): (Category & { competitionSlug: string; competitionName: string }) | undefined {
  const cat = categories.find((c) => c.id === categoryId)
  if (!cat) return undefined
  const scores = categoryScores[cat.id]
  return { ...cat, gymnastCount: scores ? scores.length : 0 }
}

export function getRankings(categoryId: string): RankingEntry[] {
  return buildRankings(categoryId)
}

export function getApparatusRankings(categoryId: string, apparatus: Apparatus): ApparatusScore[] {
  return buildApparatusRankings(categoryId, apparatus)
}

export function getGymnastHistory(gymnastName: string): GymnastHistory[] {
  return buildGymnastHistory(gymnastName)
}

export function searchCompetitions(query: string): Competition[] {
  const q = query.toLowerCase().trim()
  if (!q) return getCompetitions()

  return getCompetitions().filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.location.toLowerCase().includes(q) ||
    c.slug.toLowerCase().includes(q)
  )
}
