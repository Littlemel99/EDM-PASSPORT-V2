import { supabase } from '../lib/supabase'

export function getProfileDisplayName(profile, user, fallbackRaveName = '') {
  return (
    profile?.rave_name ||
    fallbackRaveName ||
    'Passport Holder'
  )
}

export async function loadProfile(user) {
  if (!user) return null

  const userId = typeof user === 'string' ? user : user.id
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,rave_name,country,avatar_url,created_at,updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Load profile error:', error)
    return null
  }

  return data
}

export async function loadPublicProfile(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id,rave_name,country,avatar_url,created_at,updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Load public profile error:', error)
    return null
  }

  return data
}

export async function saveProfile(user, profileInput = {}) {
  if (!user) throw new Error('Login required.')

  const { raveName, country, avatarUrl } = profileInput

  const profilePayload = {
    id: user.id,
    email: user.email,
    rave_name: raveName?.trim() || null,
    country: country || null,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl !== undefined) {
    profilePayload.avatar_url = avatarUrl || null
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })
    .select('id,email,rave_name,country,avatar_url,created_at,updated_at')
    .single()

  if (error) throw error

  return data
}
