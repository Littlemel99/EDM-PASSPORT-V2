import {
  readUserStorage,
  writeUserStorage,
} from '../auth/accountIsolation.js'

const CACHE_VERSION = 1

function cacheKey(festivalEditionId) {
  return `activeJourneyCache:${festivalEditionId}`
}

export function readActiveJourneyCache(
  storage,
  userId,
  festivalEditionId
) {
  if (!festivalEditionId) return null
  const serialized = readUserStorage(
    storage,
    cacheKey(festivalEditionId),
    userId,
    ''
  )
  if (!serialized) return null

  try {
    const cached = JSON.parse(serialized)
    if (
      cached?.version !== CACHE_VERSION ||
      cached?.festivalEditionId !== festivalEditionId
    ) {
      return null
    }
    return {
      version: CACHE_VERSION,
      festivalEditionId,
      collectedIds: Array.isArray(cached.collectedIds)
        ? [...new Set(cached.collectedIds.filter(Boolean))]
        : [],
      memories: Array.isArray(cached.memories)
        ? cached.memories.map((memory) => ({ ...memory }))
        : [],
      families: Array.isArray(cached.families)
        ? cached.families.map((family) => ({ ...family }))
        : [],
      activeFamilyId: cached.activeFamilyId || '',
      raveName: cached.raveName || '',
      country: cached.country || '',
      cachedAt: cached.cachedAt || null,
    }
  } catch {
    return null
  }
}

export function writeActiveJourneyCache(
  storage,
  userId,
  snapshot
) {
  const festivalEditionId = snapshot?.festivalEditionId
  if (!festivalEditionId) return false

  try {
    return writeUserStorage(
      storage,
      cacheKey(festivalEditionId),
      userId,
      JSON.stringify({
      version: CACHE_VERSION,
      festivalEditionId,
      collectedIds: Array.from(
        new Set((snapshot.collectedIds || []).filter(Boolean))
      ),
      memories: (snapshot.memories || []).map((memory) => ({
        ...memory,
      })),
      families: (snapshot.families || []).map((family) => ({
        ...family,
      })),
      activeFamilyId: snapshot.activeFamilyId || '',
      raveName: snapshot.raveName || '',
      country: snapshot.country || '',
      cachedAt: snapshot.cachedAt || new Date().toISOString(),
      })
    )
  } catch {
    return false
  }
}
