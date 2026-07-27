import assert from 'node:assert/strict'
import test from 'node:test'
import {
  archiveCollectionDraft,
  archiveScheduleDraft,
  backstageDraftStorage,
  createFestivalInformationInput,
  duplicateScheduleDraft,
  getPublishingPipelineReview,
  formatScheduleTime24,
  formatScheduleTime12Label,
  loadBackstageDrafts,
  mergeFestivalWithDrafts,
  parseScheduleTime12,
  restoreCollectionDraft,
  restoreScheduleDraft,
  saveBackstageDraft,
  validateCollectionDraft,
  validateDiscoveryDraft,
  validateFestivalInformation,
  validateScheduleDraft,
} from './backstageDraftStore.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

const tomorrowland = {
  id: 'tomorrowland-2026',
  name: 'Tomorrowland 2026',
  year: 2026,
  location: 'Boom, Belgium',
  startDate: '2026-07-17',
  endDate: '2026-07-26',
  timezone: 'Europe/Brussels',
  publishStatus: 'TESTING',
}

test('Tomorrowland information preloads verified repository values', () => {
  assert.deepEqual(createFestivalInformationInput(tomorrowland), {
    name: 'Tomorrowland',
    year: '2026',
    location: 'Boom, Belgium',
    startDate: '2026-07-17',
    endDate: '2026-07-26',
    timezone: 'Europe/Brussels',
    description: '',
    website: '',
    artwork: '',
    publishStatus: 'TESTING',
  })
})

test('festival information accepts Brussels timezone and TESTING', () => {
  const result = validateFestivalInformation(
    createFestivalInformationInput(tomorrowland)
  )
  assert.equal(result.valid, true)
})

test('festival information rejects invalid date order and website', () => {
  const input = {
    ...createFestivalInformationInput(tomorrowland),
    endDate: '2026-07-01',
    website: 'not-a-website',
  }
  const result = validateFestivalInformation(input)
  assert.equal(result.valid, false)
  assert.ok(result.errors.endDate)
  assert.ok(result.errors.website)
})

test('draft storage is versioned, persistent, and account scoped', () => {
  const storage = memoryStorage()
  saveBackstageDraft(storage, 'account-a', tomorrowland.id, 'discoveries', [
    { id: 'draft-a' },
  ])
  assert.equal(
    loadBackstageDrafts(storage, 'account-a', tomorrowland.id)
      .discoveries[0].id,
    'draft-a'
  )
  assert.deepEqual(
    loadBackstageDrafts(storage, 'account-b', tomorrowland.id).discoveries,
    []
  )
  assert.match(
    backstageDraftStorage.key(
      'account-a',
      tomorrowland.id,
      'discoveries'
    ),
    /backstage:v1:account-a:tomorrowland-2026:discoveries/
  )
})

test('malformed draft storage fails safely', () => {
  const storage = memoryStorage()
  storage.setItem(
    backstageDraftStorage.key('a', tomorrowland.id, 'collections'),
    '{bad'
  )
  assert.deepEqual(
    loadBackstageDrafts(storage, 'a', tomorrowland.id).collections,
    []
  )
  storage.setItem(
    backstageDraftStorage.key('a', tomorrowland.id, 'schedule'),
    '{bad'
  )
  assert.deepEqual(
    loadBackstageDrafts(storage, 'a', tomorrowland.id).schedule,
    []
  )
  storage.setItem(
    backstageDraftStorage.key('a', tomorrowland.id, 'schedule'),
    JSON.stringify([null, 'invalid', []])
  )
  assert.deepEqual(
    loadBackstageDrafts(storage, 'a', tomorrowland.id).schedule,
    []
  )
  assert.equal(
    validateScheduleDraft(null, tomorrowland, [], []).valid,
    false
  )
})

test('schedule drafts persist with account and festival isolation', () => {
  const storage = memoryStorage()
  const schedule = [{ id: 'tl-schedule', festivalId: tomorrowland.id }]
  saveBackstageDraft(
    storage,
    'account-a',
    tomorrowland.id,
    'schedule',
    schedule
  )
  assert.deepEqual(
    loadBackstageDrafts(storage, 'account-a', tomorrowland.id).schedule,
    schedule
  )
  assert.deepEqual(
    loadBackstageDrafts(storage, 'account-b', tomorrowland.id).schedule,
    []
  )
  assert.deepEqual(
    loadBackstageDrafts(storage, 'account-a', 'edc-2026').schedule,
    []
  )
})

