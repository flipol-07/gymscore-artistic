'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { hasValidEventSession } from '@/lib/auth/event-session'
import { createAdminClient } from '@/lib/supabase/admin'

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') inQuotes = !inQuotes
    else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else current += char
  }
  result.push(current)
  return result.map((s) => s.trim())
}

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

export async function processCsvAction(competitionId: string, csvContent: string) {
  if (!(await authorize(competitionId))) throw new Error('Unauthorized')

  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) throw new Error('El archivo CSV esta vacio o le falta la cabecera.')
  const dataLines = lines.slice(1)

  const sessionsMap: Record<string, {
    name: string
    order: number
    promotions: Record<string, {
      name: string
      gender: 'female' | 'male'
      gymnasts: { fullName: string; clubName: string }[]
    }>
  }> = {}

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
      sess.promotions[promoKey] = {
        name: categoriaName,
        gender: (genero.toLowerCase() === 'male' || genero.toLowerCase() === 'm') ? 'male' : 'female',
        gymnasts: [],
      }
    }
    sess.promotions[promoKey].gymnasts.push({ fullName: gymnastName, clubName })
  }

  const sessions = Object.values(sessionsMap).map((s) => ({
    ...s,
    promotions: Object.values(s.promotions),
  }))

  const supabase = createAdminClient()

  for (const session of sessions) {
    const { data: sessData, error: sessErr } = await supabase
      .from('sessions')
      .upsert(
        { competition_id: competitionId, name: session.name, ord: session.order },
        { onConflict: 'competition_id,name' },
      )
      .select()
      .single()
    if (sessErr || !sessData) continue

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
