import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BACKSTAGE_MODULE_GROUPS,
  createBroadcastDraft,
  filterAdminFestivals,
  filterCollectionsByFestival,
  filterDiscoveriesByFestival,
  getAdminModuleStatus,
  getFestivalAdminRecords,
  getFestivalPublishLabel,
  getFestivalPublishingReadiness,
  getFestivalWorkspaceOverview,
  getFestivalWorkspaceTaskDashboard,
  getBackstageContinueBuilding,
  searchAdminFestivals,
  searchSafeUsers,
  sortAdminFestivals,
  summarizeAdminFestivals,
  validateCollectionFestivalScope,
} from './adminModuleData.js'

const discoveries = [
  { id: 'edc-one', festivalId: 'edc', name: 'EDC One' },
  { id: 'll-one', festivalId: 'lost-lands', name: 'LL One' },
]

test('functional admin module statuses remain honest', () => {
  assert.equal(getAdminModuleStatus('Festivals'), 'READY')
  assert.equal(getAdminModuleStatus('Discoveries'), 'READ ONLY')
  assert.equal(getAdminModuleStatus('Collections'), 'READ ONLY')
  assert.equal(getAdminModuleStatus('Users'), 'BACKEND REQUIRED')
  assert.equal(getAdminModuleStatus('Broadcasts'), 'READY')
  assert.equal(getAdminModuleStatus('Analytics'), 'BACKEND REQUIRED')
})

test('publishing readiness uses only real required festival fields', () => {
  assert.deepEqual(
    getFestivalPublishingReadiness({
      name: 'Tomorrowland 2026',
      location: 'Boom, Belgium',
      startDate: '2026-07-17',
      endDate: '2026-07-26',
      timezone: null,
    }),
    {
      checklist: [
        { label: 'Name', ready: true },
        { label: 'Location', ready: true },
        { label: 'Start date', ready: true },
        { label: 'End date', ready: true },
        { label: 'Timezone', ready: false },
      ],
      ready: false,
      missing: ['Timezone'],
    }
  )
})

test('workspace overview derives real festival-scoped readiness', () => {
  const overview = getFestivalWorkspaceOverview({
    id: 'tomorrowland-2026',
    name: 'Tomorrowland 2026',
    location: 'Boom, Belgium',
    startDate: '2026-07-17',
    endDate: '2026-07-26',
    timezone: null,
    lifecycle: 'live',
    published: null,
    discoveryCount: 0,
    collectionCount: 0,
    scheduleItemCount: 0,
    dataSource: 'Repository festival catalog',
  })

  assert.deepEqual(
    overview.statuses.map((item) => [item.id, item.status]),
    [
      ['general', 'PARTIAL'],
      ['discoveries', 'NOT CONFIGURED'],
      ['collections', 'NOT CONFIGURED'],
      ['qr-nfc', 'BACKEND REQUIRED'],
      ['schedule', 'NOT CONFIGURED'],
      ['publishing', 'STATUS NOT SET'],
      ['analytics', 'BACKEND REQUIRED'],
    ]
  )
  assert.equal(overview.metrics.discoveryCount, 0)
  assert.equal(overview.metrics.collectionCount, 0)
  assert.equal(overview.metrics.publishStatus, 'STATUS NOT SET')
  assert.ok(overview.missingConfiguration.includes('Timezone not provided'))
  assert.ok(overview.missingConfiguration.includes('Publish status not set'))
  assert.ok(overview.missingConfiguration.includes('No discoveries configured'))
})

test('workspace overview counts only the selected festival record', () => {
  const tomorrowland = getFestivalWorkspaceOverview({
    discoveryCount: 0,
    collectionCount: 0,
  })
  const edc = getFestivalWorkspaceOverview({
    discoveryCount: 12,
    collectionCount: 3,
  })
  assert.equal(tomorrowland.metrics.discoveryCount, 0)
  assert.equal(tomorrowland.metrics.collectionCount, 0)
  assert.equal(edc.metrics.discoveryCount, 12)
  assert.equal(edc.metrics.collectionCount, 3)
})

