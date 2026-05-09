'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { hasValidEventSession } from '@/lib/auth/event-session'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseProgramFromBase64 } from '../services/program-parser'

async function authorize(competitionId: string): Promise<boolean> {
  if (await hasValidEventSession(competitionId)) return true
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch { /* noop */ }
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (prof?.role === 'superadmin') return true
  const { count } = await supabase
    .from('competition_admins')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('competition_id', competitionId)
  return (count ?? 0) > 0
}

export async function processProgramAction(competitionId: string, base64Pdf: string) {
  if (!(await authorize(competitionId))) throw new Error('Unauthorized')

  console.log('[AI] Iniciando analisis del programa...')
  const parsed = await parseProgramFromBase64(base64Pdf)
  console.log(`[AI] Analisis completado: ${parsed.sessions.length} jornadas encontradas.`)

  const supabase = createAdminClient()

  for (const session of parsed.sessions) {
    const { data: sessData, error: sessErr } = await supabase
      .from('sessions')
      .upsert(
        { competition_id: competitionId, name: session.name, ord: session.order },
        { onConflict: 'competition_id,name' },
      )
      .select()
      .single()
    if (sessErr || !sessData) {
      console.error('[DB] Error insertando jornada:', sessErr?.message)
      continue
    }

    for (const promo of session.promotions) {
      const { data: promoData, error: promoErr } = await supabase
        .from('promotions')
        .upsert(
          {
            session_id: sessData.id,
            competition_id: competitionId,
            name: promo.name,
            gender: promo.gender,
            gymnast_count: promo.gymnasts.length,
            status: 'pending',
          },
          { onConflict: 'session_id,name' },
        )
        .select()
        .single()
      if (promoErr || !promoData) continue

      for (const gymnast of promo.gymnasts) {
        const clubName = gymnast.clubName.trim()
        const { data: clubData, error: clubErr } = await supabase
          .from('clubs')
          .upsert({ name: clubName }, { onConflict: 'name' })
          .select()
          .single()
        if (clubErr || !clubData) continue

        const { data: gymData, error: gymErr } = await supabase
          .from('gymnasts')
          .upsert(
            { full_name: gymnast.fullName.trim(), club_id: clubData.id },
            { onConflict: 'full_name,club_id' },
          )
          .select()
          .single()
        if (gymErr || !gymData) continue

        const { error: insErr } = await supabase
          .from('inscriptions')
          .insert({
            gymnast_id: gymData.id,
            promotion_id: promoData.id,
            club_id: clubData.id,
          })
        if (insErr && !insErr.message.includes('duplicate key')) {
          console.error('[DB] Error inscripcion:', insErr.message)
        }
      }
    }
  }
  return { success: true }
}
