import { supabase } from '../lib/supabase'

const FESTIVAL_ID = 'edc-las-vegas-2026'

export async function loadCollectedIds(user) {
  if (!user) return ['world-party-parade']

  const userId = typeof user === 'string' ? user : user.id
  if (!userId) return ['world-party-parade']

  const { data, error } = await supabase
    .from('user_stamps')
    .select('stamp_id')
    .eq('user_id', userId)
    .eq('festival_id', FESTIVAL_ID)

  if (error) {
    console.error('Load collected stamps error:', error)
    return ['world-party-parade']
  }

  const ids = data?.map((item) => item.stamp_id) || []
  return Array.from(new Set(['world-party-parade', ...ids]))
}

export async function loadCollectedIdsByUserId(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('user_stamps')
    .select('stamp_id')
    .eq('user_id', userId)
    .eq('festival_id', FESTIVAL_ID)

  if (error) {
    console.error('Load public collected stamps error:', error)
    return []
  }

  return data?.map((item) => item.stamp_id) || []
}

export async function saveStamp(user, stampId, claimMethod = 'manual') {
  if (!user) throw new Error('Login required.')

  const { error } = await supabase.from('user_stamps').upsert(
    {
      user_id: user.id,
      stamp_id: stampId,
      festival_id: FESTIVAL_ID,
      claim_method: claimMethod,
    },
    {
      onConflict: 'user_id,stamp_id,festival_id',
    }
  )

  if (error) throw error
}

export async function claimStampDrop(user, stampId, claimMethod = 'qr-nfc') {
  if (!user) throw new Error('Login required.')
  if (!stampId) throw new Error('Missing stamp claim.')

  const { data, error } = await supabase.rpc('claim_stamp_drop', {
    p_stamp_id: stampId,
    p_claim_method: claimMethod,
  })

  if (error) throw error
  return data
}

export async function loadLiveDrops(festivalId = FESTIVAL_ID) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('live_drops')
    .select('*')
    .eq('festival_id', festivalId || FESTIVAL_ID)
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)

  if (error) {
    console.error('Load live drops error:', error)
    return []
  }

  return data || []
}

export async function setLiveDrop(stampId, isActive) {
  if (!isActive) {
    const { error } = await supabase
      .from('live_drops')
      .update({
        is_active: false,
      })
      .eq('stamp_id', stampId)
      .eq('festival_id', FESTIVAL_ID)

    if (error) throw error
    return
  }

  const { error } = await supabase.from('live_drops').upsert(
    {
      id: `${stampId}-${FESTIVAL_ID}`,
      stamp_id: stampId,
      festival_id: FESTIVAL_ID,
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
  const { error } = await supabase.from('live_drops').upsert(
    {
      id: `${stampId}-${FESTIVAL_ID}`,
      stamp_id: stampId,
      festival_id: FESTIVAL_ID,
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
