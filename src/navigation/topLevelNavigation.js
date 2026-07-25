export const TOP_LEVEL_DESTINATIONS = Object.freeze([
  Object.freeze({ id: 'festivals', label: 'FESTIVALS' }),
  Object.freeze({ id: 'dashboard', label: 'DASHBOARD' }),
  Object.freeze({ id: 'passport', label: 'PASSPORT' }),
])

export function getTopLevelDestinations() {
  return TOP_LEVEL_DESTINATIONS.map((destination) => ({
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
