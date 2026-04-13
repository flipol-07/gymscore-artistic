import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// dotenv not needed if we run with --env-file=.env.local or pass env vars in shell

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Uses service role to bypass RLS and auth
)

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') inQuotes = !inQuotes
    else if (char === ',' && !inQuotes) { result.push(current); current = '' }
    else current += char
  }
  result.push(current)
  return result.map(s => s.trim())
}

async function run() {
  console.log('Iniciando carga del CSV en BD...')
  const csvText = fs.readFileSync('evento-demo.csv', 'utf8')
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0)
  const dataLines = lines.slice(1) // skip header

  // 1. Create Competition
  const compSlug = 'gran-torneo-nacional-' + Date.now()
  const { data: comp, error: compErr } = await supabase.from('competitions').insert({
    name: 'Gran Torneo Nacional de Gimnasia',
    slug: compSlug,
    location: 'Pabellón Olímpico Municipal',
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    admin_password: '123'
  }).select().single()

  if (compErr) throw new Error(compErr.message)
  console.log(`✅ Competición creada: ${comp.id}`)

  const sessionsMap: any = {}
  let sessionOrd = 1
  for (const line of dataLines) {
    const cols = parseCSVLine(line)
    if (cols.length < 5) continue
    const [jornadaName, categoriaName, genero, gymnastName, clubName] = cols
    
    if (!sessionsMap[jornadaName]) {
      sessionsMap[jornadaName] = { name: jornadaName, order: sessionOrd++, promotions: {} }
    }
    const sess = sessionsMap[jornadaName]
    const promoKey = `${categoriaName}-${genero}`
    if (!sess.promotions[promoKey]) {
      sess.promotions[promoKey] = { name: categoriaName, gender: genero, gymnasts: [] }
    }
    sess.promotions[promoKey].gymnasts.push({ fullName: gymnastName, clubName })
  }

  const sessions = Object.values(sessionsMap).map((s: any) => ({ ...s, promotions: Object.values(s.promotions) }))

  for (const session of sessions) {
    const { data: sessData, error: sessErr } = await supabase.from('sessions')
      .upsert({ competition_id: comp.id, name: session.name, ord: session.order }, { onConflict: 'competition_id,name' })
      .select().single()
    if (sessErr) throw new Error(sessErr.message)

    for (const promo of session.promotions) {
      const { data: promoData, error: promoErr } = await supabase.from('promotions')
        .upsert({
          session_id: sessData.id, competition_id: comp.id, name: promo.name, gender: promo.gender, gymnast_count: promo.gymnasts.length, status: 'pending'
        }, { onConflict: 'session_id,name' }).select().single()
      if (promoErr) throw new Error(promoErr.message)

      for (const gymnast of promo.gymnasts) {
        const { data: clubData, error: clubErr } = await supabase.from('clubs')
          .upsert({ name: gymnast.clubName }, { onConflict: 'name' }).select().single()
        if (clubErr) throw new Error(clubErr.message)

        const { data: gymData, error: gymErr } = await supabase.from('gymnasts')
          .upsert({ full_name: gymnast.fullName, club_id: clubData.id }, { onConflict: 'full_name,club_id' }).select().single()
        if (gymErr) throw new Error(gymErr.message)

        await supabase.from('inscriptions').insert({
          gymnast_id: gymData.id, promotion_id: promoData.id, club_id: clubData.id
        })
      }
    }
  }

  console.log('✅ Base de datos poblada con todas las opciones. El evento está listo.')
}

run().catch(console.error)
