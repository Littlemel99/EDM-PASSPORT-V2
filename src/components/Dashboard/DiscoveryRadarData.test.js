import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { getDiscoveryRadarDisplay } from './DiscoveryRadarData.js'

const source = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

test('Radar metadata derives normalized rarity and category', () => {
  const display = getDiscoveryRadarDisplay({
    id: 'sacred-code',
    name: 'Sacred Code',
    rarity: 'uncommon',
    category: 'community',
    location: 'Festival or campground',
  })

  assert.equal(display.title, 'Sacred Code')
  assert.equal(display.location, 'Festival or campground')
  assert.equal(display.metadata, 'Uncommon • Community')
})

test('hidden and secret targets do not leak metadata', () => {
  for (const discovery of [
    {
      id: 'hidden',
      name: 'Hidden Name',
      location: 'Hidden Location',
      rarity: 'hidden',
      category: 'landmark',
    },
    {
      id: 'secret',
      name: 'Secret Name',
      location: 'Secret Location',
      rarity: 'rare',
      visibility: 'secret',
      category: 'event',
    },
  ]) {
    const display = getDiscoveryRadarDisplay(discovery)
    assert.equal(display.restricted, true)
    assert.equal(display.title, 'Mystery Discovery')
    assert.equal(display.location, 'Location restricted')
    assert.equal(display.metadata, 'Details restricted')
    assert.equal(JSON.stringify(display).includes(discovery.name), false)
    assert.equal(
      JSON.stringify(display).includes(discovery.location),
      false
    )
  }
})

test('Lost Lands and EDC discovery records render safely', () => {
  assert.equal(
    getDiscoveryRadarDisplay({
      id: 'lost-lands-crater',
      festivalId: 'lost-lands-2026',
      name: 'The Crater',
      rarity: 'rare',
      category: 'stage',
    }).metadata,
    'Rare • Stage'
  )
  assert.equal(
    getDiscoveryRadarDisplay({
      id: 'edc-stage',
      festivalId: 'edc-las-vegas-2026',
      name: 'Festival Stage',
      rarity: 'common',
      category: 'stage',
    }).metadata,
    'Common • Stage'
  )
})

test('Radar resolver does not mutate discovery input', () => {
  const discovery = {
    id: 'target',
    name: 'Target',
    rarity: 'rare',
    category: 'community',
  }
  const before = structuredClone(discovery)
  const display = getDiscoveryRadarDisplay(discovery)
  assert.deepEqual(discovery, before)
  assert.equal(Object.isFrozen(display), true)
})

test('generic Dashboard subtitle is absent and Radar action remains wired', () => {
  const dashboard = source('./FestivalDashboard.jsx')
  const radar = source('./DiscoveryRadar.jsx')
  assert.doesNotMatch(dashboard, /Continue into the festival\./)
  assert.match(radar, /display\.title/)
  assert.match(radar, /display\.location/)
  assert.match(radar, /display\.metadata/)
  assert.match(radar, />\s*OPEN RADAR\s*</)
  assert.match(radar, /onClick=\{handleOpenRadar\}/)
  assert.match(radar, /display\.restricted/)
})
