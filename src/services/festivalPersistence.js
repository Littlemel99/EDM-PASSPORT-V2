export const LEGACY_EDC_FESTIVAL_ID = 'edc-las-vegas-2026'

export function resolveFestivalId(festivalId) {
  return festivalId || LEGACY_EDC_FESTIVAL_ID
}

export function getDefaultCollectedIds(festivalId) {
  return resolveFestivalId(festivalId) === LEGACY_EDC_FESTIVAL_ID
    ? ['world-party-parade']
    : []
}

export function createFestivalStorageKey(baseKey, festivalId) {
  return `${baseKey}:${resolveFestivalId(festivalId)}`
}

export function createStampPersistenceRecord({
  userId,
  stampId,
  festivalId,
  claimMethod,
}) {
  return {
    user_id: userId,
    stamp_id: stampId,
    festival_id: resolveFestivalId(festivalId),
    claim_method: claimMethod,
  }
}

export function selectFestivalStampIds(records = [], festivalId) {
  const resolvedFestivalId = resolveFestivalId(festivalId)
  const persistedIds = records
    .filter((record) =>
      resolveFestivalId(record.festival_id) === resolvedFestivalId
    )
    .map((record) => record.stamp_id)
    .filter(Boolean)

  return Array.from(
    new Set([...getDefaultCollectedIds(resolvedFestivalId), ...persistedIds])
  )
}

export function createFestivalClaimState({
  collectedIds = [],
  discoveryId,
  festivalId,
}) {
  const previousIds = Array.from(new Set(collectedIds.filter(Boolean)))
  const isNew = Boolean(discoveryId) && !previousIds.includes(discoveryId)
  const updatedIds = Array.from(
    new Set([
      ...previousIds,
      ...(discoveryId ? [discoveryId] : []),
      ...getDefaultCollectedIds(festivalId),
    ])
  )

  return {
    festivalId: resolveFestivalId(festivalId),
    discoveryId,
    previousIds,
    updatedIds,
    isNew,
  }
}
