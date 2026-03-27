import { createBrowserClient } from '@supabase/ssr'

export type UserRole = 'patient' | 'caregiver' | 'doctor'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  language: string
  theme: string
  medical_conditions: string[]
  linked_doctor_id: string | null
  linked_caregiver_ids: string[]
  avatar_url: string | null
  created_at: string
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return null when not configured — app uses mock data
    return null
  }

  return createBrowserClient(url, key)
}

export async function getSession() {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, role: UserRole, fullName: string) {
  const supabase = createClient()
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      role,
      language: 'en',
      theme: 'light',
    })
  }
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  if (!supabase) return
  await supabase.auth.signOut()
}