test('discovery validation enforces festival, coordinates, XP, and IDs', () => {
  const valid = {
    id: 'tomorrowland-main-stage',
    title: 'Main Stage',
    location: 'Festival grounds',
    category: 'stage',
    rarity: 'rare',
    claimMethod: 'gps',
    latitude: '50.1',
    longitude: '4.3',
    xp: 100,
    festivalId: tomorrowland.id,
  }
  assert.equal(
    validateDiscoveryDraft(valid, [], tomorrowland.id).valid,
    true
  )
  const invalid = validateDiscoveryDraft(
    {
      ...valid,
      festivalId: 'edc-las-vegas-2026',
      latitude: 91,
      longitude: -181,
      xp: -1,
    },
    [valid],
    tomorrowland.id
  )
  assert.equal(invalid.valid, false)
  assert.ok(invalid.errors.festivalId)
  assert.ok(invalid.errors.latitude)
  assert.ok(invalid.errors.longitude)
  assert.ok(invalid.errors.xp)
  assert.ok(invalid.errors.id)
})

test('collection validation rejects duplicates and cross-festival records', () => {
  const discovery = {
    id: 'tl-draft',
    festivalId: tomorrowland.id,
  }
  const valid = {
    name: 'First Collection',
    discoveryIds: [discovery.id],
    xp: 0,
    festivalId: tomorrowland.id,
  }
  assert.equal(
    validateCollectionDraft(valid, [discovery], tomorrowland.id).valid,
    true
  )
  const duplicate = validateCollectionDraft(
    { ...valid, discoveryIds: [discovery.id, discovery.id] },
    [discovery],
    tomorrowland.id
  )
  assert.ok(duplicate.errors.discoveryIds)
  const crossFestival = validateCollectionDraft(
    { ...valid, discoveryIds: ['edc-draft'] },
    [{ id: 'edc-draft', festivalId: 'edc-las-vegas-2026' }],
    tomorrowland.id
  )
  assert.ok(crossFestival.errors.discoveryIds)
})

test('collection validation supports separate required and optional discoveries', () => {
  const discoveries = [
    { id: 'required', festivalId: tomorrowland.id },
    { id: 'optional', festivalId: tomorrowland.id },
  ]
  const valid = {
    name: 'Tomorrowland Trail',
    requiredDiscoveryIds: ['required'],
    optionalDiscoveryIds: ['optional'],
    completionRequirement: 'all-required',
    xp: 25,
    festivalId: tomorrowland.id,
  }
  assert.equal(
    validateCollectionDraft(valid, discoveries, tomorrowland.id).valid,
    true
  )
  assert.ok(
    validateCollectionDraft(
      { ...valid, requiredDiscoveryIds: [] },
      discoveries,
      tomorrowland.id
    ).errors.requiredDiscoveryIds
  )
  assert.ok(
    validateCollectionDraft(
      {
        ...valid,
        optionalDiscoveryIds: ['optional', 'optional'],
      },
      discoveries,
      tomorrowland.id
    ).errors.discoveryIds
  )
  assert.ok(
    validateCollectionDraft(
      {
        ...valid,
        optionalDiscoveryIds: ['required'],
      },
      discoveries,
      tomorrowland.id
    ).errors.discoveryIds
  )
  assert.ok(
    validateCollectionDraft(
      { ...valid, completionRequirement: '' },
      discoveries,
      tomorrowland.id
    ).errors.completionRequirement
  )
  assert.ok(
    validateCollectionDraft(
      { ...valid, xp: -1 },
      discoveries,
      tomorrowland.id
    ).errors.xp
  )
})

test('collection archive and restore preserve all saved draft data', () => {
  const draft = {
    id: 'tomorrowland-collection',
    name: 'Tomorrowland Trail',
    requiredDiscoveryIds: ['required'],
    optionalDiscoveryIds: ['optional'],
    badgeReward: 'Relic badge',
    passportStampReward: 'Trail stamp',
    hiddenUnlockDescription: 'A hidden ending',
    archived: false,
  }
  const archived = archiveCollectionDraft([draft], draft.id)
  assert.equal(archived[0].archived, true)
  assert.deepEqual(archived[0].requiredDiscoveryIds, ['required'])
  assert.equal(archived[0].badgeReward, 'Relic badge')

  const restored = restoreCollectionDraft(archived, draft.id)
  assert.deepEqual(restored, [draft])
  assert.notEqual(archived[0], draft)
  assert.notEqual(restored[0], archived[0])
})

