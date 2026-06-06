import { stageLocations } from '../data/stageLocations'

export function getDistanceMeters(pointA, pointB) {
  const earth = 6371000
  const rad = (value) => (value * Math.PI) / 180

  const dLat = rad(pointB.latitude - pointA.latitude)
  const dLon = rad(pointB.longitude - pointA.longitude)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(pointA.latitude)) *
      Math.cos(rad(pointB.latitude)) *
      Math.sin(dLon / 2) ** 2

  return Math.round(
    earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  )
}

export function getGpsStatus(stampId, location) {
  const zone = stageLocations[stampId]

  if (!zone) {
    return {
      required: false,
      unlocked: true,
      message: 'No GPS lock required.',
    }
  }

  if (!location) {
    return {
      required: true,
      unlocked: false,
      message: 'Location needed for this stage stamp.',
    }
  }

  const distance = getDistanceMeters(location, zone)

  return {
    required: true,
    unlocked: distance <= zone.radiusMeters,
    distance,
    message:
      distance <= zone.radiusMeters
        ? `GPS unlocked near ${zone.label}.`
        : `Move closer to ${zone.label}. About ${distance}m away.`,
  }
}
