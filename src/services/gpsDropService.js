import { supabase } from '../lib/supabase'

const DEFAULT_FESTIVAL_ID = 'edc-las-vegas-2026'

export async function loadGpsDrops(festivalId = DEFAULT_FESTIVAL_ID) {
  const { data, error } = await supabase
    .from('gps_drops')
    .select('*')
    .eq('festival_id', festivalId || DEFAULT_FESTIVAL_ID)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Load GPS drops error:', error)
    return []
  }

  return data || []
}

export async function createGpsDrop({
  stampId,
  festivalId,
  latitude,
  longitude,
  radiusFeet,
  title,
}) {
  const { data, error } = await supabase
    .from('gps_drops')
    .insert({
      stamp_id: stampId,
      festival_id: festivalId || DEFAULT_FESTIVAL_ID,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius_feet: Number(radiusFeet || 300),
      is_active: true,
      title: title || null,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export function distanceInFeet(lat1, lon1, lat2, lon2) {
  const earthRadiusFeet = 20902231
  const toRadians = (degrees) => degrees * (Math.PI / 180)

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusFeet * c
}

export function findNearbyGpsDrops(userLocation, drops = []) {
  if (!userLocation) return []

  return drops
    .map((drop) => {
      const distanceFeet = distanceInFeet(
        userLocation.latitude,
        userLocation.longitude,
        drop.latitude,
        drop.longitude
      )

      return {
        ...drop,
        distanceFeet,
        unlocked: distanceFeet <= (drop.radius_feet || 300),
      }
    })
    .filter((drop) => drop.unlocked)
}
