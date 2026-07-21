import { supabase } from '../lib/supabase'
import {
  createStampPersistenceRecord,
  getDefaultCollectedIds,
  resolveFestivalId,
} from './festivalPersistence.js'

export async function loadCollectedIds(user, festivalId) {
  const resolvedFestivalId = resolveFestivalId(festivalId)
  const defaults = getDefaultCollectedIds(resolvedFestivalId)
  if (!user) return defaults

  const userId = typeof user === 'string' ? user : user.id
  if (!userId) return defaults

  const { data, error } = await supabase
    .from('user_stamps')
    .select('stamp_id')
    .eq('user_id', userId)
    .eq('festival_id', resolvedFestivalId)

  if (error) {
    console.error('Load collected stamps error:', error)
    return defaults
  }

  const ids = data?.map((item) => item.stamp_id) || []
  return Array.from(new Set([...defaults, ...ids]))
}

export async function loadCollectedIdsByUserId(userId, festivalId) {
  if (!userId) return []
  const resolvedFestivalId = resolveFestivalId(festivalId)

  const { data, error } = await supabase
    .from('user_stamps')
    .select('stamp_id')
    .eq('user_id', userId)
    .eq('festival_id', resolvedFestivalId)

  if (error) {
    console.error('Load public collected stamps error:', error)
    return []
  }

  return data?.map((item) => item.stamp_id) || []
}

export async function saveStamp(
  user,
  stampId,
  options = {}
) {
  if (!user) throw new Error('Login required.')
  const festivalId = typeof options === 'string' ? undefined : options.festivalId
  const claimMethod =
    typeof options === 'string'
      ? options
      : options.claimMethod || 'manual'

  const persistenceRecord = createStampPersistenceRecord({
    userId: user.id,
    stampId,
    festivalId,
    claimMethod,
  })
  const { data, error } = await supabase.from('user_stamps').upsert(
    persistenceRecord,
    {
      onConflict: 'user_id,stamp_id,festival_id',
    }
  )
    .select('user_id,stamp_id,festival_id,claim_method')
    .single()

  if (error) throw error
  if (data?.festival_id !== persistenceRecord.festival_id) {
    throw new Error(
      `Stamp persistence festival mismatch: expected ${persistenceRecord.festival_id}, received ${data?.festival_id || 'none'}.`
    )
  }

  return data
}

export async function claimStampDrop(
  user,
  stampId,
  options = {}
) {
  if (!user) throw new Error('Login required.')
  if (!stampId) throw new Error('Missing stamp claim.')
  const festivalId = typeof options === 'string' ? undefined : options.festivalId
  const claimMethod =
    typeof options === 'string'
      ? options
      : options.claimMethod || 'qr-nfc'

  const { data, error } = await supabase.rpc('claim_stamp_drop', {
    p_stamp_id: stampId,
    p_claim_method: claimMethod,
    p_festival_id: resolveFestivalId(festivalId),
  })

  if (error) throw error
  return data
}

export async function loadLiveDrops(festivalId) {
  const resolvedFestivalId = resolveFestivalId(festivalId)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('live_drops')
    .select('*')
    .eq('festival_id', resolvedFestivalId)
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)

  if (error) {
    console.error('Load live drops error:', error)
    return []
  }

  return data || []
}

export async function setLiveDrop(stampId, isActive, festivalId) {
  const resolvedFestivalId = resolveFestivalId(festivalId)
  if (!isActive) {
    const { error } = await supabase
      .from('live_drops')
      .update({
        is_active: false,
      })
      .eq('stamp_id', stampId)
      .eq('festival_id', resolvedFestivalId)

    if (error) throw error
    return
  }

  const { error } = await supabase.from('live_drops').upsert(
    {
      id: `${stampId}-${resolvedFestivalId}`,
      stamp_id: stampId,
      festival_id: resolvedFestivalId,
      is_active: true,
      claim_code: `${stampId}-${Date.now()}`,
    },
    {
      onConflict: 'stamp_id,festival_id',
    }
  )

  if (error) throw error
}

export async function setAdvancedLiveDrop(stampId, options = {}) {
  const festivalId = resolveFestivalId(options.festivalId)
  const { error } = await supabase.from('live_drops').upsert(
    {
      id: `${stampId}-${festivalId}`,
      stamp_id: stampId,
      festival_id: festivalId,
      is_active: options.isActive ?? true,
      claim_code: options.claimCode || `${stampId}-${Date.now()}`,
      starts_at: options.startsAt || null,
      ends_at: options.endsAt || null,
      is_secret: options.isSecret ?? false,
      is_legendary: options.isLegendary ?? false,
      max_claims: options.maxClaims || null,
    },
    {
      onConflict: 'stamp_id,festival_id',
    }
  )

  if (error) throw error
}

export function getClaimUrl(stampId, token = '') {
  const baseUrl = 'https://edm-passport-v2.vercel.app'
  const params = new URLSearchParams()

  params.set('claim', stampId)

  if (token) {
    params.set('token', token)
  }

  return `${baseUrl}?${params.toString()}`
}
