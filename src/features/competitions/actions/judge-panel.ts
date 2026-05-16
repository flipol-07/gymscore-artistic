'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { hasValidEventSession } from '@/lib/auth/event-session'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface JudgeInscription {
  inscriptionId: string
  dorsal: number | null
  gymnastName: string
  clubName: string
  scores: Record<string, { d: number; e: number; n: number; total: number } | null>
}

export interface JudgePanelData {
  ok: true
  competitionId: string
  competitionName: string
  competitionDate: string
  categoryName: string
  promotionId: string
  gender: 'female' | 'male'
  /** Fecha de hoy en zona Madrid (YYYY-MM-DD). Cliente compara con competitionDate. */
  todayMadrid: string
  inscriptions: JudgeInscription[]
}

async function isAuthorized(
  competitionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (await hasValidEventSession(competitionId)) return { ok: true }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(c: { name: string; value: string; options: any }[]) {
          try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch { /* noop */ }
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado.' }
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (prof?.role === 'superadmin') return { ok: true }
  const { count } = await supabase
    .from('competition_admins')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('competition_id', competitionId)
  if ((count ?? 0) > 0) return { ok: true }
  return { ok: false, error: 'No autorizado.' }
}

export async function getJudgePanelData(
  promotionId: string,
): Promise<JudgePanelData | { ok: false; error: string }> {
  if (!isUuid(promotionId)) return { ok: false, error: 'Grupo inválido.' }
  const admin = createAdminClient()

  // 1º resolver competition_id minimamente para autorizar SIN exponer ningún campo.
  const { data: promMin } = await admin
    .from('promotions')
    .select('competition_id')
    .eq('id', promotionId)
    .single()
  if (!promMin) return { ok: false, error: 'Grupo no encontrado.' }

  const competitionId = (promMin as any).competition_id as string
  const auth = await isAuthorized(competitionId)
  if (!auth.ok) return { ok: false, error: auth.error }

  // 2º ahora sí cargar el detalle de la promoción.
  const { data: prom, error: promErr } = await admin
    .from('promotions')
    .select(
      'id, name, gender, competition_id, competitions:competition_id(name, date)',
    )
    .eq('id', promotionId)
    .single()
  if (promErr || !prom) return { ok: false, error: 'Grupo no encontrado.' }

  const { data: rows } = await admin
    .from('inscriptions')
    .select(
      'id, dorsal, gymnasts:gymnast_id(full_name), clubs:club_id(name), scores(apparatus, score, d_score, e_score, n_score)',
    )
    .eq('promotion_id', promotionId)
    .order('dorsal', { ascending: true, nullsFirst: false })

  const inscriptions: JudgeInscription[] = (rows ?? []).map((r: any) => {
    const scoresMap: Record<string, { d: number; e: number; n: number; total: number } | null> = {}
    for (const s of r.scores ?? []) {
      scoresMap[s.apparatus] = {
        d: Number(s.d_score ?? 0),
        e: Number(s.e_score ?? 0),
        n: Number(s.n_score ?? 0),
        total: Number(s.score ?? 0),
      }
    }
    return {
      inscriptionId: r.id,
      dorsal: r.dorsal,
      gymnastName: r.gymnasts?.full_name ?? 'Desconocida',
      clubName: r.clubs?.name ?? '',
      scores: scoresMap,
    }
  })

  const todayMadrid = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())

  return {
    ok: true,
    competitionId,
    competitionName: (prom as any).competitions?.name ?? '',
    competitionDate: (prom as any).competitions?.date ?? '',
    categoryName: (prom as any).name ?? '',
    promotionId,
    gender: ((prom as any).gender ?? 'female') as 'female' | 'male',
    todayMadrid,
    inscriptions,
  }
}

function isUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

/** Búsqueda por dorsal dentro de un grupo. Devuelve la inscripción si existe. */
export async function findInscriptionByDorsal(
  promotionId: string,
  dorsal: number,
): Promise<{ ok: true; inscriptionId: string; gymnastName: string } | { ok: false; error: string }> {
  if (!isUuid(promotionId)) return { ok: false, error: 'Grupo inválido.' }
  if (!Number.isFinite(dorsal) || dorsal < 0) return { ok: false, error: 'Dorsal inválido.' }

  const admin = createAdminClient()

  // Resolver competition para autorizar antes de exponer nombres.
  const { data: prom } = await admin
    .from('promotions')
    .select('competition_id')
    .eq('id', promotionId)
    .single()
  if (!prom) return { ok: false, error: 'Grupo no encontrado.' }
  const auth = await isAuthorized((prom as any).competition_id as string)
  if (!auth.ok) return { ok: false, error: auth.error }

  const { data } = await admin
    .from('inscriptions')
    .select('id, gymnasts:gymnast_id(full_name)')
    .eq('promotion_id', promotionId)
    .eq('dorsal', dorsal)
    .maybeSingle()
  if (!data) {
    return { ok: false, error: `Dorsal ${dorsal} no pertenece a este grupo.` }
  }
  return {
    ok: true,
    inscriptionId: (data as any).id,
    gymnastName: (data as any).gymnasts?.full_name ?? 'Desconocida',
  }
}
