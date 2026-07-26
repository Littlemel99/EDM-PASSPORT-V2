export const ADMIN_MODULES = Object.freeze([
  'Festivals',
  'Discoveries',
  'Collections',
  'Users',
  'Crews',
  'Passport Templates',
  'QR / NFC',
  'Broadcasts',
  'Analytics',
  'Moderation',
  'Settings',
])

export const BACKSTAGE_MODULE_GROUPS = Object.freeze([
  Object.freeze({
    label: 'FESTIVAL BUILDER',
    modules: Object.freeze([
      'Festival Library',
      'Discoveries',
      'Collections',
      'Schedule',
    ]),
  }),
  Object.freeze({
    label: 'OPERATIONS',
    modules: Object.freeze([
      'QR / NFC',
      'Broadcasts',
      'Analytics',
      'Publishing',
    ]),
  }),
  Object.freeze({
    label: 'PLATFORM',
    modules: Object.freeze([
      'Users',
      'Crews',
      'Passport Templates',
      'Moderation',
      'Settings',
    ]),
  }),
])

const FUNCTIONAL_MODULES = new Set(['Festivals', 'Broadcasts'])
const READ_ONLY_MODULES = new Set([
  'Discoveries',
  'Collections',
])
const BACKEND_REQUIRED_MODULES = new Set(['Users'])

export function getAdminModuleStatus(moduleName) {
  if (moduleName === 'Festival Library') return 'READY'
  if (['Schedule', 'Publishing'].includes(moduleName)) return 'READ ONLY'
  if (['QR / NFC', 'Analytics'].includes(moduleName)) {
    return 'BACKEND REQUIRED'
  }
  if (FUNCTIONAL_MODULES.has(moduleName)) return 'READY'
  if (READ_ONLY_MODULES.has(moduleName)) return 'READ ONLY'
  if (BACKEND_REQUIRED_MODULES.has(moduleName)) return 'BACKEND REQUIRED'
  return 'PLACEHOLDER'
}

const PRODUCTION_FESTIVAL_PATTERNS = [
  /^edc-las-vegas(?:-|$)/,
  /^lost-lands(?:-|$)/,
  /^tomorrowland(?:-|$)/,
  /^ultra-miami(?:-|$)/,
]

function isProductionFestival(festival) {
  const identity = `${festival.id || ''} ${festival.name || ''}`
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
  if (PRODUCTION_FESTIVAL_PATTERNS.some((pattern) => pattern.test(identity))) {
    return true
  }
  return (
    identity.includes('spiders') &&
    Boolean(
      (festival.startDate || festival.start_date) &&
      (festival.endDate || festival.end_date) &&
      (festival.location || festival.venue)
    )
  )
}

function getDataSource(festival) {
  if (festival.dataSource || festival.data_source) {
    return festival.dataSource || festival.data_source
  }
  if (festival.festivalBrandId) {
    return 'Edition profile with managed operational data'
  }
  if (isProductionFestival(festival)) return 'Repository festival catalog'
  return 'Managed festival record'
}

function getMissingFestivalFields(record) {
  return [
    ['location', record.location],
    ['start date', record.startDate],
    ['end date', record.endDate],
    ['timezone', record.timezone],
    ['publish state', record.published !== null],
  ]
    .filter(([, present]) => !present)
    .map(([label]) => label)
}

export function getFestivalAdminRecords(festivals = [], now = new Date()) {
  return festivals
    .filter((festival) => festival?.id)
    .map((festival) => {
      const startDate = festival.startDate || festival.start_date || null
      const endDate = festival.endDate || festival.end_date || null
      const published =
        typeof festival.published === 'boolean'
          ? festival.published
          : typeof festival.is_published === 'boolean'
            ? festival.is_published
            : festival.status === 'published'
              ? true
              : null
      const record = {
        id: festival.id,
        editionId: festival.editionId || festival.edition_id || festival.id,
        name: festival.displayName || festival.name || 'Unnamed festival',
        year:
          Number(festival.year) ||
          Number(String(startDate || '').slice(0, 4)) ||
          null,
        lifecycle: resolveFestivalLifecycle(festival, now),
        venue: festival.venue || null,
        location:
          festival.location ||
          [festival.city, festival.region].filter(Boolean).join(', ') ||
          null,
        startDate,
        endDate,
        dateLabel: formatFestivalDates(startDate, endDate) || null,
        timezone: festival.timezone || festival.time_zone || null,
        published,
        discoveryCount: Number(festival.discoveryCount) || 0,
        collectionCount: Number(festival.collectionCount) || 0,
        scheduleItemCount: Array.isArray(festival.scheduleItems)
          ? festival.scheduleItems.length
          : Array.isArray(festival.schedule)
            ? festival.schedule.length
            : 0,
        classification: isProductionFestival(festival)
          ? 'production'
          : 'test',
        dataSource: getDataSource(festival),
      }
      return {
        ...record,
        missingFields: getMissingFestivalFields(record),
      }
    })
}

