import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  ATTENDEE_CONTENT_STATES,
  resolveAttendeeContentState,
  resolveAttendeeContentStateFromCounts,
} from './attendeeContentState.js'

const FESTIVAL_ID = 'festival-2026'
const discovery = (overrides = {}) => ({
  id: 'discovery-1',
  festivalId: FESTIVAL_ID,
  name: 'Discovery',
  ...overrides,
})
const collection = (overrides = {}) => ({
  id: 'collection-1',
  festivalId: FESTIVAL_ID,
  name: 'Collection',
  discoveryIds: ['discovery-1'],
  ...overrides,
})

test('empty content is honest and never complete or 100 percent', () => {
  const state = resolveAttendeeContentState({
    festivalId: FESTIVAL_ID,
  })
  assert.equal(state.state, ATTENDEE_CONTENT_STATES.EMPTY)
  assert.equal(state.isEmpty, true)
  assert.equal(state.isComplete, false)
  assert.equal(state.overallProgressPercent, 0)
  assert.equal(state.discoveryProgressPercent, 0)
  assert.equal(state.collectionProgressPercent, 0)
  assert.equal(state.canShowRecap, false)
  assert.equal(state.canShowDiscoveryAlbum, false)
  assert.equal(state.canShowCollections, false)
  assert.equal(state.canShowCollectionComplete, false)
  assert.equal(state.canShowAchievementComplete, false)
  assert.match(state.emptyStateReason, /No published discoveries/)
})

test('published discovery progress resolves in progress and complete', () => {
  const incomplete = resolveAttendeeContentState({
    festivalId: FESTIVAL_ID,
    discoveries: [discovery()],
  })
  assert.equal(incomplete.state, ATTENDEE_CONTENT_STATES.IN_PROGRESS)
  assert.equal(incomplete.discoveryProgressPercent, 0)

  const complete = resolveAttendeeContentState({
    festivalId: FESTIVAL_ID,
    discoveries: [discovery()],
    collectedIds: ['discovery-1'],
  })
  assert.equal(complete.state, ATTENDEE_CONTENT_STATES.COMPLETE)
  assert.equal(complete.discoveryProgressPercent, 100)
})

test('published collection progress resolves in progress and complete', () => {
  const input = {
    festivalId: FESTIVAL_ID,
    discoveries: [discovery()],
    collections: [collection()],
  }
  assert.equal(
    resolveAttendeeContentState(input).state,
    ATTENDEE_CONTENT_STATES.IN_PROGRESS
  )
  const complete = resolveAttendeeContentState({
    ...input,
    collectedIds: ['discovery-1'],
  })
  assert.equal(complete.state, ATTENDEE_CONTENT_STATES.COMPLETE)
  assert.equal(complete.completedCollections, 1)
  assert.equal(complete.collectionProgressPercent, 100)
})

test('inactive, archived, unpublished, test, and local discoveries are excluded', () => {
  const records = [
    discovery({ id: 'inactive', active: false }),
    discovery({ id: 'archived', archived: true }),
    discovery({ id: 'unpublished', published: false }),
    discovery({ id: 'draft-status', status: 'draft' }),
    discovery({ id: 'testing-status', publishStatus: 'TESTING' }),
    discovery({ id: 'test', testOnly: true }),
    discovery({ id: 'local', sourceType: 'backstage-draft' }),
  ]
  assert.equal(
    resolveAttendeeContentState({
      festivalId: FESTIVAL_ID,
      discoveries: records,
    }).totalDiscoveries,
    0
  )
})

test('inactive, archived, unpublished, and local collections are excluded', () => {
  const records = [
    collection({ id: 'inactive', active: false }),
    collection({ id: 'archived', archived: true }),
    collection({ id: 'unpublished', published: false }),
    collection({ id: 'draft-status', publish_status: 'DRAFT' }),
    collection({ id: 'local', sourceType: 'local-draft' }),
  ]
  assert.equal(
    resolveAttendeeContentState({
      festivalId: FESTIVAL_ID,
      discoveries: [discovery()],
      collections: records,
    }).totalCollections,
    0
  )
})

test('malformed and cross-festival records fail safely', () => {
  const state = resolveAttendeeContentState({
    festivalId: FESTIVAL_ID,
    discoveries: [
      null,
      {},
      { id: 'missing-name', festivalId: FESTIVAL_ID },
      discovery({ id: 'other', festivalId: 'other-festival' }),
    ],
    collections: [
      {},
      collection({ discoveryIds: [] }),
      collection({
        id: 'other-collection',
        festivalId: 'other-festival',
      }),
    ],
  })
  assert.equal(state.state, ATTENDEE_CONTENT_STATES.EMPTY)
})