test('task dashboard readiness excludes backend requirements', () => {
  const dashboard = getFestivalWorkspaceTaskDashboard({
    name: 'Ready Festival',
    location: 'Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    timezone: 'UTC',
    lifecycle: 'completed',
    published: true,
    discoveryCount: 1,
    collectionCount: 1,
    scheduleItemCount: 1,
  })
  assert.equal(dashboard.progressPercent, 100)
  assert.equal(dashboard.completeCount, 10)
  assert.equal(dashboard.missingCount, 0)
  assert.equal(dashboard.backendRequiredCount, 2)
  assert.equal(dashboard.state, 'WAITING ON BACKEND')
})

test('task dashboard generates prioritized actionable tab links', () => {
  const dashboard = getFestivalWorkspaceTaskDashboard({
    name: 'Festival',
    location: 'Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    lifecycle: 'upcoming',
  })
  assert.deepEqual(
    dashboard.tasks.slice(0, 5).map((task) => [task.label, task.tab]),
    [
      ['Add festival timezone', 'settings'],
      ['Configure first discovery', 'discoveries'],
      ['Create first collection', 'collections'],
      ['Configure Schedule', 'schedule'],
      ['Set publishing status', 'publishing'],
    ]
  )
})

test('task dashboard reaches review when every checklist item is complete', () => {
  const dashboard = getFestivalWorkspaceTaskDashboard({
    name: 'Complete',
    location: 'Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    timezone: 'UTC',
    lifecycle: 'completed',
    published: true,
    discoveryCount: 1,
    collectionCount: 1,
    scheduleItemCount: 1,
    qrNfcBackendAvailable: true,
    analyticsBackendAvailable: true,
  })
  assert.equal(dashboard.state, 'READY FOR REVIEW')
  assert.deepEqual(dashboard.tasks, [])
  assert.deepEqual(dashboard.missingConfiguration, [])
})

test('project milestone and primary task follow builder priority', () => {
  const information = getFestivalWorkspaceTaskDashboard({
    name: 'Festival',
    lifecycle: 'upcoming',
  })
  assert.equal(information.milestone, 'BUILD FESTIVAL INFORMATION')
  assert.equal(information.primaryTask.label, 'Add festival timezone')
  assert.equal(information.primaryTask.tab, 'settings')

  const discoveries = getFestivalWorkspaceTaskDashboard({
    name: 'Festival',
    location: 'Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    timezone: 'UTC',
    lifecycle: 'upcoming',
  })
  assert.equal(discoveries.milestone, 'BUILD DISCOVERIES')
  assert.equal(discoveries.primaryTask.label, 'Configure first discovery')
})

test('testing readiness lists every real unmet testing requirement', () => {
  const dashboard = getFestivalWorkspaceTaskDashboard({
    name: 'Festival',
    lifecycle: 'upcoming',
  })
  assert.equal(dashboard.readyForTesting, false)
  assert.deepEqual(dashboard.testingBlockers, [
    'Festival location',
    'Start date',
    'End date',
    'Timezone',
    'At least one discovery',
    'At least one collection',
  ])
  assert.ok(
    dashboard.secondaryTasks.every(
      (task) => task.kind === 'actionable'
    )
  )
  assert.ok(dashboard.secondaryTasks.length <= 5)
})

test('production readiness requires testing, publishing, and backend capabilities', () => {
  const base = {
    name: 'Festival',
    location: 'Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    timezone: 'UTC',
    lifecycle: 'completed',
    discoveryCount: 1,
    collectionCount: 1,
    scheduleItemCount: 1,
  }
  const blocked = getFestivalWorkspaceTaskDashboard(base)
  assert.equal(blocked.readyForTesting, true)
  assert.equal(blocked.readyForProduction, false)
  assert.deepEqual(blocked.productionBlockers, [
    'Festival published',
    'Secure persistence available',
    'QR / NFC backend available',
    'Analytics backend available',
  ])

  const ready = getFestivalWorkspaceTaskDashboard({
    ...base,
    published: true,
    securePersistenceAvailable: true,
    qrNfcBackendAvailable: true,
    analyticsBackendAvailable: true,
  })
  assert.equal(ready.readyForProduction, true)
  assert.deepEqual(ready.productionBlockers, [])
  assert.equal(ready.milestone, 'READY FOR PRODUCTION')
})