export function filterAdminFestivals(records = [], filter = 'production') {
  if (filter === 'all') return records.map((record) => ({ ...record }))
  const classification = filter === 'test' ? 'test' : 'production'
  return records
    .filter((record) => record.classification === classification)
    .map((record) => ({ ...record }))
}

export function searchAdminFestivals(records = [], query = '') {
  const normalizedQuery = String(query).trim().toLowerCase()
  if (!normalizedQuery) return records.map((record) => ({ ...record }))
  return records
    .filter((record) =>
      [record.name, record.location, record.year]
        .filter((value) => value !== null && value !== undefined)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedQuery)
        )
    )
    .map((record) => ({ ...record }))
}

const LIFECYCLE_SORT_ORDER = {
  live: 0,
  upcoming: 1,
  completed: 2,
  unavailable: 3,
}

export function sortAdminFestivals(records = []) {
  return [...records].sort((left, right) => {
    const lifecycleDifference =
      (LIFECYCLE_SORT_ORDER[left.lifecycle] ?? 4) -
      (LIFECYCLE_SORT_ORDER[right.lifecycle] ?? 4)
    if (lifecycleDifference) return lifecycleDifference
    if (left.lifecycle === 'upcoming') {
      return String(left.startDate || '9999').localeCompare(
        String(right.startDate || '9999')
      )
    }
    if (left.lifecycle === 'completed') {
      return String(right.endDate || '').localeCompare(
        String(left.endDate || '')
      )
    }
    return left.name.localeCompare(right.name)
  })
}

export function summarizeAdminFestivals(records = []) {
  return {
    live: records.filter((record) => record.lifecycle === 'live').length,
    upcoming: records.filter((record) => record.lifecycle === 'upcoming').length,
    completed: records.filter((record) => record.lifecycle === 'completed').length,
    draftOrUnknown: records.filter(
      (record) => record.published !== true
    ).length,
  }
}

export function getFestivalLifecycleLabel(lifecycle) {
  if (lifecycle === 'live') return 'LIVE'
  if (lifecycle === 'upcoming') return 'UPCOMING'
  if (lifecycle === 'completed') return 'COMPLETED'
  return 'UNAVAILABLE'
}

export function getFestivalPublishLabel(published) {
  if (published === true) return 'PUBLISHED'
  if (published === false) return 'DRAFT'
  return 'STATUS NOT SET'
}

export function getFestivalPublishingReadiness(festival = {}) {
  const requiredFields = [
    ['Name', festival.name],
    ['Location', festival.location],
    ['Start date', festival.startDate],
    ['End date', festival.endDate],
    ['Timezone', festival.timezone],
  ]
  const checklist = requiredFields.map(([label, value]) => ({
    label,
    ready: Boolean(value),
  }))
  return {
    checklist,
    ready: checklist.every((item) => item.ready),
    missing: checklist
      .filter((item) => !item.ready)
      .map((item) => item.label),
  }
}

