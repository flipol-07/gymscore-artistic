#!/usr/bin/env node
/**
 * Seed de competición demo con desglose D/E + penalizaciones.
 * Ejecutar: node scripts/seed-demo.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
const get = (k) => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim()

const SUPABASE_URL = get('NEXT_PUBLIC_SUPABASE_URL')
const SERVICE_KEY = get('SUPABASE_SERVICE_ROLE_KEY')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan credenciales en .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const slug = `demo-penalizaciones-${Date.now()}`

const SEED = {
  competition: {
    name: 'Trofeo Demo · Notas con Penalizaciones',
    slug,
    location: 'Pabellón Demo, Barcelona',
    date: '2026-05-10',
    status: 'finished',
    is_published: true,
  },
  sessions: [
    { name: 'Jornada Mañana', ord: 1 },
    { name: 'Jornada Tarde', ord: 2 },
  ],
  promotions: [
    { sessionIdx: 0, name: 'Nivel Base Femenino', gender: 'female' },
    { sessionIdx: 0, name: 'Vía Olímpica Femenino', gender: 'female' },
    { sessionIdx: 1, name: 'Senior Masculino', gender: 'male' },
  ],
  // Aparatos por sexo
  apparatusF: ['vault', 'bars', 'beam', 'floor'],
  apparatusM: ['floor', 'pommel', 'rings', 'vault', 'p_bars', 'h_bar'],
  clubs: ['Club Gymnastic', 'Salt i Vol', 'Gimnàstic Osona', 'C.G. Mediterrani', 'Club Saltos'],
  gymnastsByPromo: [
    [ // Nivel Base Femenino
      { name: 'Ana García Fernández', club: 'Club Gymnastic' },
      { name: 'Valentina Gómez Torres', club: 'Salt i Vol' },
      { name: 'María Rodríguez Sánchez', club: 'Club Saltos' },
      { name: 'Lucía Martínez Ruiz', club: 'Club Saltos' },
      { name: 'Sofía López Méndez', club: 'Club Gymnastic' },
    ],
    [ // Vía Olímpica
      { name: 'Carla Pérez Vidal', club: 'Gimnàstic Osona' },
      { name: 'Aitana Ruiz Mas', club: 'C.G. Mediterrani' },
      { name: 'Júlia Soler Casas', club: 'Salt i Vol' },
      { name: 'Marta Garrido Gil', club: 'Club Gymnastic' },
    ],
    [ // Senior Masculino
      { name: 'Adrián Castro Núñez', club: 'C.G. Mediterrani' },
      { name: 'Pablo Vidal Reyes', club: 'Gimnàstic Osona' },
      { name: 'Hugo Salas Bru', club: 'Club Gymnastic' },
    ],
  ],
}

// Generador determinista de notas con D/E/penalty realistas
function makeScore(seed, hasPenalty) {
  // D entre 4.0 y 6.0
  const d = Math.round((4 + (seed * 0.7) % 2) * 10) / 10
  // E entre 7.0 y 9.0
  const e = Math.round((7 + (seed * 0.4) % 2) * 100) / 100
  // Penalty: 0, -0.1, -0.3, -0.5
  const pens = [0, -0.1, -0.3, -0.5]
  const p = hasPenalty ? pens[seed % pens.length] : 0
  const total = Math.round((d + e + p) * 1000) / 1000
  return { d, e, total, penalty: p }
}

async function main() {
  console.log('🌱 Sembrando competición demo...')

  // 1) Competition
  const { data: comp, error: compErr } = await supabase
    .from('competitions')
    .insert(SEED.competition)
    .select()
    .single()
  if (compErr) throw compErr
  console.log(`✓ Competición: ${comp.name} [${comp.slug}]`)

  // 2) Sessions
  const sessIds = []
  for (const s of SEED.sessions) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ ...s, competition_id: comp.id })
      .select().single()
    if (error) throw error
    sessIds.push(data.id)
  }
  console.log(`✓ ${sessIds.length} jornadas`)

  // 3) Promotions
  const promoIds = []
  for (const p of SEED.promotions) {
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        session_id: sessIds[p.sessionIdx],
        competition_id: comp.id,
        name: p.name,
        gender: p.gender,
        gymnast_count: SEED.gymnastsByPromo[promoIds.length].length,
        status: 'finished',
      })
      .select().single()
    if (error) throw error
    promoIds.push({ id: data.id, gender: p.gender })
  }
  console.log(`✓ ${promoIds.length} promociones`)

  // 4) Clubs
  const clubMap = {}
  for (const name of SEED.clubs) {
    const { data, error } = await supabase
      .from('clubs')
      .upsert({ name }, { onConflict: 'name' })
      .select().single()
    if (error) throw error
    clubMap[name] = data.id
  }
  console.log(`✓ ${Object.keys(clubMap).length} clubs`)

  // 5) Gymnasts + Inscriptions + Scores
  let scoreCount = 0
  let scoreSeed = 1
  for (let pi = 0; pi < promoIds.length; pi++) {
    const promo = promoIds[pi]
    const apparatus = promo.gender === 'female' ? SEED.apparatusF : SEED.apparatusM
    for (const g of SEED.gymnastsByPromo[pi]) {
      // Gymnast
      const { data: gym, error: gErr } = await supabase
        .from('gymnasts')
        .upsert({ full_name: g.name, club_id: clubMap[g.club] }, { onConflict: 'full_name,club_id' })
        .select().single()
      if (gErr) throw gErr

      // Inscription
      const { data: ins, error: iErr } = await supabase
        .from('inscriptions')
        .insert({ gymnast_id: gym.id, promotion_id: promo.id, club_id: clubMap[g.club] })
        .select().single()
      if (iErr) throw iErr

      // Scores: cada gimnasta tiene nota en cada aparato; ~40% con penalización
      for (const app of apparatus) {
        const hasPenalty = scoreSeed % 5 === 0 || scoreSeed % 5 === 2 // determinista
        const s = makeScore(scoreSeed++, hasPenalty)
        const { error: scErr } = await supabase
          .from('scores')
          .insert({
            inscription_id: ins.id,
            apparatus: app,
            score: s.total,
            d_score: s.d,
            e_score: s.e,
          })
        if (scErr) throw scErr
        scoreCount++
      }
    }
  }
  console.log(`✓ ${scoreCount} notas con desglose D/E/Pen`)

  console.log('')
  console.log('🎉 Listo. Visita:')
  console.log(`   http://localhost:3000/competiciones/${slug}`)
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
