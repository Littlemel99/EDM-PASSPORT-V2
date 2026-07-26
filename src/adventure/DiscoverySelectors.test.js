import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  diagnoseFestivalDiscoverySelection,
  selectNextFestivalDiscovery,
} from './DiscoverySelectors.js'
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
    festivalId: '',
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

test('empty festival discovery IDs never cross festival catalogs', () => {
  const result = select({
    discoveries: [
      { id: 'gamma', name: 'Gamma', festivalId: 'festival-b' },
      { id: 'delta', name: 'Delta' },
    ],
    festivalDiscoveryIds: [],
  })

  assert.equal(result, null)
})

test('empty festival discovery IDs preserve a matching festival fallback', () => {
  const result = select({
    discoveries: [
      { id: 'gamma', name: 'Gamma', festivalId: 'festival-b' },
      { id: 'delta', name: 'Delta', festivalId: FESTIVAL_ID },
    ],
    festivalDiscoveryIds: [],
  })

  assert.equal(result?.id, 'delta')
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

test('Lost Lands diagnostics separate remaining claimable discoveries from achievement', () => {
  const profile = getFestivalProfile('lost-lands-2026')
  const discoveries = getFestivalDiscoveries().filter(
    (discovery) => discovery.festivalId === 'lost-lands-2026'
  )
  const collectedIds = profile.discoveryIds.slice(0, 7)
  const diagnostics = diagnoseFestivalDiscoverySelection({
    discoveries,
    collectedIds,
    festivalId: 'lost-lands-2026',
    festivalDiscoveryIds: profile.discoveryIds,
    now: NOW,
  })

  assert.deepEqual(
    diagnostics.remainingDiscoveries.map((discovery) => discovery.id),
    [
      'lost-lands-sacred-code',
      'lost-lands-camping-arrival',
      'lost-lands-prehistoric-explorer',
    ]
  )
  assert.deepEqual(
    diagnostics.eligibleDiscoveries.map((discovery) => discovery.id),
    ['lost-lands-sacred-code', 'lost-lands-camping-arrival']
  )
  assert.deepEqual(
    diagnostics.rejectedDiscoveries.filter(
      (discovery) => discovery.reason === 'achievement-only'
    ),
    [{
      id: 'lost-lands-prehistoric-explorer',
      name: 'Prehistoric Explorer',
      reason: 'achievement-only',
    }]
  )
  assert.equal(
    diagnostics.selectedTarget?.id,
    'lost-lands-sacred-code'
  )
})

test('diagnostics explain when all claimable discoveries are collected', () => {
  const profile = getFestivalProfile('lost-lands-2026')
  const discoveries = getFestivalDiscoveries().filter(
    (discovery) => discovery.festivalId === 'lost-lands-2026'
  )
  const claimableIds = discoveries
    .filter((discovery) => discovery.claimable !== false)
    .map((discovery) => discovery.id)
  const diagnostics = diagnoseFestivalDiscoverySelection({
    discoveries,
    collectedIds: claimableIds,
    festivalId: 'lost-lands-2026',
    festivalDiscoveryIds: profile.discoveryIds,
    now: NOW,
  })

  assert.equal(diagnostics.selectedTarget, null)
  assert.equal(
    diagnostics.emptyReason,
    'All claimable discoveries collected'
  )
})

test('Radar loading lifecycle settles even when drop services reject', () => {
  const app = new URL('../App.jsx', import.meta.url)
  const source = readFileSync(app, 'utf8')
  assert.match(source, /Promise\.allSettled/)
  assert.match(source, /setFestivalDiscoveryLoading\(false\)/)
  assert.match(source, /radarSelectionDiagnostics\.selectedTarget/)
})

test('two eligible Lost Lands discoveries always produce a target', () => {
  const profile = getFestivalProfile('lost-lands-2026')
  const discoveries = getFestivalDiscoveries().filter(
    (discovery) => discovery.festivalId === 'lost-lands-2026'
  )
  const eligibleIds = [
    'lost-lands-sacred-code',
    'lost-lands-camping-arrival',
  ]
  const collectedIds = profile.discoveryIds.filter(
    (id) =>
      !eligibleIds.includes(id) &&
      id !== 'lost-lands-prehistoric-explorer'
  )
  const diagnostics = diagnoseFestivalDiscoverySelection({
    discoveries,
    collectedIds,
    festivalId: 'lost-lands-2026',
    festivalDiscoveryIds: profile.discoveryIds,
    now: NOW,
  })

  assert.equal(diagnostics.eligibleDiscoveries.length, 2)
  assert.ok(diagnostics.selectedTarget)
  assert.ok(eligibleIds.includes(diagnostics.selectedTarget.id))
})

test('one eligible EDC discovery always produces a target', () => {
  const profile = getFestivalProfile('edc-las-vegas-2026')
  const discoveries = getFestivalDiscoveries().filter(
    (discovery) => discovery.festivalId === 'edc-las-vegas-2026'
  )
  const eligibleId = profile.discoveryIds.find((id) =>
    discoveries.some(
      (discovery) =>
        discovery.id === id && discovery.claimable !== false
    )
  )
  const collectedIds = profile.discoveryIds.filter(
    (id) => id !== eligibleId
  )
  const diagnostics = diagnoseFestivalDiscoverySelection({
    discoveries,
    collectedIds,
    festivalId: 'edc-las-vegas-2026',
    festivalDiscoveryIds: profile.discoveryIds,
    now: NOW,
  })

  assert.equal(diagnostics.eligibleDiscoveries.length, 1)
  assert.equal(diagnostics.selectedTarget?.id, eligibleId)
})

test('failed live and GPS inputs cannot remove the catalog fallback', () => {
  const profile = getFestivalProfile('lost-lands-2026')
  const discoveries = getFestivalDiscoveries().filter(
    (discovery) => discovery.festivalId === 'lost-lands-2026'
  )
  const options = {
    discoveries,
    collectedIds: [],
    festivalId: 'lost-lands-2026',
    festivalDiscoveryIds: profile.discoveryIds,
    activeDropIds: [],
    activeDropWindows: {},
    gpsDrops: [],
    nearbyGpsDrops: [],
    now: NOW,
  }

  assert.equal(
    selectNextFestivalDiscovery(options)?.id,
    'lost-lands-prehistoric-stage'
  )
  assert.equal(
    selectNextFestivalDiscovery({
      ...options,
      activeDropIds: ['failed-live-drop'],
    })?.id,
    'lost-lands-prehistoric-stage'
  )
  assert.equal(
    selectNextFestivalDiscovery({
      ...options,
      gpsDrops: [{
        stamp_id: 'failed-gps-drop',
        festival_id: 'lost-lands-2026',
      }],
    })?.id,
    'lost-lands-prehistoric-stage'
  )
})

test('catalog target advances after a successful claim', () => {
  const first = selectProfileDiscovery('lost-lands-2026')
  const second = selectProfileDiscovery(
    'lost-lands-2026',
    [first.id]
  )

  assert.equal(first.id, 'lost-lands-prehistoric-stage')
  assert.equal(second.id, 'lost-lands-crater')
})

test('App never overwrites a valid catalog target with loading null', () => {
  const source = readFileSync(
    new URL('../App.jsx', import.meta.url),
    'utf8'
  )
  assert.match(
    source,
    /const nextDiscovery = radarSelectionDiagnostics\.selectedTarget/
  )
  assert.doesNotMatch(
    source,
    /festivalDiscoveryLoading\s*\?\s*null\s*:\s*radarSelectionDiagnostics\.selectedTarget/
  )
  assert.match(source, /refreshFestivalDiscoveryData\(festivalId\)/)
})

test('zero eligible discoveries use claimable-complete messaging', () => {
  const radar = readFileSync(
    new URL('../components/Dashboard/DiscoveryRadar.jsx', import.meta.url),
    'utf8'
  )
  const selector = readFileSync(
    new URL('./DiscoverySelectors.js', import.meta.url),
    'utf8'
  )
  assert.match(radar, /All current discoveries collected/)
  assert.match(selector, /All claimable discoveries collected/)
})

test('switching festival profiles changes the constrained catalog', () => {
  const edcResult = selectProfileDiscovery('edc-las-vegas-2026')
  const lostLandsResult = selectProfileDiscovery('lost-lands-2026')

  assert.equal(edcResult?.festivalId, 'edc-las-vegas-2026')
  assert.equal(lostLandsResult?.festivalId, 'lost-lands-2026')
})
