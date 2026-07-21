import assert from 'node:assert/strict'
import test from 'node:test'
import { selectNextFestivalDiscovery } from './DiscoverySelectors.js'
import {
  getFestivalDiscoveries,
  getFestivalProfile,
} from '../festivals/index.js'

const FESTIVAL_ID = 'festival-a'
const NOW = new Date('2026-09-25T12:00:00.000Z')
const discoveries = [
  { id: 'alpha', name: 'Alpha', festivalId: FESTIVAL_ID },
  { id: 'beta', name: 'Beta', festivalId: FESTIVAL_ID },
  { id: 'gamma', name: 'Gamma', festivalId: 'festival-b' },
]

function select(overrides = {}) {
  return selectNextFestivalDiscovery({
    discoveries,
    collectedIds: [],
    festivalId: FESTIVAL_ID,
    activeDropIds: [],
    activeDropWindows: {},
    gpsDrops: [],
    nearbyGpsDrops: [],
    now: NOW,
    ...overrides,
  })
}

test('nearby uncollected GPS drop wins', () => {
  const result = select({
    activeDropIds: ['beta'],
    activeDropWindows: {
      beta: { festivalId: FESTIVAL_ID, isActive: true },
    },
    nearbyGpsDrops: [
      {
        stamp_id: 'alpha',
        festival_id: FESTIVAL_ID,
        is_active: true,
        unlocked: true,
      },
    ],
  })

  assert.equal(result?.id, 'alpha')
})

test('collected nearby GPS drop is skipped', () => {
  const result = select({
    collectedIds: ['alpha'],
    nearbyGpsDrops: [
      {
        stamp_id: 'alpha',
        festival_id: FESTIVAL_ID,
        is_active: true,
        unlocked: true,
      },
    ],
  })

  assert.equal(result?.id, 'beta')
})

test('active live drop wins when no nearby GPS drop exists', () => {
  const result = select({
    activeDropIds: ['beta'],
    activeDropWindows: {
      beta: {
        festivalId: FESTIVAL_ID,
        isActive: true,
        startsAt: '2026-09-25T11:00:00.000Z',
        endsAt: '2026-09-25T13:00:00.000Z',
      },
    },
    gpsDrops: [
      { stamp_id: 'alpha', festival_id: FESTIVAL_ID, is_active: true },
    ],
  })

  assert.equal(result?.id, 'beta')
})

test('expired live drop is skipped', () => {
  const result = select({
    activeDropIds: ['gamma'],
    activeDropWindows: {
      gamma: {
        festivalId: FESTIVAL_ID,
        isActive: true,
        endsAt: '2026-09-25T11:59:59.000Z',
      },
    },
  })

  assert.equal(result?.id, 'alpha')
})

test('drop from another festival is skipped', () => {
  const result = select({
    activeDropIds: ['gamma'],
    activeDropWindows: {
      gamma: { festivalId: 'festival-b', isActive: true },
    },
  })

  assert.equal(result?.id, 'alpha')
})

test('stale unknown stamp ID is skipped', () => {
  const result = select({
    nearbyGpsDrops: [
      {
        stamp_id: 'missing',
        festival_id: FESTIVAL_ID,
        is_active: true,
        unlocked: true,
      },
    ],
    gpsDrops: [
      { stamp_id: 'also-missing', festival_id: FESTIVAL_ID, is_active: true },
    ],
  })

  assert.equal(result?.id, 'alpha')
})

test('festival discovery fallback works', () => {
  const result = select({ collectedIds: ['alpha'] })

  assert.equal(result?.id, 'beta')
})

test('generic first-uncollected fallback works', () => {
  const result = select({
    discoveries: [
      { id: 'gamma', name: 'Gamma', festivalId: 'festival-b' },
      { id: 'delta', name: 'Delta' },
    ],
  })

  assert.equal(result?.id, 'gamma')
})

test('returns null when everything is collected', () => {
  const result = select({
    collectedIds: discoveries.map((discovery) => discovery.id),
  })

  assert.equal(result, null)
})

test('changing the selected festival recalculates the target', () => {
  const festivalADiscovery = select({ festivalId: 'festival-a' })
  const festivalBDiscovery = select({ festivalId: 'festival-b' })

  assert.equal(festivalADiscovery?.id, 'alpha')
  assert.equal(festivalBDiscovery?.id, 'gamma')
})

