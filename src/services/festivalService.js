import { supabase } from '../lib/supabase'

export async function loadFestivalRecords() {
  const { data, error } = await supabase
    .from('festivals')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Load festival records error:', error)
    return []
  }

  return data || []
}

export async function createFestivalRecord({
  name,
  location,
  status,
  startDate,
  endDate,
  bannerUrl,
  mapUrl,
}) {
  const { data, error } = await supabase
    .from('festivals')
    .insert({
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
