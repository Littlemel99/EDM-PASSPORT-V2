import assert from 'node:assert/strict'
import test from 'node:test'
import { getFestivalDiscoveries } from './festivalDiscoveries.js'
import { lostLands2026 } from './lostLands2026.js'
import { lostLands2026Discoveries } from './lostLands2026Discoveries.js'

const EXPECTED_IDS = [
  'lost-lands-prehistoric-stage',
  'lost-lands-crater',
  'lost-lands-village-marketplace',
  'lost-lands-discovery-center',
  'lost-lands-builders-installation',
  'lost-lands-dinosaur-encounter',
  'lost-lands-thursday-pre-party',
  'lost-lands-sacred-code',
  'lost-lands-camping-arrival',
  'lost-lands-prehistoric-explorer',
]

test('Lost Lands profile contains the expected discovery IDs', () => {
  assert.deepEqual(lostLands2026.discoveryIds, EXPECTED_IDS)
})

test('Lost Lands discovery IDs are globally unique', () => {
  const masterIds = getFestivalDiscoveries().map((discovery) => discovery.id)

  assert.equal(new Set(masterIds).size, masterIds.length)
})

test('every Lost Lands discovery belongs to Lost Lands 2026', () => {
  assert.ok(
    lostLands2026Discoveries.every(
      (discovery) => discovery.festivalId === 'lost-lands-2026'
    )
  )
})

test('unsupported media remains null', () => {
  assert.equal(lostLands2026.logo, null)
  assert.equal(lostLands2026.heroImage, null)
  assert.equal(lostLands2026.mapImage, null)
  assert.ok(
    lostLands2026Discoveries.every(
      (discovery) => discovery.image === null
    )
  )
})

test('discoveries contain no GPS coordinates or artist data', () => {
  lostLands2026Discoveries.forEach((discovery) => {
    assert.equal('latitude' in discovery, false)
    assert.equal('longitude' in discovery, false)
    assert.equal('artists' in discovery, false)
  })
})

test('Prehistoric Explorer is derived and not normally claimable', () => {
  const achievement = lostLands2026Discoveries.find(
    (discovery) => discovery.id === 'lost-lands-prehistoric-explorer'
  )

  assert.equal(achievement?.category, 'achievement')
  assert.equal(achievement?.sourceType, 'derived-achievement')
  assert.equal(achievement?.claimable, false)
  assert.deepEqual(achievement?.claimMethods, [])
})

test('master catalog contains EDC and Lost Lands discoveries once', () => {
  const master = getFestivalDiscoveries()

  assert.equal(
    master.filter((discovery) => discovery.id === 'kinetic-field').length,
    1
  )
  assert.equal(
    master.filter(
      (discovery) => discovery.id === 'lost-lands-prehistoric-stage'
    ).length,
    1
  )
})
