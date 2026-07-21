import { supabase } from '../lib/supabase'
import { resolveFestivalId } from './festivalPersistence.js'

export async function loadGpsDrops(festivalId) {
  const resolvedFestivalId = resolveFestivalId(festivalId)
  const { data, error } = await supabase
    .from('gps_drops')
    .select('*')
    .eq('festival_id', resolvedFestivalId)
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
  mapImageUrl,
  mapXPercent,
  mapYPercent,
  mapNote,
}) {
  const { data, error } = await supabase
    .from('gps_drops')
    .insert({
      stamp_id: stampId,
      festival_id: resolveFestivalId(festivalId),
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius_feet: Number(radiusFeet || 300),
      is_active: true,
      title: title || null,
      map_image_url: mapImageUrl || null,
      map_x_percent: mapXPercent === undefined || mapXPercent === null || mapXPercent === '' ? null : Number(mapXPercent),
      map_y_percent: mapYPercent === undefined || mapYPercent === null || mapYPercent === '' ? null : Number(mapYPercent),
      map_note: mapNote || null,
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
