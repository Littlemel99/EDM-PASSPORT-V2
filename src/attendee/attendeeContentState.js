export const ATTENDEE_CONTENT_STATES = Object.freeze({
  EMPTY: 'EMPTY',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
})

const EXCLUDED_STATUSES = new Set([
  'archived',
  'draft',
  'inactive',
  'pending',
  'private',
  'test',
  'test-only',
  'testing',
  'unpublished',
])

const EXCLUDED_SOURCE_TYPES = new Set([
  'admin-test',
  'backstage-draft',
  'derived-achievement',
  'local-draft',
  'test',
])

function isRecordObject(record) {
  return Boolean(
    record &&
      typeof record === 'object' &&
      !Array.isArray(record) &&
      typeof record.id === 'string' &&
      record.id.trim()
  )
}

function isPublishedRecord(record, festivalId) {
  if (!isRecordObject(record)) return false
  if (festivalId && record.festivalId !== festivalId) return false
  if (
    record.active === false ||
    record.archived === true ||
    record.published === false ||
    record.localDraft === true ||
    record.testOnly === true
  ) {
    return false
  }

  const status = String(
    record.publishStatus || record.publish_status || record.status || ''
  )
    .trim()
    .toLowerCase()
  const sourceType = String(record.sourceType || '').trim().toLowerCase()
  return (
    !EXCLUDED_STATUSES.has(status) &&
    !EXCLUDED_SOURCE_TYPES.has(sourceType)
  )
}

function isEligibleDiscovery(discovery, festivalId) {
  return (
    isPublishedRecord(discovery, festivalId) &&
    discovery.claimable !== false &&
    Boolean(String(discovery.name || discovery.title || '').trim())
  )
}

function getCollectionDiscoveryIds(collection) {
  if (!Array.isArray(collection?.discoveryIds)) return null
  if (
    collection.discoveryIds.length === 0 ||
    collection.discoveryIds.some(
      (id) => typeof id !== 'string' || !id.trim()
    )
  ) {
    return null
  }
  const ids = collection.discoveryIds.map((id) => id.trim())
  return new Set(ids).size === ids.length ? ids : null
}

function freezeRecords(records) {
  return Object.freeze(
    records.map((record) =>
      Object.freeze({
        ...record,
        ...(Array.isArray(record.discoveryIds)
          ? { discoveryIds: Object.freeze([...record.discoveryIds]) }
          : {}),
      })
    )
  )
}

function percentage(completed, total) {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

export function resolveAttendeeContentStateFromCounts({
  totalDiscoveries = 0,
  completedDiscoveries = 0,
  totalCollections = 0,
  completedCollections = 0,
} = {}) {
  const discoveriesTotal = Math.max(0, Number(totalDiscoveries) || 0)
  const collectionsTotal = Math.max(0, Number(totalCollections) || 0)
  const discoveriesCompleted = Math.min(
    Math.max(0, Number(completedDiscoveries) || 0),
    discoveriesTotal
  )
  const collectionsCompleted = Math.min(
    Math.max(0, Number(completedCollections) || 0),
    collectionsTotal
  )
  const hasPublishedDiscoveries = discoveriesTotal > 0
  const hasPublishedCollections = collectionsTotal > 0
  const hasAnyPublishedContent =
    hasPublishedDiscoveries || hasPublishedCollections
  const isComplete =
    hasAnyPublishedContent &&
    discoveriesCompleted === discoveriesTotal &&
    collectionsCompleted === collectionsTotal
  const state = !hasAnyPublishedContent
    ? ATTENDEE_CONTENT_STATES.EMPTY
    : isComplete
      ? ATTENDEE_CONTENT_STATES.COMPLETE
      : ATTENDEE_CONTENT_STATES.IN_PROGRESS
  const totalItems = discoveriesTotal + collectionsTotal
  const completedItems = discoveriesCompleted + collectionsCompleted

  return Object.freeze({
    state,
    hasPublishedDiscoveries,
    hasPublishedCollections,
    hasAnyPublishedContent,
    totalDiscoveries: discoveriesTotal,
    completedDiscoveries: discoveriesCompleted,
    totalCollections: collectionsTotal,
    completedCollections: collectionsCompleted,
    discoveryProgressPercent: percentage(
      discoveriesCompleted,
      discoveriesTotal
    ),
    collectionProgressPercent: percentage(
      collectionsCompleted,
      collectionsTotal
    ),
    overallProgressPercent: percentage(completedItems, totalItems),
    isEmpty: state === ATTENDEE_CONTENT_STATES.EMPTY,
    isInProgress: state === ATTENDEE_CONTENT_STATES.IN_PROGRESS,
    isComplete,
    canShowRecap: isComplete,
    canShowDiscoveryAlbum: hasPublishedDiscoveries,
    canShowCollections: hasPublishedCollections,
    canShowCollectionComplete: hasPublishedCollections && isComplete,
    canShowAchievementComplete: hasPublishedDiscoveries && isComplete,
    emptyStateReason: hasAnyPublishedContent
      ? null
      : 'No published discoveries or collections are available for this festival yet.',
  })
}

export function resolveAttendeeContentState({
  festivalId = null,
  discoveries = [],
  collections = [],
  collectedIds = [],
} = {}) {
  const eligibleDiscoveries = Array.isArray(discoveries)
    ? discoveries.filter((record) =>
        isEligibleDiscovery(record, festivalId)
      )
    : []
  const discoveryIds = new Set(
    eligibleDiscoveries.map((discovery) => discovery.id)
  )
  const eligibleCollections = Array.isArray(collections)
    ? collections.filter((collection) => {
        if (!isPublishedRecord(collection, festivalId)) return false
        if (!String(collection.name || '').trim()) return false
        const requiredIds = getCollectionDiscoveryIds(collection)
        return Boolean(
          requiredIds &&
            requiredIds.every((discoveryId) =>
              discoveryIds.has(discoveryId)
            )
        )
      })
    : []
  const collectedSet = new Set(
    Array.isArray(collectedIds)
      ? collectedIds.filter((id) => typeof id === 'string')
      : []
  )
  const completedDiscoveries = eligibleDiscoveries.filter((discovery) =>
    collectedSet.has(discovery.id)
  ).length
  const completedCollections = eligibleCollections.filter((collection) =>
    collection.discoveryIds.every((discoveryId) =>
      collectedSet.has(discoveryId)
    )
  ).length
  const normalized = resolveAttendeeContentStateFromCounts({
    totalDiscoveries: eligibleDiscoveries.length,
    completedDiscoveries,
    totalCollections: eligibleCollections.length,
    completedCollections,
  })

  return Object.freeze({
    ...normalized,
    eligibleDiscoveries: freezeRecords(eligibleDiscoveries),
    eligibleCollections: freezeRecords(eligibleCollections),
  })
}
