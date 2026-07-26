export const OAUTH_ATTEMPT_STORAGE_KEY = 'edm-passport:oauth-attempt'
const OAUTH_ATTEMPT_MAX_AGE_MS = 5 * 60 * 1000

export function getOAuthRedirectUrl(origin) {
  const normalizedOrigin = String(origin || '').trim().replace(/\/+$/, '')
  if (!normalizedOrigin) return '/'
  return `${normalizedOrigin}/`
}

export function isLocalOAuthHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

export function createOAuthAttempt({
  origin,
  now = Date.now(),
  attemptId =
    globalThis.crypto?.randomUUID?.() ||
    `oauth-${now}-${Math.random().toString(36).slice(2)}`,
} = {}) {
  return Object.freeze({
    id: attemptId,
    origin: String(origin || ''),
    createdAt: Number(now),
  })
}

export function readPendingOAuthAttempt(
  storage,
  now = Date.now(),
  maxAgeMs = OAUTH_ATTEMPT_MAX_AGE_MS
) {
  try {
    const attempt = JSON.parse(
      storage?.getItem(OAUTH_ATTEMPT_STORAGE_KEY) || 'null'
    )
    if (
      !attempt?.id ||
      !attempt?.origin ||
      !Number.isFinite(Number(attempt.createdAt)) ||
      Number(now) - Number(attempt.createdAt) > maxAgeMs
    ) {
      storage?.removeItem(OAUTH_ATTEMPT_STORAGE_KEY)
      return null
    }
    return Object.freeze({ ...attempt })
  } catch {
    storage?.removeItem(OAUTH_ATTEMPT_STORAGE_KEY)
    return null
  }
}

export function beginOAuthAttempt(storage, options = {}) {
  if (readPendingOAuthAttempt(storage, options.now)) return null
  const attempt = createOAuthAttempt(options)
  storage?.setItem(OAUTH_ATTEMPT_STORAGE_KEY, JSON.stringify(attempt))
  return attempt
}

export function clearPendingOAuthAttempt(storage) {
  storage?.removeItem(OAUTH_ATTEMPT_STORAGE_KEY)
}

export function getAuthorizationRedirect(url) {
  try {
    return new URL(url).searchParams.get('redirect_to') || ''
  } catch {
    return ''
  }
}

export function authorizationUrlMatchesRedirect(
  authorizationUrl,
  expectedRedirect
) {
  return getAuthorizationRedirect(authorizationUrl) === expectedRedirect
}

export function getSupabaseProjectRef(supabaseUrl) {
  try {
    return new URL(supabaseUrl).hostname.split('.')[0] || ''
  } catch {
    return ''
  }
}

export function clearOAuthBrowserState({
  localStorage,
  sessionStorage,
  projectRef,
} = {}) {
  const removed = []
  const authPrefix = projectRef ? `sb-${projectRef}-auth-token` : ''
  const explicitKeys = new Set([
    OAUTH_ATTEMPT_STORAGE_KEY,
    'edm-passport:onboarding-draft',
  ])

  ;[localStorage, sessionStorage].forEach((storage) => {
    if (!storage) return
    const keys = Array.from(
      { length: storage.length },
      (_, index) => storage.key(index)
    ).filter(Boolean)

    keys.forEach((key) => {
      if (explicitKeys.has(key) || (authPrefix && key.startsWith(authPrefix))) {
        storage.removeItem(key)
        removed.push(key)
      }
    })
  })

  return [...new Set(removed)]
}

export function getOAuthCallbackError(search = '') {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''))
  const error = params.get('error')
  const code = params.get('error_code')
  const description = params.get('error_description')

  if (!error && !code && !description) return null

  return Object.freeze({
    code: code || error || 'oauth_error',
    message:
      description ||
      'Google sign-in could not be completed. Please try again.',
  })
}

export function getOAuthErrorClearedUrl(url) {
  const parsed = new URL(String(url), 'http://localhost')
  ;[
    'error',
    'error_code',
    'error_description',
    'error_uri',
  ].forEach((key) => parsed.searchParams.delete(key))

  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

export function createOAuthRequestLock() {
  let locked = false

  return Object.freeze({
    tryAcquire() {
      if (locked) return false
      locked = true
      return true
    },
    release() {
      locked = false
    },
    isLocked() {
      return locked
    },
  })
}
