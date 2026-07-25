import {
  createUserStorageKey,
  readUserStorage,
  writeUserStorage,
} from '../auth/accountIsolation.js'

export const ACTIVE_JOURNEY_STORAGE_KEY = 'activeFestivalEditionId'

export function getActiveJourneyFestivalId(storage, userId) {
  return readUserStorage(
    storage,
    ACTIVE_JOURNEY_STORAGE_KEY,
    userId,
    ''
  )
}

export function setActiveJourneyFestivalId(
  storage,
  userId,
  festivalEditionId
) {
  const editionId = String(festivalEditionId || '').trim()
  if (!editionId) return false
  return writeUserStorage(
    storage,
    ACTIVE_JOURNEY_STORAGE_KEY,
    userId,
    editionId
  )
}

export function clearActiveJourneyFestivalId(storage, userId) {
  const key = createUserStorageKey(
    ACTIVE_JOURNEY_STORAGE_KEY,
    userId
  )
  if (!key) return false
  storage.removeItem(key)
  return true
}

export function getActiveJourneyLandingDestination(
  activeFestivalEditionId
) {
  return activeFestivalEditionId ? 'dashboard' : 'festivals'
}