test('stale cross-festival drop state cannot select the previous target', () => {
  const result = select({
    festivalId: 'festival-b',
    activeDropIds: ['alpha'],
    activeDropWindows: {
      alpha: { festivalId: 'festival-a', isActive: true },
    },
    gpsDrops: [
      { stamp_id: 'beta', festival_id: 'festival-a', is_active: true },
    ],
    nearbyGpsDrops: [
      {
        stamp_id: 'alpha',
        festival_id: 'festival-a',
        is_active: true,
        unlocked: true,
      },
    ],
  })

  assert.equal(result?.id, 'gamma')
})

test('festival discovery IDs constrain the discovery fallback', () => {
  const result = select({ festivalDiscoveryIds: ['beta'] })

  assert.equal(result?.id, 'beta')
})

test('unknown configured discovery IDs are ignored safely', () => {
  const result = select({
    festivalDiscoveryIds: ['missing', 'beta'],
  })

  assert.equal(result?.id, 'beta')
})

test('empty festival discovery IDs preserve generic fallback', () => {
  const result = select({
    discoveries: [
      { id: 'gamma', name: 'Gamma', festivalId: 'festival-b' },
      { id: 'delta', name: 'Delta' },
    ],
    festivalDiscoveryIds: [],
  })

  assert.equal(result?.id, 'gamma')
})

test('configured festival returns null when its discoveries are collected', () => {
  const result = select({
    collectedIds: ['alpha', 'beta'],
    festivalDiscoveryIds: ['alpha', 'beta'],
  })

  assert.equal(result, null)
})

test('configured profile rejects a live discovery owned by another profile', () => {
  const result = select({
    festivalDiscoveryIds: ['beta'],
    activeDropIds: ['gamma'],
    activeDropWindows: {
      gamma: { festivalId: FESTIVAL_ID, isActive: true },
    },
  })

  assert.equal(result?.id, 'beta')
})

function selectProfileDiscovery(festivalId, collectedIds = [], discoveryIds) {
  const profile = getFestivalProfile(festivalId)

  return selectNextFestivalDiscovery({
    discoveries: getFestivalDiscoveries(),
    collectedIds,
    festivalId,
    festivalDiscoveryIds: discoveryIds || profile?.discoveryIds,
    now: NOW,
  })
}

test('Lost Lands profile selects a Lost Lands discovery', () => {
  const result = selectProfileDiscovery('lost-lands-2026')

  assert.equal(result?.id, 'lost-lands-prehistoric-stage')
})

test('EDC profile does not select a Lost Lands discovery', () => {
  const result = selectProfileDiscovery('edc-las-vegas-2026')

  assert.equal(result?.festivalId, 'edc-las-vegas-2026')
})

test('collected Lost Lands discovery is skipped', () => {
  const result = selectProfileDiscovery('lost-lands-2026', [
    'lost-lands-prehistoric-stage',
  ])

  assert.equal(result?.id, 'lost-lands-crater')
})

test('unknown Lost Lands discovery ID is ignored', () => {
  const profile = getFestivalProfile('lost-lands-2026')
  const result = selectProfileDiscovery(
    'lost-lands-2026',
    [],
    ['lost-lands-unknown', ...profile.discoveryIds]
  )

  assert.equal(result?.id, 'lost-lands-prehistoric-stage')
})

test('all claimable Lost Lands discoveries collected returns null', () => {
  const profile = getFestivalProfile('lost-lands-2026')
  const achievementId = 'lost-lands-prehistoric-explorer'
  const claimableIds = profile.discoveryIds.filter(
    (discoveryId) => discoveryId !== achievementId
  )
  const result = selectProfileDiscovery('lost-lands-2026', claimableIds)

  assert.equal(result, null)
})

test('achievement-only Lost Lands discovery is excluded from Radar', () => {
  const result = selectProfileDiscovery(
    'lost-lands-2026',
    [],
    ['lost-lands-prehistoric-explorer']
  )

  assert.equal(result, null)
})

test('switching festival profiles changes the constrained catalog', () => {
  const edcResult = selectProfileDiscovery('edc-las-vegas-2026')
  const lostLandsResult = selectProfileDiscovery('lost-lands-2026')

  assert.equal(edcResult?.festivalId, 'edc-las-vegas-2026')
  assert.equal(lostLandsResult?.festivalId, 'lost-lands-2026')
})
