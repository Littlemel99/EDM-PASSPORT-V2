export const AUTHENTICATED_WELCOME_DESTINATIONS = Object.freeze({
  setup: 'passport-setup',
  festivals: 'festival-directory',
  dashboard: 'festival-dashboard',
})

export function isAuthenticatedProfileComplete(profile = {}) {
  return Boolean(
    String(profile.raveName || profile.rave_name || '').trim() &&
      String(profile.country || '').trim()
  )
}

export function resolveAuthenticatedWelcome({
  profile,
  activeFestivalEditionId,
} = {}) {
  if (!isAuthenticatedProfileComplete(profile)) {
    return AUTHENTICATED_WELCOME_DESTINATIONS.setup
  }

  return activeFestivalEditionId
    ? AUTHENTICATED_WELCOME_DESTINATIONS.dashboard
    : AUTHENTICATED_WELCOME_DESTINATIONS.festivals
}