test('builder steps and backend services remain separate', () => {
  const dashboard = getFestivalWorkspaceTaskDashboard({})
  assert.deepEqual(
    dashboard.builderSteps.map((step) => step.id),
    ['general', 'discoveries', 'collections', 'schedule', 'publishing']
  )
  assert.deepEqual(
    dashboard.backendServices.map((service) => service.id),
    ['qr-nfc', 'analytics']
  )
  assert.ok(
    dashboard.builderSteps.every((step) =>
      ['COMPLETE', 'IN PROGRESS', 'NOT STARTED', 'READY FOR REVIEW'].includes(
        step.status
      )
    )
  )
})

test('Tomorrowland local drafts enable testing but never production', () => {
  const dashboard = getFestivalWorkspaceTaskDashboard({
    id: 'tomorrowland-2026',
    name: 'Tomorrowland',
    location: 'Boom, Belgium',
    startDate: '2026-07-17',
    endDate: '2026-07-26',
    timezone: 'Europe/Brussels',
    lifecycle: 'live',
    publishStatus: 'TESTING',
    published: false,
    localConfigurationMode: true,
    informationDraftComplete: true,
    localDiscoveryDraftCount: 1,
    localCollectionDraftCount: 1,
    localDraftsUnsynced: true,
    scheduleItemCount: 1,
  })
  assert.equal(dashboard.readyForTesting, true)
  assert.equal(dashboard.readyForProduction, false)
  assert.ok(dashboard.productionBlockers.includes('No unsynced local drafts'))
  assert.equal(
    dashboard.builderSteps.find((step) => step.id === 'discoveries').status,
    'IN PROGRESS'
  )
  assert.equal(
    dashboard.builderSteps.find((step) => step.id === 'collections').status,
    'IN PROGRESS'
  )
})

test('valid local schedule drafts update Overview without merging repository counts', () => {
  const overview = getFestivalWorkspaceOverview({
    name: 'Tomorrowland',
    location: 'Boom, Belgium',
    startDate: '2026-07-17',
    endDate: '2026-07-26',
    timezone: 'Europe/Brussels',
    lifecycle: 'live',
    publishStatus: 'TESTING',
    scheduleItemCount: 0,
    localScheduleDraftCount: 2,
  })
  assert.equal(overview.metrics.scheduleItemCount, 0)
  assert.equal(overview.metrics.localScheduleDraftCount, 2)
  assert.equal(
    overview.statuses.find((item) => item.id === 'schedule').status,
    'PARTIAL'
  )
  assert.ok(
    !overview.missingConfiguration.includes('Schedule not configured')
  )
})

test('schedule milestone and readiness update from a local schedule draft', () => {
  const dashboard = getFestivalWorkspaceTaskDashboard({
    name: 'Tomorrowland',
    location: 'Boom, Belgium',
    startDate: '2026-07-17',
    endDate: '2026-07-26',
    timezone: 'Europe/Brussels',
    lifecycle: 'live',
    publishStatus: 'TESTING',
    published: false,
    discoveryCount: 0,
    collectionCount: 0,
    scheduleItemCount: 0,
    localDiscoveryDraftCount: 1,
    localCollectionDraftCount: 1,
    localScheduleDraftCount: 1,
  })
  assert.equal(
    dashboard.builderSteps.find((step) => step.id === 'schedule').status,
    'IN PROGRESS'
  )
  assert.equal(
    dashboard.builderSteps.find((step) => step.id === 'schedule')
      .localDraftCount,
    1
  )
  assert.equal(
    dashboard.builderSteps.find((step) => step.id === 'schedule')
      .repositoryCount,
    0
  )
  assert.ok(
    !dashboard.testingBlockers.includes('Schedule configured')
  )
  assert.ok(dashboard.progressPercent > 0)
  assert.ok(dashboard.missingCount >= 0)
})

