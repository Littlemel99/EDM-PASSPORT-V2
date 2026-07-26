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

export function restoreActiveJourneyFestivalId(storage, userId) {
  try {
    return getActiveJourneyFestivalId(storage, userId)
  } catch (error) {
    throw new Error(
      `Active Journey restore failed: ${error.message || 'browser storage is unavailable.'}`,
      { cause: error }
    )
  }
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

export function resolveActiveJourneyStartup(storage, userId) {
  const authenticatedUserId = String(userId || '').trim()
  if (!authenticatedUserId) {
    throw new Error(
      'Authenticated user UUID is required for Active Journey restore.'
    )
  }

  const festivalId = restoreActiveJourneyFestivalId(
    storage,
    authenticatedUserId
  )

  return Object.freeze({
    authenticatedUserId,
    festivalId,
    destination: getActiveJourneyLandingDestination(festivalId),
  })
}
