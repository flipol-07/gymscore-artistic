'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createAdminAction(email: string, pass: string, competitionId: string) {
  const cookieStore = await cookies()
  
  // 1. Check if the current user is a superadmin
  const userClient = createServerClient(
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

  const { data: { user } } = await userClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: prof } = await userClient.from('profiles').select('role').eq('id', user.id).single()
  if (prof?.role !== 'superadmin') throw new Error('Only superadmins can create new admins')

  // 2. Use Admin Client (Service Role) to create user bypassing rate limits
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('CONFIG_ERROR: Falta la SUPABASE_SERVICE_ROLE_KEY en el servidor.')
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 3. Create user
  const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true, // Confirm bypass
    user_metadata: { role: 'event_admin' }
  })

  if (createErr) {
    // If user already exists, we might want to just link them if they are not already admin
    if (createErr.message.includes('already registered')) {
      // Find existing user
      const { data: existingUser } = await adminClient.from('profiles').select('id').eq('email', email).single()
      if (existingUser) {
        // Link to competition
        await adminClient.from('competition_admins').insert({
          competition_id: competitionId,
          profile_id: existingUser.id
        })
        return { success: true, message: 'Usuario existente vinculado al evento.' }
      }
    }
    throw new Error(createErr.message)
  }

  // 4. Trigger profile creation and role (if not done by DB trigger)
  // Our DB trigger handles handle_new_user, so we just link to competition_admins
  if (newUser.user) {
    const { error: assignErr } = await adminClient
      .from('competition_admins')
      .insert({
        competition_id: competitionId,
        profile_id: newUser.user.id
      })
    
    if (assignErr) throw new Error('Error vinculando al evento: ' + assignErr.message)
  }

  return { success: true }
}