export function getFestivalWorkspaceOverview(festival = {}) {
  const generalFields = [
    festival.name,
    festival.location,
    festival.startDate,
    festival.endDate,
    festival.timezone,
  ]
  const generalComplete = festival.localConfigurationMode
    ? festival.informationDraftComplete === true
    : generalFields.every(Boolean)
  const generalStarted = generalFields.some(Boolean)
  const discoveryCount = Number(festival.discoveryCount) || 0
  const collectionCount = Number(festival.collectionCount) || 0
  const localDiscoveryDraftCount =
    Number(festival.localDiscoveryDraftCount) || 0
  const localCollectionDraftCount =
    Number(festival.localCollectionDraftCount) || 0
  const scheduleItemCount = Number(festival.scheduleItemCount) || 0
  const lifecycleReady = Boolean(
    festival.lifecycle && festival.lifecycle !== 'unavailable'
  )
  const publishReady =
    typeof festival.published === 'boolean' ||
    Boolean(festival.publishStatus)

  const statuses = [
    {
      id: 'general',
      label: 'General festival information',
      status: generalComplete
        ? 'READY'
        : generalStarted
          ? 'PARTIAL'
          : 'NOT CONFIGURED',
    },
    {
      id: 'discoveries',
      label: 'Discoveries',
      status:
        discoveryCount > 0
          ? 'READY'
          : localDiscoveryDraftCount > 0
            ? 'PARTIAL'
            : 'NOT CONFIGURED',
    },
    {
      id: 'collections',
      label: 'Collections',
      status:
        collectionCount > 0
          ? 'READY'
          : localCollectionDraftCount > 0
            ? 'PARTIAL'
            : 'NOT CONFIGURED',
    },
    {
      id: 'qr-nfc',
      label: 'QR / NFC',
      status: festival.qrNfcBackendAvailable
        ? 'READY'
        : 'BACKEND REQUIRED',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      status: scheduleItemCount > 0 ? 'READY' : 'NOT CONFIGURED',
    },
    {
      id: 'publishing',
      label: 'Publishing',
      status: publishReady ? 'READY' : 'STATUS NOT SET',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      status: festival.analyticsBackendAvailable
        ? 'READY'
        : 'BACKEND REQUIRED',
    },
  ]

  const checklist = [
    ['Name', Boolean(festival.name), 'MISSING'],
    ['Location', Boolean(festival.location), 'MISSING'],
    ['Start date', Boolean(festival.startDate), 'MISSING'],
    ['End date', Boolean(festival.endDate), 'MISSING'],
    ['Timezone', Boolean(festival.timezone), 'MISSING'],
    ['Lifecycle', lifecycleReady, 'MISSING'],
    ['Publish status', publishReady, 'MISSING'],
    [
      'At least one discovery',
      discoveryCount + localDiscoveryDraftCount > 0,
      'MISSING',
    ],
    [
      'At least one collection',
      collectionCount + localCollectionDraftCount > 0,
      'MISSING',
    ],
    ['Schedule configured', scheduleItemCount > 0, 'MISSING'],
    [
      'QR / NFC backend available',
      Boolean(festival.qrNfcBackendAvailable),
      'BACKEND REQUIRED',
    ],
    [
      'Analytics backend available',
      Boolean(festival.analyticsBackendAvailable),
      'BACKEND REQUIRED',
    ],
  ].map(([label, complete, missingStatus]) => ({
    label,
    status: complete ? 'COMPLETE' : missingStatus,
  }))

  const missingConfiguration = [
    !festival.name && 'Name not provided',
    !festival.location && 'Location not provided',
    !festival.startDate && 'Start date not provided',
    !festival.endDate && 'End date not provided',
    !festival.timezone && 'Timezone not provided',
    !lifecycleReady && 'Lifecycle unavailable',
    !publishReady && 'Publish status not set',
    discoveryCount + localDiscoveryDraftCount === 0 &&
      'No discoveries configured',
    collectionCount + localCollectionDraftCount === 0 &&
      'No collections configured',
    scheduleItemCount === 0 && 'Schedule not configured',
    !festival.qrNfcBackendAvailable && 'QR / NFC backend required',
    !festival.analyticsBackendAvailable && 'Analytics backend required',
  ].filter(Boolean)

  return {
    statuses,
    metrics: {
      discoveryCount,
      collectionCount,
      localDiscoveryDraftCount,
      localCollectionDraftCount,
      scheduleItemCount,
      missingRequiredFieldsCount: checklist.filter(
        (item) => item.status === 'MISSING'
      ).length,
      lifecycle: festival.lifecycle || 'unavailable',
      publishStatus: getFestivalPublishLabel(festival.published),
      dataSource: festival.dataSource || 'Not provided',
    },
    checklist,
    missingConfiguration,
  }
}

