import { supabase } from '../lib/supabase.js'

function logProfilePersistence(operation, values) {
  if (!import.meta.env?.DEV) return
  console.info(`[profile:${operation}]`, {
    authenticatedUserId: values.authenticatedUserId || null,
    authenticatedEmail: values.authenticatedEmail || null,
    table: 'profiles',
    filter: values.filter || null,
    profileRowId: values.profileRowId || null,
    profileOwnerId: values.profileOwnerId || null,
    raveName: values.raveName || null,
    country: values.country || null,
  })
}

export function assertProfileOwnership(profile, authenticatedUserId) {
  if (!profile) return null
  if (!authenticatedUserId || profile.id !== authenticatedUserId) {
    throw new Error(
      `Profile ownership mismatch: authenticated user ${authenticatedUserId || 'none'}, profile row ${profile.id || 'none'}.`
    )
  }
  return profile
}

async function requireAuthenticatedUser(expectedUser = null) {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error

  const authenticatedUser = data?.user || null
  if (!authenticatedUser?.id) {
    throw new Error('No authenticated user is available for this profile operation.')
  }

  const expectedUserId =
    typeof expectedUser === 'string' ? expectedUser : expectedUser?.id
  if (expectedUserId && authenticatedUser.id !== expectedUserId) {
    throw new Error(
      `Authenticated user mismatch: expected ${expectedUserId}, received ${authenticatedUser.id}.`
    )
  }

  return authenticatedUser
}

export function getProfileDisplayName(profile, user, fallbackRaveName = '') {
  return (
    profile?.rave_name ||
    fallbackRaveName ||
    'Passport Holder'
  )
}

export async function loadProfile(user) {
  if (!user) return null

  const authenticatedUser = await requireAuthenticatedUser(user)
  const userId = authenticatedUser.id
  logProfilePersistence('select-request', {
    authenticatedUserId: userId,
    authenticatedEmail: authenticatedUser.email,
    profileOwnerId: userId,
    filter: `id=eq.${userId}`,
  })

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,rave_name,country,avatar_url,created_at,updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  const ownedProfile = assertProfileOwnership(data, userId)
  logProfilePersistence('select-result', {
    authenticatedUserId: userId,
    authenticatedEmail: authenticatedUser.email,
    profileRowId: ownedProfile?.id,
    profileOwnerId: ownedProfile?.id,
    raveName: ownedProfile?.rave_name,
    country: ownedProfile?.country,
  })
  return ownedProfile
}

export async function loadPublicProfile(userId) {
  if (!userId) return null
  const { data: authData } = await supabase.auth.getUser()
  logProfilePersistence('public-select-request', {
    authenticatedUserId: authData?.user?.id,
    authenticatedEmail: authData?.user?.email,
    profileOwnerId: userId,
    filter: `id=eq.${userId}`,
  })

  const { data, error } = await supabase
    .from('profiles')
    .select('id,rave_name,country,avatar_url,created_at,updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Load public profile error:', error)
    return null
  }

  logProfilePersistence('public-select-result', {
    authenticatedUserId: authData?.user?.id,
    authenticatedEmail: authData?.user?.email,
    profileRowId: data?.id,
    profileOwnerId: userId,
    raveName: data?.rave_name,
    country: data?.country,
  })
  return data
}

export async function saveProfile(user, profileInput = {}) {
  if (!user) throw new Error('Login required.')

  const authenticatedUser = await requireAuthenticatedUser(user)
  const { raveName, country, avatarUrl } = profileInput

  const profilePayload = {
    id: authenticatedUser.id,
    email: authenticatedUser.email,
    rave_name: raveName?.trim() || null,
    country: country || null,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl !== undefined) {
    profilePayload.avatar_url = avatarUrl || null
  }

  logProfilePersistence('upsert-request', {
    authenticatedUserId: authenticatedUser.id,
    authenticatedEmail: authenticatedUser.email,
    profileRowId: profilePayload.id,
    profileOwnerId: profilePayload.id,
    filter: 'on_conflict=id',
    raveName: profilePayload.rave_name,
    country: profilePayload.country,
  })

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })
    .select('id,email,rave_name,country,avatar_url,created_at,updated_at')
    .single()

  if (error) throw error

  const ownedProfile = assertProfileOwnership(data, authenticatedUser.id)
  logProfilePersistence('upsert-result', {
    authenticatedUserId: authenticatedUser.id,
    authenticatedEmail: authenticatedUser.email,
    profileRowId: ownedProfile.id,
    profileOwnerId: ownedProfile.id,
    raveName: ownedProfile.rave_name,
    country: ownedProfile.country,
  })
  return ownedProfile
}
