'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { parseProgramFromBase64 } from '../services/program-parser'

export async function processProgramAction(competitionId: string, base64Pdf: string, password?: string) {
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

  // 1. Check permissions: Supabase superadmin OR valid event password
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Try event password validation
    if (!password) throw new Error('Unauthorized')
    const { data: match, error: pwErr } = await supabase.rpc('verify_competition_password', {
      p_competition_id: competitionId,
      p_password: password
    })
    if (pwErr || !match) throw new Error('Unauthorized')
  }

  // 2. Parse with AI
  console.log('[AI] Iniciando análisis del programa...')
  const parsed = await parseProgramFromBase64(base64Pdf)
  console.log(`[AI] Análisis completado: ${parsed.sessions.length} jornadas encontradas.`)

  // 3. Populate Database
  for (const session of parsed.sessions) {
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
        // Create/Find Club
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

        // Create/Find Gymnast
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

        // Create Inscription
        const { error: insErr } = await supabase.from('inscriptions').insert({
          gymnast_id: gymData.id,
          promotion_id: promoData.id,
          club_id: clubId
        })

        // If inscription already exists (duplicate insert), we can ignore it
        if (insErr && !insErr.message.includes('duplicate key')) {
          console.error(`[DB]     Error inscripción ${gymnast.fullName}:`, insErr.message)
        }
      }
    }
  }

  console.log('[OK] Procesamiento del programa finalizado con éxito.')
  return { success: true }
}
