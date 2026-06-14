import { supabase } from '../lib/supabase'

function createId() {
  return `festival-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
}

export async function loadFestivalRecords() {
  const { data, error } = await supabase.from('festivals').select('*').order('start_date', { ascending: true })
  if (error) return []
  return data || []
}

export async function createFestivalRecord({ name, location, status, startDate, endDate, bannerUrl, mapUrl }) {
  const { data, error } = await supabase
    .from('festivals')
    .insert({
      id: createId(),
      name,
      location,
      status: status || 'upcoming',
      start_date: startDate || null,
      end_date: endDate || null,
      banner_url: bannerUrl || null,
      map_url: mapUrl || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
