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

export async function saveScoreAction(input: {
  competitionId: string
  inscriptionId: string
  apparatus: string
  score: number
  dScore?: number
  eScore?: number
}): Promise<{ ok: boolean; error?: string }> {
  const { competitionId, inscriptionId, apparatus, score } = input
  const dScore = input.dScore ?? 0
  const eScore = input.eScore ?? 0

  const auth = await authorizeForCompetition(competitionId)
  if (!auth.ok) return { ok: false, error: auth.error }

  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 30) {
    return { ok: false, error: 'Nota fuera de rango.' }
  }
  const allowed = ['vault', 'bars', 'beam', 'floor', 'pommel', 'rings', 'p_bars', 'h_bar']
  if (!allowed.includes(apparatus)) return { ok: false, error: 'Aparato invalido.' }

  const admin = createAdminClient()
  // Confirmar que la inscripcion pertenece a la competicion (defensa en profundidad)
  const { data: ins } = await admin
    .from('inscriptions')
    .select('id, promotions:promotion_id(competition_id)')
    .eq('id', inscriptionId)
    .single()
  const compId = (ins as any)?.promotions?.competition_id
  if (!ins || compId !== competitionId) return { ok: false, error: 'Inscripcion invalida.' }

  const { error } = await admin
    .from('scores')
    .upsert(
      {
        inscription_id: inscriptionId,
        apparatus,
        score,
        d_score: dScore,
        e_score: eScore,
      },
      { onConflict: 'inscription_id,apparatus' },
    )
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
