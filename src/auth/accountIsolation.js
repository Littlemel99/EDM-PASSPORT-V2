const USER_STORAGE_PREFIX = 'edm-user'

export function createUserStorageKey(key, userId) {
  const cleanUserId = String(userId || '').trim()
  if (!cleanUserId) return null
  return `${USER_STORAGE_PREFIX}:${cleanUserId}:${key}`
}

export function readUserStorage(storage, key, userId, fallback = '') {
  const storageKey = createUserStorageKey(key, userId)
  if (!storageKey) return fallback
  return storage.getItem(storageKey) ?? fallback
}

export function writeUserStorage(storage, key, userId, value) {
  const storageKey = createUserStorageKey(key, userId)
  if (!storageKey) return false
  storage.setItem(storageKey, String(value ?? ''))
  return true
}

export function createAccountRequestGuard() {
  let generation = 0
  let userId = null

  return Object.freeze({
    begin(nextUserId) {
      generation += 1
      userId = nextUserId || null
      return Object.freeze({ generation, userId })
    },
    isCurrent(request) {
      return Boolean(
        request &&
        request.generation === generation &&
        request.userId === userId
      )
    },
    getUserId() {
      return userId
    },
  })
}

export function isProfileOwnedByUser(profile, userId) {
  return Boolean(profile?.id && userId && profile.id === userId)
}
