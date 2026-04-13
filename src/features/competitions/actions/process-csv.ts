'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result.map(s => s.trim())
}

export async function processCsvAction(competitionId: string, csvContent: string, password?: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 1. Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    if (!password) throw new Error('Unauthorized')
    const { data: match, error: pwErr } = await supabase.rpc('verify_competition_password', {
      p_competition_id: competitionId,
      p_password: password
    })
    if (pwErr || !match) throw new Error('Unauthorized')
  }

  // 2. Parse CSV text
  console.log('[CSV] Analizando archivo CSV...')
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0)
  
  if (lines.length < 2) {
    throw new Error('El archivo CSV está vacío o le falta la cabecera.')
  }

  // Skip header (assuming row 0 is header: Jornada,Categoria,Genero,Gimnasta,Club)
  const dataLines = lines.slice(1)
  
  const sessionsMap: Record<string, {
    name: string,
    order: number,
    promotions: Record<string, {
      name: string,
      gender: 'female' | 'male',
      gymnasts: { fullName: string, clubName: string }[]
    }>
  }> = {}

  let sessionOrd = 1
  for (const line of dataLines) {
    const cols = parseCSVLine(line)
    if (cols.length < 5) continue

    const [jornadaName, categoriaName, genero, gymnastName, clubName] = cols
    
    if (!sessionsMap[jornadaName]) {
      sessionsMap[jornadaName] = {
        name: jornadaName,
        order: sessionOrd++,
        promotions: {}
      }
    }
    
    const sess = sessionsMap[jornadaName]
    const promoKey = `${categoriaName}-${genero}`
    
    if (!sess.promotions[promoKey]) {
      sess.promotions[promoKey] = {
        name: categoriaName,
        gender: (genero.toLowerCase() === 'male' || genero.toLowerCase() === 'm') ? 'male' : 'female',
        gymnasts: []
      }
    }
    
    sess.promotions[promoKey].gymnasts.push({
      fullName: gymnastName,
      clubName: clubName
    })
  }

  const sessions = Object.values(sessionsMap).map(s => ({
    ...s,
    promotions: Object.values(s.promotions)
  }))

  console.log(`[CSV] Análisis completado: ${sessions.length} jornadas encontradas.`)

  // 3. Populate Database
  for (const session of sessions) {
    console.log(`[DB] Procesando jornada: ${session.name}`)
    const { data: sessData, error: sessErr } = await supabase
      .from('sessions')
      .upsert({
        competition_id: competitionId,
        name: session.name,
        ord: session.order
      }, { onConflict: 'competition_id,name' })
      .select()
      .single()

    if (sessErr) {
      console.error('[DB] Error insertando jornada:', sessErr.message)
      continue
    }

    for (const promo of session.promotions) {
      console.log(`[DB]   Procesando promoción: ${promo.name}`)
      const { data: promoData, error: promoErr } = await supabase
        .from('promotions')
        .upsert({
          session_id: sessData.id,
          competition_id: competitionId,
          name: promo.name,
          gender: promo.gender,
          gymnast_count: promo.gymnasts.length,
          status: 'pending'
        }, { onConflict: 'session_id,name' })
        .select()
        .single()

      if (promoErr) {
        console.error('[DB]   Error insertando promoción:', promoErr.message)
        continue
      }

      for (const gymnast of promo.gymnasts) {
        let clubId: string = ''
        const clubNameTrimmed = gymnast.clubName.trim()
        
        const { data: clubData, error: clubErr } = await supabase
          .from('clubs')
          .upsert({ name: clubNameTrimmed }, { onConflict: 'name' })
          .select()
          .single()

        if (clubErr) {
          console.error(`[DB]     Error con club ${clubNameTrimmed}:`, clubErr.message)
          continue
        }
        clubId = clubData.id

        const { data: gymData, error: gymErr } = await supabase
          .from('gymnasts')
          .upsert({
            full_name: gymnast.fullName.trim(),
            club_id: clubId
          }, { onConflict: 'full_name,club_id' })
          .select()
          .single()

        if (gymErr) {
          console.error(`[DB]     Error con gimnasta ${gymnast.fullName}:`, gymErr.message)
          continue
        }

        const { error: insErr } = await supabase.from('inscriptions').insert({
          gymnast_id: gymData.id,
          promotion_id: promoData.id,
          club_id: clubId
        })

        if (insErr && !insErr.message.includes('duplicate key')) {
          console.error(`[DB]     Error inscripción ${gymnast.fullName}:`, insErr.message)
        }
      }
    }
  }

  console.log('[OK] Procesamiento CSV finalizado con éxito.')
  return { success: true }
}
