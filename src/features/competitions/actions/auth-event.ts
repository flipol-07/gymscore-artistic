'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { issueEventSession, clearEventSession, hasValidEventSession } from '@/lib/auth/event-session'

// Login del evento: el cliente solo manda el password.
// Si es valido, emitimos cookie HttpOnly firmada y devolvemos slug/name/id.
export async function loginEventAction(
  password: string,
): Promise<
  | { ok: true; competition: { id: string; name: string; slug: string } }
  | { ok: false; error: string }
> {
  const pwd = String(password || '')
  if (!pwd) return { ok: false, error: 'Contrasena requerida.' }
  if (pwd.length > 200) return { ok: false, error: 'Entrada invalida.' }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('get_competition_by_password' as never, {
    p_password: pwd,
  } as never)
  if (error || !data || (data as any).length === 0) {
    return { ok: false, error: 'Contrasena incorrecta o evento no vigente.' }
  }
  const comp = (data as any)[0] as { id: string; name: string; slug: string }
  await issueEventSession(comp.id)
  return { ok: true, competition: comp }
}

// Verificar si el cliente ya esta autenticado para este evento.
export async function isEventAuthenticatedAction(competitionId: string): Promise<boolean> {
  return hasValidEventSession(competitionId)
}

// Logout del evento.
export async function logoutEventAction(competitionId: string): Promise<void> {
  await clearEventSession(competitionId)
}

// Verificacion via password (caso "introduce password en /admin/competiciones/[slug]").
export async function verifyEventPasswordAction(
  competitionId: string,
  password: string,
): Promise<{ ok: boolean }> {
  const pwd = String(password || '')
  if (!pwd) return { ok: false }
  if (pwd.length > 200) return { ok: false }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('verify_competition_password' as never, {
    p_competition_id: competitionId,
    p_password: pwd,
  } as never)
  if (error || !data) return { ok: false }
  await issueEventSession(competitionId)
  return { ok: true }
}
