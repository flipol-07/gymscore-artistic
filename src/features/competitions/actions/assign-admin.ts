'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function assignAdminAction(profileId: string, competitionId: string) {
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

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check superadmin permissions
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (prof?.role !== 'superadmin') throw new Error('Forbidden')

  // Use Admin Client (Service Role) to bypass RLS (since no policies exist yet)
  const { createClient } = await import('@supabase/supabase-js')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('CONFIG_ERROR: Falta SUPABASE_SERVICE_ROLE_KEY')

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )

  // Assign using admin client
  const { error } = await adminClient
    .from('competition_admins')
    .insert({
      competition_id: competitionId,
      profile_id: profileId
    })

  if (error && !error.message.includes('duplicate key')) {
    throw new Error('Error vinculando: ' + error.message)
  }

  return { success: true }
}

export async function getAllAdminsAction() {
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

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'event_admin')
    .order('email', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}
