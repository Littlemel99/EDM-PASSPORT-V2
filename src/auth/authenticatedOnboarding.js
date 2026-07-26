import {
  AUTHENTICATED_WELCOME_DESTINATIONS,
  isAuthenticatedProfileComplete,
  resolveAuthenticatedWelcome,
} from './authenticatedWelcome.js'

export const ONBOARDING_DRAFT_KEY = 'edm-passport:onboarding-draft'
export const PROFILE_OPERATION_TIMEOUT_MS = 10000

export function writeOnboardingDraft(storage, profile = {}) {
  if (!storage || !isAuthenticatedProfileComplete(profile)) return false
  storage.setItem(
    ONBOARDING_DRAFT_KEY,
    JSON.stringify({
      raveName: String(profile.raveName || profile.rave_name).trim(),
      country: String(profile.country).trim(),
    })
  )
  return true
}

export function readOnboardingDraft(storage) {
  if (!storage) return null
  try {
    const draft = JSON.parse(storage.getItem(ONBOARDING_DRAFT_KEY))
    return isAuthenticatedProfileComplete(draft) ? draft : null
  } catch {
    return null
  }
}

export function clearOnboardingDraft(storage) {
  storage?.removeItem(ONBOARDING_DRAFT_KEY)
}

export function withOperationTimeout(
  operation,
  timeoutMs = PROFILE_OPERATION_TIMEOUT_MS,
  label = 'Passport initialization'
) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out. Please try again.`)),
      timeoutMs
    )
  })

  return Promise.race([Promise.resolve(operation), timeout]).finally(() => {
    clearTimeout(timeoutId)
  })
}

export async function initializeAuthenticatedPassport({
  user,
  activeFestivalEditionId = '',
  load,
  create,
  draft = null,
  timeoutMs = PROFILE_OPERATION_TIMEOUT_MS,
  onStep = () => {},
} = {}) {
  if (!user?.id) throw new Error('Authenticated user is required.')

  onStep('AUTH_SUCCESS', { userId: user.id })
  onStep('PROFILE_LOOKUP_START', { userId: user.id })

  let created = false
  let profile
  try {
    profile = await withOperationTimeout(
      load(user),
      timeoutMs,
      'Passport profile lookup'
    )
  } catch (error) {
    onStep('PROFILE_LOOKUP_RESULT', {
      userId: user.id,
      profileFound: false,
      error: error.message,
    })
    throw error
  }
  onStep('PROFILE_LOOKUP_RESULT', {
    userId: user.id,
    profileFound: Boolean(profile),
  })

  if (!profile && isAuthenticatedProfileComplete(draft)) {
    onStep('PROFILE_CREATE_START', { userId: user.id })
    try {
      await withOperationTimeout(
        create(user, draft),
        timeoutMs,
        'Passport profile creation'
      )
      onStep('PROFILE_CREATE_SUCCESS', { userId: user.id })
      onStep('PROFILE_RELOAD_START', { userId: user.id })
      profile = await withOperationTimeout(
        load(user),
        timeoutMs,
        'Saved passport profile reload'
      )
      if (!profile) {
        throw new Error(
          'Passport profile was saved but could not be reloaded. Please try again.'
        )
      }
      created = true
      onStep('PROFILE_RELOAD_SUCCESS', {
        userId: user.id,
        profileId: profile.id || null,
      })
    } catch (error) {
      onStep('PROFILE_CREATE_ERROR', {
        userId: user.id,
        message: error.message,
      })
      throw error
    }
  }

  onStep('PASSPORT_INIT', {
    userId: user.id,
    profileComplete: isAuthenticatedProfileComplete(profile),
  })
  onStep('ACTIVE_JOURNEY_INIT', {
    userId: user.id,
    activeFestivalEditionId,
  })

  const destination = resolveAuthenticatedWelcome({
    profile,
    activeFestivalEditionId,
  })
  if (
    destination === AUTHENTICATED_WELCOME_DESTINATIONS.festivals
  ) {
    onStep('DIRECTORY_NAVIGATION', { userId: user.id })
  }

  return Object.freeze({
    profile,
    destination,
    created,
  })
}