test('count normalization never treats zero denominators as complete', () => {
  const state = resolveAttendeeContentStateFromCounts({
    totalDiscoveries: 0,
    completedDiscoveries: 9,
    totalCollections: 0,
    completedCollections: 4,
  })
  assert.equal(state.state, ATTENDEE_CONTENT_STATES.EMPTY)
  assert.equal(state.isComplete, false)
  assert.equal(state.overallProgressPercent, 0)
})

test('resolver is festival isolated and returns immutable results', () => {
  const state = resolveAttendeeContentState({
    festivalId: FESTIVAL_ID,
    discoveries: [
      discovery(),
      discovery({ id: 'other', festivalId: 'other-festival' }),
    ],
    collectedIds: ['other'],
  })
  assert.equal(state.totalDiscoveries, 1)
  assert.equal(state.completedDiscoveries, 0)
  assert.equal(Object.isFrozen(state), true)
  assert.equal(Object.isFrozen(state.eligibleDiscoveries), true)
})

test('account-scoped collected IDs produce isolated attendee progress', () => {
  const input = {
    festivalId: FESTIVAL_ID,
    discoveries: [discovery()],
  }
  assert.equal(
    resolveAttendeeContentState({
      ...input,
      collectedIds: ['discovery-1'],
    }).completedDiscoveries,
    1
  )
  assert.equal(
    resolveAttendeeContentState({
      ...input,
      collectedIds: [],
    }).completedDiscoveries,
    0
  )
})

test('all private attendee surfaces consume the shared resolver state', () => {
  const appSource = readFileSync(
    new URL('../App.jsx', import.meta.url),
    'utf8'
  )
  const lifecycleSource = readFileSync(
    new URL(
      '../components/Dashboard/FestivalLifecycleDashboard.jsx',
      import.meta.url
    ),
    'utf8'
  )
  const missionControlSource = readFileSync(
    new URL(
      '../components/Dashboard/FestivalDashboard.jsx',
      import.meta.url
    ),
    'utf8'
  )
  const journeySource = readFileSync(
    new URL(
      '../components/Passport/PassportJourneyPage.jsx',
      import.meta.url
    ),
    'utf8'
  )
  const collectionsSource = readFileSync(
    new URL(
      '../components/Collections/FestivalCollections.jsx',
      import.meta.url
    ),
    'utf8'
  )

  assert.match(appSource, /resolveAttendeeContentState/)
  assert.match(appSource, /contentState=\{attendeeContentState\}/)
  assert.match(
    appSource,
    /!attendeeContentState\.canShowDiscoveryAlbum/
  )
  assert.match(lifecycleSource, /contentState/)
  assert.match(missionControlSource, /contentState/)
  assert.match(journeySource, /contentState/)
  assert.match(collectionsSource, /contentState/)
})

test('public Passport remains independent from private attendee state', () => {
  const source = readFileSync(
    new URL('../components/PublicProfile.jsx', import.meta.url),
    'utf8'
  )
  assert.doesNotMatch(source, /attendeeContentState/)
})

test('all attendee surfaces receive the same empty, progress, and complete states', () => {
  const scenarios = [
    {
      expected: ATTENDEE_CONTENT_STATES.EMPTY,
      input: { festivalId: FESTIVAL_ID },
    },
    {
      expected: ATTENDEE_CONTENT_STATES.IN_PROGRESS,
      input: {
        festivalId: FESTIVAL_ID,
        discoveries: [discovery()],
        collections: [collection()],
      },
    },
    {
      expected: ATTENDEE_CONTENT_STATES.COMPLETE,
      input: {
        festivalId: FESTIVAL_ID,
        discoveries: [discovery()],
        collections: [collection()],
        collectedIds: ['discovery-1'],
      },
    },
  ]

  for (const { expected, input } of scenarios) {
    const shared = resolveAttendeeContentState(input)
    const surfaceStates = {
      dashboard: shared.state,
      journey: shared.state,
      discoveries: shared.state,
      collections: shared.state,
    }
    assert.deepEqual(
      new Set(Object.values(surfaceStates)),
      new Set([expected])
    )
  }
})
