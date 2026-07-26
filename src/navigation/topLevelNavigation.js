export const TOP_LEVEL_DESTINATIONS = Object.freeze([
  Object.freeze({ id: 'festivals', label: 'FESTIVALS' }),
  Object.freeze({ id: 'dashboard', label: 'DASHBOARD' }),
  Object.freeze({ id: 'passport', label: 'PASSPORT' }),
])

export const ADMIN_TOP_LEVEL_DESTINATION = Object.freeze({
  id: 'admin',
  label: 'BACKSTAGE',
})

export function getTopLevelDestinations(isAdmin = false) {
  const destinations = isAdmin
    ? [...TOP_LEVEL_DESTINATIONS, ADMIN_TOP_LEVEL_DESTINATION]
    : TOP_LEVEL_DESTINATIONS

  return destinations.map((destination) => ({
    ...destination,
  }))
}

export function getAuthenticatedLandingDestination() {
  return 'festivals'
}

export function canOpenEditionDestination(
  destination,
  selectedFestivalId
) {
  if (destination === 'festivals') return true
  return Boolean(selectedFestivalId)
}
