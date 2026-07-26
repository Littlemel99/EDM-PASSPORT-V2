import { supabase } from '../lib/supabase.js'
import { resolveFestivalId } from './festivalPersistence.js'

export function getFestivalHistoryIds({
  stampRecords = [],
  memoryRecords = [],
} = {}) {
  return Array.from(
    new Set(
      [...stampRecords, ...memoryRecords]
        .map((record) => resolveFestivalId(record?.festival_id))
        .filter(Boolean)
    )
  )
}

export async function loadUserFestivalHistoryIds(userId) {
  if (!userId) return []

  const [stamps, memories] = await Promise.all([
    supabase
      .from('user_stamps')
      .select('festival_id')
      .eq('user_id', userId),
    supabase
      .from('memories')
      .select('festival_id')
      .eq('user_id', userId),
  ])

  if (stamps.error) {
    console.error('Festival stamp history load error:', stamps.error)
  }
  if (memories.error) {
    console.error('Festival memory history load error:', memories.error)
  }

  return getFestivalHistoryIds({
    stampRecords: stamps.error ? [] : stamps.data || [],
    memoryRecords: memories.error ? [] : memories.data || [],
  })
}