const WORKSPACE_TASK_PRIORITY = Object.freeze([
  Object.freeze({
    checklistLabel: 'Timezone',
    label: 'Add festival timezone',
    tab: 'settings',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'Name',
    label: 'Add festival name',
    tab: 'settings',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'Location',
    label: 'Add festival location',
    tab: 'settings',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'Start date',
    label: 'Add festival start date',
    tab: 'settings',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'End date',
    label: 'Add festival end date',
    tab: 'settings',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'Lifecycle',
    label: 'Configure festival lifecycle',
    tab: 'settings',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'At least one discovery',
    label: 'Configure first discovery',
    tab: 'discoveries',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'At least one collection',
    label: 'Create first collection',
    tab: 'collections',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'Schedule configured',
    label: 'Configure Schedule',
    tab: 'schedule',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'Publish status',
    label: 'Set publishing status',
    tab: 'publishing',
    kind: 'actionable',
  }),
  Object.freeze({
    checklistLabel: 'QR / NFC backend available',
    label: 'Open QR / NFC Requirements',
    tab: 'qr-nfc',
    kind: 'backend',
  }),
  Object.freeze({
    checklistLabel: 'Analytics backend available',
    label: 'Open Analytics Requirements',
    tab: 'analytics',
    kind: 'backend',
  }),
])

