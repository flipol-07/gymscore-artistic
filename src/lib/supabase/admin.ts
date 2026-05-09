import { createClient } from '@supabase/supabase-js'

// Cliente con service_role: SOLO uso en Server Actions / Route Handlers
// y SOLO despues de haber autorizado al usuario (cookie firmada del evento
// o sesion Supabase de superadmin). Nunca exponer al cliente.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL ausente')
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente')
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