test('schedule validation enforces festival dates, time order, and scoped links', () => {
  const discovery = { id: 'tl-discovery', festivalId: tomorrowland.id }
  const collection = { id: 'tl-collection', festivalId: tomorrowland.id }
  const valid = {
    id: 'tl-schedule',
    festivalId: tomorrowland.id,
    title: 'Opening Moment',
    date: '2026-07-17',
    startTime: '12:00',
    endTime: '13:00',
    timezone: 'Europe/Brussels',
    location: 'Mainstage',
    category: 'performance',
    linkedDiscoveryId: discovery.id,
    linkedCollectionId: collection.id,
  }
  assert.equal(
    validateScheduleDraft(
      valid,
      tomorrowland,
      [discovery],
      [collection]
    ).valid,
    true
  )
  assert.ok(
    validateScheduleDraft(
      { ...valid, date: '2026-07-27' },
      tomorrowland,
      [discovery],
      [collection]
    ).errors.date
  )
  assert.ok(
    validateScheduleDraft(
      { ...valid, endTime: '12:00' },
      tomorrowland,
      [discovery],
      [collection]
    ).errors.endTime
  )
  assert.ok(
    validateScheduleDraft(
      { ...valid, title: '', timezone: '' },
      tomorrowland,
      [discovery],
      [collection]
    ).errors.title
  )
  assert.ok(
    validateScheduleDraft(
      { ...valid, linkedDiscoveryId: 'edc-discovery' },
      tomorrowland,
      [{ id: 'edc-discovery', festivalId: 'edc-2026' }],
      [collection]
    ).errors.linkedDiscoveryId
  )
  assert.ok(
    validateScheduleDraft(
      { ...valid, linkedCollectionId: 'edc-collection' },
      tomorrowland,
      [discovery],
      [{ id: 'edc-collection', festivalId: 'edc-2026' }]
    ).errors.linkedCollectionId
  )
  assert.equal(
    validateScheduleDraft(
      valid,
      tomorrowland,
      [{ ...discovery, archived: true }],
      [{ ...collection, archived: true }]
    ).valid,
    true
  )
})

test('schedule time helpers preserve Safari-friendly 12-hour PM entry', () => {
  assert.deepEqual(parseScheduleTime12('18:00'), {
    hour: '6',
    minute: '00',
    period: 'PM',
  })
  assert.equal(
    formatScheduleTime24({ hour: '6', minute: '00', period: 'PM' }),
    '18:00'
  )
  assert.equal(
    formatScheduleTime24({ hour: '7', minute: '00', period: 'PM' }),
    '19:00'
  )
  assert.equal(
    formatScheduleTime24({ hour: '12', minute: '00', period: 'AM' }),
    '00:00'
  )
  assert.equal(
    formatScheduleTime24({ hour: '12', minute: '00', period: 'PM' }),
    '12:00'
  )
  assert.equal(formatScheduleTime12Label('18:00'), '6:00 PM')
  assert.equal(formatScheduleTime12Label('19:00'), '7:00 PM')
})

test('schedule duplicate, archive, and restore preserve the source record', () => {
  const source = {
    id: 'source',
    title: 'Opening Moment',
    festivalId: tomorrowland.id,
    date: '2026-07-17',
    startTime: '12:00',
    endTime: '13:00',
    timezone: 'Europe/Brussels',
    location: 'Mainstage',
    category: 'performance',
    archived: false,
  }
  const duplicated = duplicateScheduleDraft([source], source.id, 'copy')
  assert.equal(duplicated.length, 2)
  assert.equal(duplicated[0].title, 'Opening Moment')
  assert.equal(duplicated[1].id, 'copy')
  assert.equal(duplicated[1].title, 'Opening Moment Copy')
  const archived = archiveScheduleDraft(duplicated, 'copy')
  assert.equal(archived[1].archived, true)
  const restored = restoreScheduleDraft(archived, 'copy')
  assert.equal(restored[1].archived, false)
  assert.equal(restored[1].location, 'Mainstage')
})