test('Continue Building derives actionable progress without backend penalties', () => {
  const result = getBackstageContinueBuilding({
    id: 'lost-lands-2026',
    name: 'Lost Lands 2026',
    year: 2026,
    lifecycle: 'upcoming',
    location: 'Legend Valley — Thornville, Ohio',
    startDate: '2026-09-18',
    endDate: '2026-09-20',
    timezone: 'America/New_York',
    published: true,
    discoveryCount: 10,
    collectionCount: 6,
    scheduleItemCount: 1,
  })
  assert.equal(result.progressPercent, 100)
  assert.equal(result.nextAction, 'WAITING ON BACKEND CAPABILITIES')
  assert.equal(
    result.categories.filter((item) => item.status === 'BACKEND REQUIRED').length,
    2
  )
})

test('Continue Building follows priority and caps missing items', () => {
  const result = getBackstageContinueBuilding({
    id: 'tomorrowland-2026',
    name: 'Tomorrowland 2026',
    lifecycle: 'live',
    discoveryCount: 0,
    collectionCount: 0,
  })
  assert.match(result.nextAction, /configuration/i)
  assert.equal(result.missingItems.length, 3)
  assert.ok(result.totalMissingItems > result.missingItems.length)
})

test('Continue Building reaches READY FOR REVIEW with available capabilities', () => {
  const result = getBackstageContinueBuilding({
    id: 'complete',
    name: 'Complete Festival',
    location: 'Venue',
    startDate: '2026-01-01',
    endDate: '2026-01-02',
    timezone: 'UTC',
    lifecycle: 'completed',
    published: true,
    discoveryCount: 1,
    collectionCount: 1,
    scheduleItemCount: 1,
    qrNfcBackendAvailable: true,
    analyticsBackendAvailable: true,
  })
  assert.equal(result.progressPercent, 100)
  assert.equal(result.nextAction, 'READY FOR REVIEW')
})

test('Backstage modules are grouped by workflow', () => {
  assert.deepEqual(
    BACKSTAGE_MODULE_GROUPS.map((group) => group.label),
    ['FESTIVAL BUILDER', 'OPERATIONS', 'PLATFORM']
  )
  assert.equal(
    BACKSTAGE_MODULE_GROUPS.flatMap((group) => group.modules).length,
    13
  )
})

test('discovery filtering requires an exact festival match', () => {
  assert.deepEqual(
    filterDiscoveriesByFestival(discoveries, 'lost-lands').map(
      (item) => item.id
    ),
    ['ll-one']
  )
  assert.deepEqual(filterDiscoveriesByFestival(discoveries, ''), [])
})

test('collection filtering is festival scoped', () => {
  const collections = [
    { id: 'a', festivalId: 'edc', discoveryIds: ['edc-one'] },
    { id: 'b', festivalId: 'lost-lands', discoveryIds: ['ll-one'] },
  ]
  assert.deepEqual(
    filterCollectionsByFestival(collections, 'edc').map((item) => item.id),
    ['a']
  )
})

test('collection validation rejects cross-festival discoveries', () => {
  const result = validateCollectionFestivalScope(
    {
      festivalId: 'lost-lands',
      discoveryIds: ['ll-one', 'edc-one'],
    },
    discoveries
  )
  assert.equal(result.valid, false)
  assert.deepEqual(result.invalidDiscoveryIds, ['edc-one'])
})

test('user search returns only safe display fields', () => {
  const result = searchSafeUsers(
    [
      {
        id: 'user-a',
        email: 'admin@example.com',
        rave_name: 'BigGuy',
        country: 'US',
        access_token: 'secret',
        refresh_token: 'secret',
      },
    ],
    'big'
  )
  assert.equal(result.length, 1)
  assert.equal(result[0].raveName, 'BigGuy')
  assert.equal('access_token' in result[0], false)
  assert.equal('refresh_token' in result[0], false)
})

test('broadcast drafts are always explicitly unsent', () => {
  const draft = createBroadcastDraft({
    title: 'Gate update',
    message: 'Use the south entrance.',
    festivalId: 'lost-lands',
    audience: 'active-journey-users',
    status: 'SENT',
  })
  assert.equal(draft.status, 'NOT SENT')
  assert.equal(draft.audience, 'active-journey-users')
})

