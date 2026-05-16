'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasValidEventSession } from '@/lib/auth/event-session'

type AuthorizeResult =
  | { ok: true; via: 'event-cookie' | 'supabase-user'; userId?: string }
  | { ok: false; error: string }

/**
 * Autoriza la operacion sobre `competitionId`. Acepta dos vias:
 *   1. Cookie firmada del evento (Mesa de Control).
 *   2. Sesion Supabase de un user con role superadmin
 *      o asignado en competition_admins para esa competicion.
 */
async function authorizeForCompetition(competitionId: string): Promise<AuthorizeResult> {
  // Via 1: cookie firmada del evento
  if (await hasValidEventSession(competitionId)) {
    return { ok: true, via: 'event-cookie' }
  }

  // Via 2: sesion Supabase
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
  if (!user) return { ok: false, error: 'No autorizado.' }

  const { data: prof } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (prof?.role === 'superadmin') {
    return { ok: true, via: 'supabase-user', userId: user.id }
  }

  const { count } = await supabase
    .from('competition_admins')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('competition_id', competitionId)

  if ((count ?? 0) > 0) {
    return { ok: true, via: 'supabase-user', userId: user.id }
  }

  return { ok: false, error: 'No autorizado.' }
}

// =====================================================
// Operaciones que solo el SUPERADMIN puede hacer
// =====================================================

async function requireSupabaseSuperadmin(): Promise<{ ok: true } | { ok: false; error: string }> {
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
  if (!user) return { ok: false, error: 'Sesion requerida.' }
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (prof?.role !== 'superadmin') return { ok: false, error: 'Solo superadmin.' }
  return { ok: true }
}

export async function createCompetitionAction(input: {
  name: string
  location: string
  date: string
}): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const auth = await requireSupabaseSuperadmin()
  if (!auth.ok) return auth

  const name = String(input.name || '').trim()
  const location = String(input.location || '').trim()
  const date = String(input.date || '').trim()
  if (!name || !location || !date) return { ok: false, error: 'Faltan campos.' }

  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
    '-' + Date.now().toString().slice(-8)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('competitions')
    .insert({ name, slug, location, date, status: 'draft' })
    .select('slug')
    .single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Error desconocido.' }
  return { ok: true, slug: data.slug }
}