test('publishing pipeline separates repository counts from valid local drafts', () => {
  const information = {
    ...createFestivalInformationInput(tomorrowland),
    description: 'A local review description',
  }
  const discovery = {
    id: 'tomorrowland-discovery',
    festivalId: tomorrowland.id,
    title: 'Core Stage',
    location: 'Boom',
    category: 'stage',
    rarity: 'rare',
    claimMethod: 'gps',
    latitude: '',
    longitude: '',
    xp: 100,
    active: true,
  }
  const collection = {
    id: 'tomorrowland-collection',
    festivalId: tomorrowland.id,
    name: 'Core Trail',
    requiredDiscoveryIds: [discovery.id],
    optionalDiscoveryIds: [],
    completionRequirement: 'all-required',
    xp: 50,
    active: true,
  }
  const review = getPublishingPipelineReview(
    {
      ...tomorrowland,
      lifecycle: 'live',
      discoveryCount: 0,
      collectionCount: 0,
      repositoryConfiguration: createFestivalInformationInput(tomorrowland),
    },
    {
      information,
      discoveries: [discovery],
      collections: [collection],
    }
  )
  assert.deepEqual(review.counts, {
    repositoryDiscoveries: 0,
    localDiscoveries: 1,
    repositoryCollections: 0,
    localCollections: 1,
    repositorySchedule: 0,
    localSchedule: 0,
  })
  assert.equal(review.readyForLocalTesting, true)
  assert.equal(review.readyForProduction, false)
  assert.deepEqual(review.localTestingBlockers, [])
  assert.ok(review.productionBlockers.includes('Unsynced local drafts'))
  assert.ok(
    review.productionBlockers.includes('Secure persistence unavailable')
  )
  assert.ok(
    review.productionBlockers.includes('Publishing backend unavailable')
  )
  assert.equal(review.informationChanges[0].field, 'description')
  assert.equal(review.discoveryDrafts[0].title, 'Core Stage')
  assert.equal(review.collectionDrafts[0].requiredCount, 1)
})

test('publishing pipeline reports each real local testing blocker', () => {
  const review = getPublishingPipelineReview(
    {
      ...tomorrowland,
      timezone: '',
      publishStatus: '',
      repositoryConfiguration: createFestivalInformationInput(tomorrowland),
    },
    {
      information: {
        ...createFestivalInformationInput(tomorrowland),
        timezone: '',
        publishStatus: '',
      },
      discoveries: [],
      collections: [],
    }
  )
  assert.equal(review.readyForLocalTesting, false)
  assert.ok(
    review.localTestingBlockers.includes(
      'Required festival information incomplete'
    )
  )
  assert.ok(review.localTestingBlockers.includes('Timezone missing'))
  assert.ok(review.localTestingBlockers.includes('Publish status not set'))
  assert.ok(review.localTestingBlockers.includes('No active discovery draft'))
  assert.ok(review.localTestingBlockers.includes('No active collection draft'))
})

test('merged workspace keeps repository and local draft counts separate', () => {
  const information = createFestivalInformationInput(tomorrowland)
  const discovery = {
    id: 'tl-draft',
    title: 'Draft',
    location: 'Boom',
    category: 'stage',
    rarity: 'rare',
    claimMethod: 'gps',
    latitude: '',
    longitude: '',
    xp: 100,
    festivalId: tomorrowland.id,
  }
  const collection = {
    id: 'tl-collection',
    name: 'Draft Collection',
    discoveryIds: [discovery.id],
    xp: 0,
    festivalId: tomorrowland.id,
  }
  const merged = mergeFestivalWithDrafts(
    { ...tomorrowland, discoveryCount: 0, collectionCount: 0 },
    { information, discoveries: [discovery], collections: [collection] }
  )
  assert.equal(merged.discoveryCount, 0)
  assert.equal(merged.collectionCount, 0)
  assert.equal(merged.localDiscoveryDraftCount, 1)
  assert.equal(merged.localCollectionDraftCount, 1)
  assert.equal(merged.informationDraftComplete, true)
  assert.equal(merged.localDraftsUnsynced, true)
})

test('Overview keeps an active schedule count when its same-festival link is archived', () => {
  const discovery = {
    id: 'tl-discovery',
    title: 'Draft',
    location: 'Boom',
    category: 'stage',
    rarity: 'rare',
    claimMethod: 'gps',
    latitude: '',
    longitude: '',
    xp: 10,
    festivalId: tomorrowland.id,
    archived: true,
  }
  const collection = {
    id: 'tl-collection',
    name: 'Draft Collection',
    discoveryIds: [discovery.id],
    xp: 0,
    festivalId: tomorrowland.id,
    archived: true,
  }
  const schedule = {
    id: 'tl-schedule',
    title: 'Opening Moment',
    festivalId: tomorrowland.id,
    date: '2026-07-17',
    startTime: '18:00',
    endTime: '19:00',
    timezone: 'Europe/Brussels',
    location: 'Mainstage',
    category: 'performance',
    linkedDiscoveryId: discovery.id,
    linkedCollectionId: collection.id,
    active: true,
  }
  const merged = mergeFestivalWithDrafts(tomorrowland, {
    information: createFestivalInformationInput(tomorrowland),
    discoveries: [discovery],
    collections: [collection],
    schedule: [schedule],
  })
  assert.equal(merged.localDiscoveryDraftCount, 0)
  assert.equal(merged.localCollectionDraftCount, 0)
  assert.equal(merged.localScheduleDraftCount, 1)
})
