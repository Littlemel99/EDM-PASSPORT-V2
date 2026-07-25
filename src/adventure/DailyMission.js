import {
  createFestivalStorageKey,
  LEGACY_EDC_FESTIVAL_ID,
  resolveFestivalId,
} from '../services/festivalPersistence.js'

export const MISSION_STORAGE_KEY = 'edm-daily-festival-mission'
export const MISSION_TARGET = 3

export function getMissionStorageKey(festivalId, userId = '') {
  const festivalKey = createFestivalStorageKey(
    MISSION_STORAGE_KEY,
    resolveFestivalId(festivalId)
  )
  return userId ? `${festivalKey}:user:${userId}` : festivalKey
}

export function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function loadStoredMission(
  festivalId,
  storage = localStorage,
  userId = ''
) {
  const resolvedFestivalId = resolveFestivalId(festivalId)
  const storageKey = getMissionStorageKey(resolvedFestivalId, userId)

  try {
    const rawMission = storage.getItem(storageKey)
    if (rawMission) return JSON.parse(rawMission)

    // Existing releases stored EDC's mission without a festival suffix.
    // Migrate it lazily so existing progress survives this milestone.
    if (!userId && resolvedFestivalId === LEGACY_EDC_FESTIVAL_ID) {
      const legacyMission = storage.getItem(MISSION_STORAGE_KEY)
      if (!legacyMission) return null

      const parsedMission = {
        ...JSON.parse(legacyMission),
        festivalId: resolvedFestivalId,
      }
      storage.setItem(storageKey, JSON.stringify(parsedMission))
      return parsedMission
    }

    return null
  } catch {
    return null
  }
}

export function saveStoredMission(
  mission,
  festivalId,
  storage = localStorage,
  userId = ''
) {
  const resolvedFestivalId = resolveFestivalId(festivalId)
  const persistedMission = {
    ...mission,
    festivalId: resolvedFestivalId,
  }

  storage.setItem(
    getMissionStorageKey(resolvedFestivalId, userId),
    JSON.stringify(persistedMission)
  )

  return persistedMission
}

export function getDailyMissionClaimProgress(
  previousCollectedCount,
  updatedCollectedCount,
  festivalId,
  storage = localStorage,
  userId = ''
) {
  const mission = loadStoredMission(festivalId, storage, userId)

  if (!mission || mission.date !== getTodayKey()) return null

  const target = Number(mission.target) || 0
  const getProgress = (count) =>
    Math.min(
      Math.max(count - Number(mission.baselineCollectedCount || 0), 0),
      target
    )
  const previousProgress = getProgress(previousCollectedCount)
  const progress = getProgress(updatedCollectedCount)

  return {
    progress,
    target,
    rewardUnlocked:
      !mission.completed &&
      previousProgress < target &&
      progress >= target
        ? mission.badge || 'Daily Explorer'
        : null,
  }
}