export function getFestivalWorkspaceTaskDashboard(festival = {}) {
  const overview = getFestivalWorkspaceOverview(festival)
  const actionableItems = overview.checklist.filter(
    (item) => item.status !== 'BACKEND REQUIRED'
  )
  const completeCount = actionableItems.filter(
    (item) => item.status === 'COMPLETE'
  ).length
  const missingCount = actionableItems.length - completeCount
  const backendRequiredCount = overview.checklist.filter(
    (item) => item.status === 'BACKEND REQUIRED'
  ).length
  const progressPercent = actionableItems.length
    ? Math.round((completeCount / actionableItems.length) * 100)
    : 100
  const checklistByLabel = new Map(
    overview.checklist.map((item) => [item.label, item])
  )
  const tasks = WORKSPACE_TASK_PRIORITY.filter((task) => {
    const item = checklistByLabel.get(task.checklistLabel)
    if (task.checklistLabel === 'Publish status') {
      return festival.published !== true
    }
    return item && item.status !== 'COMPLETE'
  }).map((task) => ({ ...task }))
  const actionableTasks = tasks.filter((task) => task.kind === 'actionable')
  const backendTasks = tasks.filter((task) => task.kind === 'backend')
  const statusById = new Map(
    overview.statuses.map((item) => [item.id, item.status])
  )
  const builderSteps = [
    ['general', 'Festival Information', 'settings'],
    ['discoveries', 'Discoveries', 'discoveries'],
    ['collections', 'Collections', 'collections'],
    ['schedule', 'Schedule', 'schedule'],
    ['publishing', 'Publishing', 'publishing'],
  ].map(([id, label, tab]) => {
    const sourceStatus = statusById.get(id)
    let status = 'NOT STARTED'
    if (sourceStatus === 'READY') status = 'COMPLETE'
    if (sourceStatus === 'PARTIAL') status = 'IN PROGRESS'
    if (id === 'publishing' && festival.published === false) {
      status = 'IN PROGRESS'
    }
    return {
      id,
      label,
      tab,
      status,
      repositoryCount:
        id === 'discoveries'
          ? overview.metrics.discoveryCount
          : id === 'collections'
            ? overview.metrics.collectionCount
            : null,
      localDraftCount:
        id === 'discoveries'
          ? overview.metrics.localDiscoveryDraftCount
          : id === 'collections'
            ? overview.metrics.localCollectionDraftCount
            : null,
    }
  })
  const backendServices = [
    ['qr-nfc', 'QR / NFC', 'qr-nfc'],
    ['analytics', 'Analytics', 'analytics'],
  ].map(([id, label, tab]) => ({
    id,
    label,
    tab,
    status:
      statusById.get(id) === 'READY' ? 'COMPLETE' : 'BACKEND REQUIRED',
  }))
  const firstIncompleteStep = builderSteps.find(
    (step) => step.status !== 'COMPLETE'
  )
  const testingRequirements = [
    [
      'Festival Information local draft saved',
      !festival.localConfigurationMode ||
        festival.informationDraftComplete === true,
    ],
    ['Festival name', Boolean(festival.name)],
    ['Festival location', Boolean(festival.location)],
    ['Start date', Boolean(festival.startDate)],
    ['End date', Boolean(festival.endDate)],
    [
      'Lifecycle',
      Boolean(festival.lifecycle && festival.lifecycle !== 'unavailable'),
    ],
    ['Timezone', Boolean(festival.timezone)],
    [
      'At least one discovery',
      overview.metrics.discoveryCount +
        overview.metrics.localDiscoveryDraftCount >
        0,
    ],
    [
      'At least one collection',
      overview.metrics.collectionCount +
        overview.metrics.localCollectionDraftCount >
        0,
    ],
  ]
  if (festival.scheduleRequiredForTesting === true) {
    testingRequirements.push([
      'Schedule configured',
      overview.metrics.scheduleItemCount > 0,
    ])
  }
  const testingBlockers = testingRequirements
    .filter(([, ready]) => !ready)
    .map(([label]) => label)
  const readyForTesting = testingBlockers.length === 0
  const productionRequirements = [
    ['Ready for testing', readyForTesting],
    ['Schedule configured', overview.metrics.scheduleItemCount > 0],
    ['Festival published', festival.published === true],
    ['Secure persistence available', festival.securePersistenceAvailable === true],
    ['No unsynced local drafts', !festival.localDraftsUnsynced],
    ['QR / NFC backend available', Boolean(festival.qrNfcBackendAvailable)],
    ['Analytics backend available', Boolean(festival.analyticsBackendAvailable)],
  ]
  const productionBlockers = productionRequirements
    .filter(([, ready]) => !ready)
    .map(([label]) => label)
  const readyForProduction = productionBlockers.length === 0
  const milestone = firstIncompleteStep
    ? `BUILD ${firstIncompleteStep.label.toUpperCase()}`
    : readyForProduction
      ? 'READY FOR PRODUCTION'
      : 'READY FOR TESTING'
  const primaryTask = actionableTasks[0] || null

  return {
    progressPercent,
    completeCount,
    missingCount,
    backendRequiredCount,
    state: primaryTask
      ? 'ACTION REQUIRED'
      : backendTasks.length
        ? 'WAITING ON BACKEND'
        : 'READY FOR REVIEW',
    milestone,
    primaryTask: primaryTask ? { ...primaryTask } : null,
    secondaryTasks: actionableTasks.slice(1, 6).map((task) => ({ ...task })),
    tasks,
    builderSteps,
    backendServices,
    readyForTesting,
    testingBlockers,
    readyForProduction,
    productionBlockers,
    checklist: overview.checklist.map((item) => ({ ...item })),
    missingConfiguration: [...overview.missingConfiguration],
  }
}

