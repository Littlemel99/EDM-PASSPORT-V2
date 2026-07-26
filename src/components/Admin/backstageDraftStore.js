const STORAGE_PREFIX = 'edm-passport:backstage:v1'
const PUBLISH_STATUSES = new Set([
  'DRAFT',
  'TESTING',
  'PUBLISHED',
  'ARCHIVED',
])

function storageKey(userId, festivalId, draftType) {
  if (!userId || !festivalId || !draftType) return ''
  return `${STORAGE_PREFIX}:${userId}:${festivalId}:${draftType}`
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readJson(storage, key, fallback) {
  if (!storage || !key) return clone(fallback)
  try {
    const value = JSON.parse(storage.getItem(key))
    return value ?? clone(fallback)
  } catch {
    return clone(fallback)
  }
}

export function loadBackstageDrafts(
  storage,
  userId,
  festivalId
) {
  const information = readJson(
    storage,
    storageKey(userId, festivalId, 'information'),
    null
  )
  const discoveries = readJson(
    storage,
    storageKey(userId, festivalId, 'discoveries'),
    []
  )
  const collections = readJson(
    storage,
    storageKey(userId, festivalId, 'collections'),
    []
  )
  return {
    information:
      information && typeof information === 'object' ? information : null,
    discoveries: Array.isArray(discoveries) ? discoveries : [],
    collections: Array.isArray(collections) ? collections : [],
  }
}

export function saveBackstageDraft(
  storage,
  userId,
  festivalId,
  draftType,
  value
) {
  const key = storageKey(userId, festivalId, draftType)
  if (!storage || !key) {
    throw new Error('Authenticated Backstage draft scope is required.')
  }
  storage.setItem(key, JSON.stringify(value))
  return clone(value)
}

export function createFestivalInformationInput(festival = {}) {
  const baseName = String(festival.name || '').replace(/\s+20\d{2}$/, '')
  return {
    name: baseName,
    year: String(festival.year || ''),
    location: festival.location || '',
    startDate: festival.startDate || '',
    endDate: festival.endDate || '',
    timezone: festival.timezone || '',
    description: festival.description || '',
    website: festival.officialWebsite || festival.website || '',
    artwork: festival.heroImage || festival.bannerUrl || '',
    publishStatus:
      festival.publishStatus ||
      (festival.published === true
        ? 'PUBLISHED'
        : festival.published === false
          ? 'DRAFT'
          : festival.id === 'tomorrowland-2026'
            ? 'TESTING'
            : 'DRAFT'),
  }
}

export function validateFestivalInformation(input = {}) {
  const errors = {}
  for (const field of [
    'name',
    'year',
    'location',
    'startDate',
    'endDate',
    'timezone',
    'publishStatus',
  ]) {
    if (!String(input[field] || '').trim()) errors[field] = 'Required'
  }
  if (
    input.startDate &&
    input.endDate &&
    input.endDate < input.startDate
  ) {
    errors.endDate = 'End date cannot be before start date.'
  }
  if (input.website) {
    try {
      const url = new URL(input.website)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      errors.website = 'Enter a valid HTTP or HTTPS website.'
    }
  }
  if (!PUBLISH_STATUSES.has(input.publishStatus)) {
    errors.publishStatus = 'Select a supported publish status.'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateDiscoveryDraft(
  input = {},
  existingDrafts = [],
  festivalId = ''
) {
  const errors = {}
  for (const field of [
    'title',
    'location',
    'category',
    'rarity',
    'claimMethod',
  ]) {
    if (!String(input[field] || '').trim()) errors[field] = 'Required'
  }
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)
  const xp = Number(input.xp)
  if (input.latitude !== '' && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    errors.latitude = 'Latitude must be between -90 and 90.'
  }
  if (input.longitude !== '' && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    errors.longitude = 'Longitude must be between -180 and 180.'
  }
  if (!Number.isFinite(xp) || xp < 0) errors.xp = 'XP must be zero or greater.'
  if (input.festivalId && input.festivalId !== festivalId) {
    errors.festivalId = 'Discovery must belong to the selected festival.'
  }
  if (
    input.id &&
    existingDrafts.some(
      (draft) => draft.id === input.id && draft.id !== input.originalId
    )
  ) {
    errors.id = 'Draft ID already exists.'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateCollectionDraft(
  input = {},
  discoveryDrafts = [],
  festivalId = ''
) {
  const errors = {}
  if (!String(input.name || '').trim()) errors.name = 'Required'
  const requiredDiscoveryIds = Array.isArray(input.requiredDiscoveryIds)
    ? input.requiredDiscoveryIds
    : Array.isArray(input.discoveryIds)
      ? input.discoveryIds
      : []
  const optionalDiscoveryIds = Array.isArray(input.optionalDiscoveryIds)
    ? input.optionalDiscoveryIds
    : []
  if (!requiredDiscoveryIds.length) {
    errors.requiredDiscoveryIds = 'Select at least one required discovery.'
  }
  if (
    new Set(requiredDiscoveryIds).size !== requiredDiscoveryIds.length ||
    new Set(optionalDiscoveryIds).size !== optionalDiscoveryIds.length
  ) {
    errors.discoveryIds = 'Duplicate discovery references are not allowed.'
  }
  if (requiredDiscoveryIds.some((id) => optionalDiscoveryIds.includes(id))) {
    errors.discoveryIds =
      'A discovery cannot be both required and optional.'
  }
  if (
    Object.hasOwn(input, 'completionRequirement') &&
    !String(input.completionRequirement || '').trim()
  ) {
    errors.completionRequirement = 'Required'
  }
  const allowed = new Set(
    discoveryDrafts
      .filter(
        (draft) => !draft.archived && draft.festivalId === festivalId
      )
      .map((draft) => draft.id)
  )
  if (
    [...requiredDiscoveryIds, ...optionalDiscoveryIds].some(
      (id) => !allowed.has(id)
    )
  ) {
    errors.discoveryIds = 'Collections may reference only this festival’s drafts.'
  }
  const xp = Number(input.xp)
  if (!Number.isFinite(xp) || xp < 0) errors.xp = 'XP must be zero or greater.'
  if (input.festivalId && input.festivalId !== festivalId) {
    errors.festivalId = 'Collection must belong to the selected festival.'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

export function archiveCollectionDraft(drafts = [], draftId = '') {
  return drafts.map((draft) =>
    draft.id === draftId ? { ...draft, archived: true } : { ...draft }
  )
}

export function restoreCollectionDraft(drafts = [], draftId = '') {
  return drafts.map((draft) =>
    draft.id === draftId ? { ...draft, archived: false } : { ...draft }
  )
}

const INFORMATION_REVIEW_FIELDS = Object.freeze([
  ['name', 'Festival name'],
  ['year', 'Edition year'],
  ['location', 'Location'],
  ['startDate', 'Start date'],
  ['endDate', 'End date'],
  ['timezone', 'Timezone'],
  ['description', 'Description'],
  ['website', 'Website'],
  ['artwork', 'Artwork'],
  ['publishStatus', 'Publish status'],
])

export function getPublishingPipelineReview(festival = {}, drafts = {}) {
  const information = drafts?.information || null
  const repositoryInformation =
    festival.repositoryConfiguration ||
    createFestivalInformationInput(festival)
  const informationValidation = validateFestivalInformation(
    information || {}
  )
  const validDiscoveryDrafts = (drafts?.discoveries || []).filter(
    (draft) =>
      !draft.archived &&
      validateDiscoveryDraft(
        draft,
        (drafts?.discoveries || []).filter((item) => item.id !== draft.id),
        festival.id
      ).valid
  )
  const activeDiscoveryDrafts = validDiscoveryDrafts.filter(
    (draft) => draft.active !== false
  )
  const validCollectionDrafts = (drafts?.collections || []).filter(
    (draft) =>
      !draft.archived &&
      validateCollectionDraft(
        draft,
        validDiscoveryDrafts,
        festival.id
      ).valid
  )
  const activeCollectionDrafts = validCollectionDrafts.filter(
    (draft) => draft.active !== false
  )
  const localTestingBlockers = [
    !informationValidation.valid && 'Required festival information incomplete',
    !String(information?.timezone || '').trim() && 'Timezone missing',
    !String(information?.publishStatus || '').trim() &&
      'Publish status not set',
    activeDiscoveryDrafts.length === 0 && 'No active discovery draft',
    activeCollectionDrafts.length === 0 && 'No active collection draft',
  ].filter(Boolean)
  const readyForLocalTesting = localTestingBlockers.length === 0
  const hasUnsyncedDrafts = Boolean(
    information ||
      (drafts?.discoveries || []).length ||
      (drafts?.collections || []).length
  )
  const productionBlockers = [
    !readyForLocalTesting && 'Local testing requirements incomplete',
    hasUnsyncedDrafts && 'Unsynced local drafts',
    festival.securePersistenceAvailable !== true &&
      'Secure persistence unavailable',
    festival.publishingBackendAvailable !== true &&
      'Publishing backend unavailable',
    festival.qrNfcBackendAvailable !== true &&
      'QR / NFC backend unavailable',
    festival.analyticsRequiredForProduction === true &&
      festival.analyticsBackendAvailable !== true &&
      'Analytics backend unavailable',
  ].filter(Boolean)
  const informationChanges = information
    ? INFORMATION_REVIEW_FIELDS.flatMap(([field, label]) => {
        const repositoryValue = String(repositoryInformation[field] ?? '')
        const localValue = String(information[field] ?? '')
        return repositoryValue === localValue
          ? []
          : [{ field, label, repositoryValue, localValue }]
      })
    : []
  return {
    festival: {
      name: festival.name || 'Festival not provided',
      year: festival.year || null,
      lifecycle: festival.lifecycle || 'unavailable',
      publishStatus:
        information?.publishStatus ||
        festival.publishStatus ||
        'STATUS NOT SET',
    },
    counts: {
      repositoryDiscoveries: Number(festival.discoveryCount) || 0,
      localDiscoveries: validDiscoveryDrafts.length,
      repositoryCollections: Number(festival.collectionCount) || 0,
      localCollections: validCollectionDrafts.length,
    },
    hasUnsyncedDrafts,
    readyForLocalTesting,
    readyForProduction: productionBlockers.length === 0,
    localTestingBlockers,
    productionBlockers,
    informationChanges,
    discoveryDrafts: validDiscoveryDrafts.map((draft) => ({
      id: draft.id,
      title: draft.title,
      status: 'LOCAL DRAFT',
      active: draft.active !== false,
      xp: Number(draft.xp) || 0,
      claimMethod: draft.claimMethod,
    })),
    collectionDrafts: validCollectionDrafts.map((draft) => ({
      id: draft.id,
      name: draft.name,
      status: 'LOCAL DRAFT',
      requiredCount: Array.isArray(draft.requiredDiscoveryIds)
        ? draft.requiredDiscoveryIds.length
        : Array.isArray(draft.discoveryIds)
          ? draft.discoveryIds.length
          : 0,
      optionalCount: Array.isArray(draft.optionalDiscoveryIds)
        ? draft.optionalDiscoveryIds.length
        : 0,
      xp: Number(draft.xp) || 0,
    })),
    backend: {
      securePersistence: 'NOT AVAILABLE',
      publishing: 'NOT AVAILABLE',
      localDraftMode: 'ACTIVE',
    },
  }
}

export function mergeFestivalWithDrafts(festival, drafts) {
  const repositoryConfiguration = createFestivalInformationInput(festival)
  const information = drafts?.information || {}
  const validDiscoveryDrafts = (drafts?.discoveries || []).filter(
    (draft) =>
      !draft.archived &&
      validateDiscoveryDraft(
        draft,
        (drafts?.discoveries || []).filter((item) => item.id !== draft.id),
        festival.id
      ).valid
  )
  const validCollectionDrafts = (drafts?.collections || []).filter(
    (draft) =>
      !draft.archived &&
      validateCollectionDraft(
        draft,
        validDiscoveryDrafts,
        festival.id
      ).valid
  )
  const infoValidation = validateFestivalInformation(
    Object.keys(information).length
      ? information
      : createFestivalInformationInput(festival)
  )
  return {
    ...festival,
    repositoryConfiguration,
    ...(Object.keys(information).length
      ? {
          name: information.name,
          year: Number(information.year),
          location: information.location,
          startDate: information.startDate,
          endDate: information.endDate,
          dateLabel: `${information.startDate} – ${information.endDate}`,
          timezone: information.timezone,
          description: information.description,
          officialWebsite: information.website,
          heroImage: information.artwork,
          publishStatus: information.publishStatus,
          published: information.publishStatus === 'PUBLISHED',
        }
      : {}),
    localConfigurationMode: festival.id === 'tomorrowland-2026',
    informationDraftComplete: Boolean(
      Object.keys(information).length && infoValidation.valid
    ),
    localDiscoveryDraftCount: validDiscoveryDrafts.length,
    localCollectionDraftCount: validCollectionDrafts.length,
    localDraftsUnsynced: Boolean(
      Object.keys(information).length ||
      drafts?.discoveries?.length ||
      drafts?.collections?.length
    ),
  }
}

export const backstageDraftStorage = Object.freeze({
  prefix: STORAGE_PREFIX,
  key: storageKey,
})