export async function updateCompetitionVisibilityAction(
  competitionId: string,
  isPublished: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireSupabaseSuperadmin()
  if (!auth.ok) return { ok: false, error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin
    .from('competitions')
    .update({ is_published: !!isPublished })
    .eq('id', competitionId)
  return { ok: !error, error: error?.message }
}

export async function updateCompetitionStatusAction(
  competitionId: string,
  status: 'draft' | 'active' | 'finished',
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireSupabaseSuperadmin()
  if (!auth.ok) return { ok: false, error: auth.error }
  if (!['draft', 'active', 'finished'].includes(status)) {
    return { ok: false, error: 'Status invalido.' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('competitions')
    .update({ status })
    .eq('id', competitionId)
  return { ok: !error, error: error?.message }
}

// =====================================================
// Operaciones que cualquier admin del evento puede hacer
// =====================================================

export async function setEventPasswordAction(
  competitionId: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await authorizeForCompetition(competitionId)
  if (!auth.ok) return { ok: false, error: auth.error }

  const pwd = String(newPassword || '')
  if (pwd.length < 6) return { ok: false, error: 'Minimo 6 caracteres.' }
  if (pwd.length > 200) return { ok: false, error: 'Demasiado larga.' }

  const admin = createAdminClient()
  const { error } = await admin.rpc('set_competition_admin_password' as never, {
    p_competition_id: competitionId,
    p_new_password: pwd,
  } as never)
  return { ok: !error, error: error?.message }
}

/**
 * Calcula la nota final a partir de los componentes.
 * Modelo: nota = max(0, 10 + D - E - N)
 * D = dificultad, E = deducciones de ejecución (se restan a 10),
 * N = deducciones neutrales.
 */
function computeFinalScore(d: number, e: number, n: number): number {
  const raw = 10 + d - e - n
  return Math.max(0, Math.round(raw * 1000) / 1000)
}

function isUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

export async function saveScoreAction(input: {
  competitionId: string
  inscriptionId: string
  apparatus: string
  /** Dorsal opcional para doble-validación: si se pasa, debe coincidir con la inscripción. */
  dorsal?: number
  /** Promotion opcional para validar que la inscripción pertenece al grupo. */
  promotionId?: string
  dScore?: number
  eScore?: number
  nScore?: number
  /**
   * Nota final ya calculada (compat con callers legacy).
   * Si no se pasa pero hay D/E/N, se recalcula con max(0, 10 + D - E - N).
   * Si se pasa, también se valida coherencia con D/E/N (si se proveen).
   */
  score?: number
}): Promise<{ ok: boolean; error?: string; score?: number }> {
  const { competitionId, inscriptionId, apparatus } = input

  if (!isUuid(competitionId) || !isUuid(inscriptionId)) {
    return { ok: false, error: 'Identificador inválido.' }
  }
  if (input.promotionId !== undefined && !isUuid(input.promotionId)) {
    return { ok: false, error: 'Grupo inválido.' }
  }

  const dScore = Number(input.dScore ?? 0)
  const eScore = Number(input.eScore ?? 0)
  const nScore = Number(input.nScore ?? 0)

  const auth = await authorizeForCompetition(competitionId)
  if (!auth.ok) return { ok: false, error: auth.error }

  const allowed = ['vault', 'bars', 'beam', 'floor', 'pommel', 'rings', 'p_bars', 'h_bar']
  if (!allowed.includes(apparatus)) return { ok: false, error: 'Aparato inválido.' }

  if (!Number.isFinite(dScore) || dScore < 0 || dScore > 10) {
    return { ok: false, error: 'Dificultad fuera de rango.' }
  }
  if (!Number.isFinite(eScore) || eScore < 0 || eScore > 10) {
    return { ok: false, error: 'Deducción E fuera de rango.' }
  }
  if (!Number.isFinite(nScore) || nScore < 0 || nScore > 10) {
    return { ok: false, error: 'Deducción Neutral fuera de rango.' }
  }

  // Determinar la nota final:
  // - Si llegan D/E/N (algún valor != 0), recalcular siempre desde la fórmula oficial.
  // - Si solo llega score (compat legacy), usar ese score validado.
  const hasComponents = (input.dScore ?? null) !== null
    || (input.eScore ?? null) !== null
    || (input.nScore ?? null) !== null
  let score: number
  if (hasComponents) {
    score = computeFinalScore(dScore, eScore, nScore)
  } else if (typeof input.score === 'number') {
    if (!Number.isFinite(input.score)) {
      return { ok: false, error: 'Nota inválida.' }
    }
    score = Math.max(0, Math.round(input.score * 1000) / 1000)
  } else {
    return { ok: false, error: 'Falta nota o componentes.' }
  }

  if (score < 0 || score > 30) {
    return { ok: false, error: 'Nota fuera de rango.' }
  }

  // Si los componentes dejarían la nota en negativo, avisar (capeada a 0 igualmente).
  if (hasComponents) {
    const wouldBeNegative = (10 + dScore - eScore - nScore) < -0.001
    if (wouldBeNegative) {
      return {
        ok: false,
        error: 'Las deducciones dejarían la nota en negativo. Revisa los valores.',
      }
    }
  }

  const admin = createAdminClient()

  // Validar inscripción + obtener fecha y estado de competición y promotion
  const { data: ins } = await admin
    .from('inscriptions')
    .select(
      'id, dorsal, promotion_id, ' +
        'promotions:promotion_id(id, status, competition_id, competitions:competition_id(date, status))',
    )
    .eq('id', inscriptionId)
    .single()
  const compId = (ins as any)?.promotions?.competition_id
  if (!ins || compId !== competitionId) {
    return { ok: false, error: 'Inscripción inválida.' }
  }

  // Mejora 1: dorsal del request debe coincidir con el de la inscripción.
  if (typeof input.dorsal === 'number') {
    const insDorsal = (ins as any).dorsal as number | null
    if (insDorsal != null && insDorsal !== input.dorsal) {
      return {
        ok: false,
        error: `El dorsal ${input.dorsal} no pertenece a esta gimnasta.`,
      }
    }
  }

  // Mejora 1 (continuación): promotion debe coincidir con la inscripción
  if (input.promotionId && (ins as any).promotion_id !== input.promotionId) {
    return {
      ok: false,
      error: 'El dorsal no pertenece a este grupo.',
    }
  }

  // Si la competición o el grupo están "finished", solo superadmin puede modificar.
  const compStatus = (ins as any)?.promotions?.competitions?.status as string | undefined
  const promStatus = (ins as any)?.promotions?.status as string | undefined
  if (auth.via === 'event-cookie' && (compStatus === 'finished' || promStatus === 'finished')) {
    return { ok: false, error: 'La competición está cerrada.' }
  }

  // Mejora 4: solo permitir edición el día de la competición (cookie de evento).
  // Superadmin/admin con sesión Supabase pueden saltarse esta restricción.
  if (auth.via === 'event-cookie') {
    const compDateStr = (ins as any)?.promotions?.competitions?.date as string | undefined
    if (compDateStr) {
      // Comparar en zona Madrid (YYYY-MM-DD)
      const todayMadrid = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid',
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date())
      if (compDateStr !== todayMadrid) {
        return {
          ok: false,
          error: `Solo se pueden meter notas el día de la competición (${compDateStr}).`,
        }
      }
    }
  }

  const { error } = await admin
    .from('scores')
    .upsert(
      {
        inscription_id: inscriptionId,
        apparatus,
        score,
        d_score: dScore,
        e_score: eScore,
        n_score: nScore,
      },
      { onConflict: 'inscription_id,apparatus' },
    )
  if (error) return { ok: false, error: error.message }
  return { ok: true, score }
}

/**
 * Borra la nota de un aparato concreto de un gimnasta.
 * Útil cuando el juez quiere "vaciar" una nota (mejora 3: que aparezca como línea `_`).
 */
export async function deleteScoreAction(input: {
  competitionId: string
  inscriptionId: string
  apparatus: string
}): Promise<{ ok: boolean; error?: string }> {
  const { competitionId, inscriptionId, apparatus } = input
  if (!isUuid(competitionId) || !isUuid(inscriptionId)) {
    return { ok: false, error: 'Identificador inválido.' }
  }
  const allowed = ['vault', 'bars', 'beam', 'floor', 'pommel', 'rings', 'p_bars', 'h_bar']
  if (!allowed.includes(apparatus)) return { ok: false, error: 'Aparato inválido.' }

  const auth = await authorizeForCompetition(competitionId)
  if (!auth.ok) return { ok: false, error: auth.error }

  const admin = createAdminClient()
  const { data: ins } = await admin
    .from('inscriptions')
    .select(
      'id, promotions:promotion_id(status, competition_id, competitions:competition_id(date, status))',
    )
    .eq('id', inscriptionId)
    .single()
  if (!ins || (ins as any).promotions?.competition_id !== competitionId) {
    return { ok: false, error: 'Inscripción inválida.' }
  }

  const compStatus = (ins as any)?.promotions?.competitions?.status as string | undefined
  const promStatus = (ins as any)?.promotions?.status as string | undefined
  if (auth.via === 'event-cookie' && (compStatus === 'finished' || promStatus === 'finished')) {
    return { ok: false, error: 'La competición está cerrada.' }
  }
  if (auth.via === 'event-cookie') {
    const compDateStr = (ins as any)?.promotions?.competitions?.date as string | undefined
    if (compDateStr) {
      const todayMadrid = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid',
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date())
      if (compDateStr !== todayMadrid) {
        return {
          ok: false,
          error: `Solo se pueden borrar notas el día de la competición (${compDateStr}).`,
        }
      }
    }
  }

  const { error } = await admin
    .from('scores')
    .delete()
    .eq('inscription_id', inscriptionId)
    .eq('apparatus', apparatus)
  return { ok: !error, error: error?.message }
}

export async function uploadProgramAction(input: {
  competitionId: string
  fileBase64: string
  filename: string
  contentType: string
}): Promise<{ ok: boolean; signedUrl?: string; error?: string }> {
  const auth = await requireSupabaseSuperadmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  if (input.contentType !== 'application/pdf') {
    return { ok: false, error: 'Solo PDF.' }
  }
  const buf = Buffer.from(input.fileBase64, 'base64')
  if (buf.byteLength > 10 * 1024 * 1024) return { ok: false, error: 'Maximo 10 MB.' }

  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const path = `${input.competitionId}/${Date.now()}-${safeName || 'programa.pdf'}`

  const admin = createAdminClient()
  const { error: upErr } = await admin.storage
    .from('programs')
    .upload(path, buf, { contentType: 'application/pdf', upsert: true })
  if (upErr) return { ok: false, error: upErr.message }

  // Signed URL larga (7 dias). El frontend la guarda en program_url.
  const { data: signed, error: signErr } = await admin.storage
    .from('programs')
    .createSignedUrl(path, 60 * 60 * 24 * 30)
  if (signErr || !signed) return { ok: false, error: signErr?.message ?? 'No signed URL.' }

  const { error: updErr } = await admin
    .from('competitions')
    .update({ program_url: signed.signedUrl })
    .eq('id', input.competitionId)
  if (updErr) return { ok: false, error: updErr.message }

  return { ok: true, signedUrl: signed.signedUrl }
}
