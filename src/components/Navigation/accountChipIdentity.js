export function resolveAccountChipRaveName({
  profile,
  authenticatedUserId,
} = {}) {
  const profileBelongsToUser = Boolean(
    profile?.id &&
      authenticatedUserId &&
      profile.id === authenticatedUserId
  )
  const privateProfileName = profileBelongsToUser
    ? String(profile.rave_name || '').trim()
    : ''

  return privateProfileName
}

export function getAccountChipLabel(raveName) {
  return String(raveName || '').trim() || 'Complete Passport'
}