const festivalFixtures = [
  {
    id: 'tomorrowland-2026',
    name: 'Tomorrowland 2026',
    location: 'Boom, Belgium',
    timezone: 'Europe/Brussels',
    startDate: '2026-07-17',
    endDate: '2026-07-26',
    published: true,
    discoveryCount: 0,
    collectionCount: 0,
  },
  {
    id: 'edc-las-vegas-2026',
    name: 'EDC Las Vegas 2026',
    location: 'Las Vegas, Nevada',
    startDate: '2026-05-15',
    endDate: '2026-05-17',
    published: false,
    discoveryCount: 12,
    collectionCount: 0,
  },
  {
    id: 'home',
    name: 'Home',
    location: null,
    startDate: null,
    endDate: null,
  },
]

test('production filter hides obvious test records without deleting them', () => {
  const records = getFestivalAdminRecords(
    festivalFixtures,
    new Date('2026-07-25T12:00:00Z')
  )
  assert.deepEqual(
    filterAdminFestivals(records, 'production').map((record) => record.id),
    ['tomorrowland-2026', 'edc-las-vegas-2026']
  )
  assert.deepEqual(
    filterAdminFestivals(records, 'test').map((record) => record.id),
    ['home']
  )
  assert.equal(filterAdminFestivals(records, 'all').length, 3)
})

test('festival summary derives real lifecycle and publish counts', () => {
  const records = getFestivalAdminRecords(
    festivalFixtures,
    new Date('2026-07-25T12:00:00Z')
  )
  assert.deepEqual(summarizeAdminFestivals(records), {
    live: 1,
    upcoming: 0,
    completed: 1,
    draftOrUnknown: 2,
  })
})

test('Tomorrowland and EDC management records expose operational details', () => {
  const records = getFestivalAdminRecords(
    festivalFixtures,
    new Date('2026-07-25T12:00:00Z')
  )
  const tomorrowland = records.find((record) => record.id === 'tomorrowland-2026')
  const edc = records.find((record) => record.id === 'edc-las-vegas-2026')
  assert.equal(tomorrowland.lifecycle, 'live')
  assert.equal(tomorrowland.location, 'Boom, Belgium')
  assert.equal(tomorrowland.dateLabel, 'July 17–26, 2026')
  assert.equal(getFestivalPublishLabel(tomorrowland.published), 'PUBLISHED')
  assert.equal(tomorrowland.discoveryCount, 0)
  assert.equal(edc.lifecycle, 'completed')
  assert.equal(edc.discoveryCount, 12)
  assert.equal(getFestivalPublishLabel(edc.published), 'DRAFT')
  assert.equal(getFestivalPublishLabel(null), 'STATUS NOT SET')
})

test('festival sorting uses lifecycle priority and deterministic dates', () => {
  const records = getFestivalAdminRecords(
    [
      ...festivalFixtures,
      {
        id: 'ultra-miami-2027',
        name: 'Ultra Miami 2027',
        startDate: '2027-03-26',
        endDate: '2027-03-28',
      },
    ],
    new Date('2026-07-25T12:00:00Z')
  )
  assert.deepEqual(
    sortAdminFestivals(records).map((record) => record.id),
    [
      'tomorrowland-2026',
      'ultra-miami-2027',
      'edc-las-vegas-2026',
      'home',
    ]
  )
})

test('festival search matches name, location, and year with active filters', () => {
  const records = getFestivalAdminRecords(
    festivalFixtures,
    new Date('2026-07-25T12:00:00Z')
  )
  const production = filterAdminFestivals(records, 'production')
  assert.deepEqual(
    searchAdminFestivals(production, 'tomorrow').map((record) => record.id),
    ['tomorrowland-2026']
  )
  assert.deepEqual(
    searchAdminFestivals(production, 'boom').map((record) => record.id),
    ['tomorrowland-2026']
  )
  assert.equal(searchAdminFestivals(production, '2026').length, 2)
  assert.deepEqual(searchAdminFestivals(production, 'home'), [])
})

test('festival records expose IDs, source, and specific missing fields', () => {
  const [record] = getFestivalAdminRecords(
    [festivalFixtures[2]],
    new Date('2026-07-25T12:00:00Z')
  )
  assert.equal(record.editionId, 'home')
  assert.equal(record.dataSource, 'Managed festival record')
  assert.deepEqual(record.missingFields, [
    'location',
    'start date',
    'end date',
    'timezone',
    'publish state',
  ])
})