export function getBackstageContinueBuilding(festival = null) {
  if (!festival) return null
  const overview = getFestivalWorkspaceOverview(festival)
  const statusById = new Map(
    overview.statuses.map((item) => [item.id, item.status])
  )
  const categories = [
    ['general', 'General information'],
    ['discoveries', 'Discoveries'],
    ['collections', 'Collections'],
    ['schedule', 'Schedule'],
    ['qr-nfc', 'QR / NFC'],
    ['publishing', 'Publishing'],
    ['analytics', 'Analytics'],
  ].map(([id, label]) => {
    const sourceStatus = statusById.get(id)
    return {
      id,
      label,
      status:
        sourceStatus === 'READY'
          ? 'COMPLETE'
          : sourceStatus === 'PARTIAL'
            ? 'PARTIAL'
            : sourceStatus === 'BACKEND REQUIRED'
              ? 'BACKEND REQUIRED'
              : 'MISSING',
    }
  })
  const actionable = categories.filter(
    (category) => category.status !== 'BACKEND REQUIRED'
  )
  const completeCount = actionable.filter(
    (category) => category.status === 'COMPLETE'
  ).length
  const progressPercent = actionable.length
    ? Math.round((completeCount / actionable.length) * 100)
    : 100

  const firstUnresolved = categories.find(
    (category) =>
      category.status !== 'COMPLETE' &&
      category.status !== 'BACKEND REQUIRED'
  )
  let nextAction = 'READY FOR REVIEW'
  if (firstUnresolved?.id === 'general') {
    const firstGeneralMissing = overview.missingConfiguration.find((item) =>
      /not provided|unavailable/i.test(item)
    )
    nextAction = firstGeneralMissing
      ? firstGeneralMissing.replace(/not provided/i, 'needs configuration')
      : 'Complete general festival information'
  } else if (firstUnresolved?.id === 'discoveries') {
    nextAction = 'Configure first discovery'
  } else if (firstUnresolved?.id === 'collections') {
    nextAction = 'Create first collection'
  } else if (firstUnresolved?.id === 'schedule') {
    nextAction = 'Configure schedule'
  } else if (firstUnresolved?.id === 'publishing') {
    nextAction = 'Complete publishing requirements'
  } else if (
    categories.some((category) => category.status === 'BACKEND REQUIRED')
  ) {
    nextAction = 'WAITING ON BACKEND CAPABILITIES'
  }

  return {
    festivalId: festival.id,
    festivalName: festival.name,
    year: festival.year,
    lifecycle: festival.lifecycle,
    location: festival.location,
    categories,
    progressPercent,
    missingItems: overview.missingConfiguration.slice(0, 3),
    totalMissingItems: overview.missingConfiguration.length,
    nextAction,
  }
}

export function filterDiscoveriesByFestival(discoveries = [], festivalId = '') {
  if (!festivalId) return []
  return discoveries
    .filter((discovery) => discovery?.festivalId === festivalId)
    .map((discovery) => ({
      ...discovery,
      claimMethods: Array.isArray(discovery.claimMethods)
        ? [...discovery.claimMethods]
        : [],
    }))
}

export function filterCollectionsByFestival(collections = [], festivalId = '') {
  if (!festivalId) return []
  return collections
    .filter((collection) => collection?.festivalId === festivalId)
    .map((collection) => ({
      ...collection,
      discoveryIds: [...new Set(collection.discoveryIds || [])],
    }))
}

export function validateCollectionFestivalScope(
  collection,
  discoveries = []
) {
  const discoveryById = new Map(
    discoveries.map((discovery) => [discovery.id, discovery])
  )
  const invalidDiscoveryIds = [...new Set(collection?.discoveryIds || [])]
    .filter((id) => {
      const discovery = discoveryById.get(id)
      return !discovery || discovery.festivalId !== collection?.festivalId
    })

  return {
    valid: invalidDiscoveryIds.length === 0,
    invalidDiscoveryIds,
  }
}

export function searchSafeUsers(users = [], query = '') {
  const normalizedQuery = String(query).trim().toLowerCase()
  return users
    .map((user) => ({
      id: user.id,
      email: user.email || '',
      raveName: user.raveName || user.rave_name || '',
      country: user.country || '',
      role: user.role || 'user',
      activeFestivalId:
        user.activeFestivalId || user.active_festival_id || null,
      discoveriesFound: Number(user.discoveriesFound) || 0,
      memoriesSaved: Number(user.memoriesSaved) || 0,
      lastActiveAt: user.lastActiveAt || user.last_active_at || null,
    }))
    .filter(
      (user) =>
        !normalizedQuery ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.raveName.toLowerCase().includes(normalizedQuery)
    )
}

export function createBroadcastDraft(input = {}) {
  return {
    title: String(input.title || '').trim(),
    message: String(input.message || '').trim(),
    festivalId: String(input.festivalId || ''),
    audience: ['all-users', 'festival-attendees', 'active-journey-users'].includes(
      input.audience
    )
      ? input.audience
      : 'all-users',
    status: 'NOT SENT',
  }
}
import { formatFestivalDates } from '../../festivals/festivalEditionDisplay.js'
import { resolveFestivalLifecycle } from '../../festivals/festivalLifecycle.js'
