import { supabase } from '../lib/supabase'
import { resolveFestivalId } from './festivalPersistence.js'

export async function loadMemories(user, festivalId) {
  if (!user) return []
  const resolvedFestivalId = resolveFestivalId(festivalId)

  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .eq('festival_id', resolvedFestivalId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Memory load error:', error)
    return []
  }

  return data || []
}

export async function loadMemoriesByStamp(user, stampId, festivalId) {
  if (!user || !stampId) return []
  const resolvedFestivalId = resolveFestivalId(festivalId)

  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .eq('festival_id', resolvedFestivalId)
    .eq('stamp_id', stampId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Memory by stamp load error:', error)
    return []
  }

  return data || []
}

export async function saveMemory(
  user,
  note,
  stampId = null,
  imageUrl = null,
  eventDay = 'EDC 2026',
  eventTitle = '',
  festivalId
) {
  if (!user) throw new Error('You must be logged in to save a memory.')

  const { error } = await supabase.from('memories').insert({
    user_id: user.id,
    festival_id: resolveFestivalId(festivalId),
    stamp_id: stampId,
    note,
    image_url: imageUrl,
    event_day: eventDay,
    event_title: eventTitle,
  })

  if (error) throw error
}

export async function uploadMemoryImage(user, file) {
  if (!user) throw new Error('You must be logged in to upload an image.')
  if (!file) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('memories')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from('memories').getPublicUrl(fileName)

  return data.publicUrl
}

export function groupMemoriesByStamp(memories = []) {
  return memories.reduce((groups, memory) => {
    const key = memory.stamp_id || 'festival'

    if (!groups[key]) {
      groups[key] = []
    }

    groups[key].push(memory)

    return groups
  }, {})
}

export function groupMemoriesByDay(memories = []) {
  return memories.reduce((groups, memory) => {
    const key = memory.event_day || 'EDC 2026'

    if (!groups[key]) {
      groups[key] = []
    }

    groups[key].push(memory)

    return groups
  }, {})
}
