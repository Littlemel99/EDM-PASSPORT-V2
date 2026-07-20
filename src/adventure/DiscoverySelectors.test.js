import assert from 'node:assert/strict'
import test from 'node:test'
import { selectNextFestivalDiscovery } from './DiscoverySelectors.js'

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
