import { supabase } from '../lib/supabase'

export async function loadUserFestivalAttendance(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('festival_attendance')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Load festival attendance error:', error)
    return []
  }

  return data || []
}

export async function saveFestivalAttendance({ festivalId, userId, userEmail, status }) {
  if (!festivalId) throw new Error('Festival is required.')
  if (!userId) throw new Error('User is required.')
  if (!['going', 'interested'].includes(status)) throw new Error('Attendance status is invalid.')

  const { data, error } = await supabase
    .from('festival_attendance')
    .upsert(
      {
        festival_id: festivalId,
        user_id: userId,
        user_email: userEmail || null,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'festival_id,user_id' }
    )
    .select()
    .single()

  if (error) throw error

  return data
}

export async function loadFestivalDemandSummary() {
  const { data, error } = await supabase
    .from('festival_demand_summary')
    .select('*')

  if (error) {
    console.error('Load festival demand summary error:', error)
    return []
  }

  return data || []
}
