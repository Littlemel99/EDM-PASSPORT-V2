import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { diagnoseFestivalDiscoverySelection } from '../adventure/DiscoverySelectors.js'
import { getFestivalDiscoveries } from './festivalDiscoveries.js'

test('Tomorrowland has no borrowed EDC discoveries', () => {
  const discoveries = getFestivalDiscoveries('tomorrowland-2026')

  assert.deepEqual(discoveries, [])
  assert.equal(
    discoveries.some(
      (discovery) =>
        discovery.name === 'World Party Parade' ||
        discovery.location === 'Las Vegas Strip'
    ),
    false
  )
})

test('EDC retains only its own discovery catalog', () => {
  const discoveries = getFestivalDiscoveries('edc-las-vegas-2026')

  assert.equal(
    discoveries.some(
      (discovery) => discovery.name === 'World Party Parade'
    ),
    true
  )
  assert.equal(
    discoveries.every(
      (discovery) =>
        discovery.festivalId === 'edc-las-vegas-2026'
    ),
    true
  )
})

test('empty Tomorrowland catalog resolves an honest Radar state', () => {
  const diagnostics = diagnoseFestivalDiscoverySelection({
    discoveries: getFestivalDiscoveries('tomorrowland-2026'),
    collectedIds: [],
    festivalId: 'tomorrowland-2026',
    festivalDiscoveryIds: [],
  })

  assert.equal(diagnostics.selectedTarget, null)
  assert.equal(
    diagnostics.emptyReason,
    'NO DISCOVERIES AVAILABLE YET'
  )
})

test('App requests the master catalog by active edition ID', () => {
  const source = readFileSync(
    new URL('../App.jsx', import.meta.url),
    'utf8'
  )

  assert.match(
    source,
    /getFestivalDiscoveries\(\s*resolvedFestivalId\s*\)/
  )
  assert.doesNotMatch(
    source,
    /configuredIds\.length\s*\?[\s\S]*:\s*masterDiscoveries[\s\S]*resolvedFestivalId\s*=\s*selectedFestivalId\s*\|\|\s*'edc-las-vegas-2026'/
  )
})
