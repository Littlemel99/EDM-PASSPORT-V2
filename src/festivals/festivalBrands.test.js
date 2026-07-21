import test from 'node:test'
import assert from 'node:assert/strict'

import { selectNextFestivalDiscovery } from '../adventure/DiscoverySelectors.js'
import { createStampPersistenceRecord } from '../services/festivalPersistence.js'
import {
  getCurrentFestivalEdition,
  getFestivalBrand,
  getFestivalBrandForEdition,
  getFestivalBrands,
  getFestivalDiscoveries,
  getFestivalEdition,
  getFestivalEditionHistory,
  getFestivalEditionsByBrand,
  getFestivalEditionTheme,
  groupFestivalEditionsByBrand,
  mergeFestivalProfile,
} from './index.js'

const THEME_KEYS = [
  'artworkDirection',
  'description',
  'effects',
  'name',
  'palette',
  'tagline',
  'typographyDirection',
]

test('EDC Las Vegas brand loads and references its 2026 edition', () => {
  const brand = getFestivalBrand('edc-las-vegas')

  assert.equal(brand.name, 'EDC Las Vegas')
  assert.deepEqual(brand.editions, ['edc-las-vegas-2026'])
})

test('Lost Lands brand loads and references its 2026 edition', () => {
  const brand = getFestivalBrand('lost-lands')

  assert.equal(brand.name, 'Lost Lands')
  assert.deepEqual(brand.editions, ['lost-lands-2026'])
})

test('unknown brand returns null', () => {
  assert.equal(getFestivalBrand('unknown-brand'), null)
})

test('brand results are defensive copies', () => {
  const brand = getFestivalBrand('lost-lands')
  const brands = getFestivalBrands()
  brand.editions.length = 0
  brands[0].name = 'Changed'

  assert.deepEqual(getFestivalBrand('lost-lands').editions, [
    'lost-lands-2026',
  ])
  assert.equal(getFestivalBrand('edc-las-vegas').name, 'EDC Las Vegas')
})

test('edition IDs are unique across brands', () => {
  const editionIds = getFestivalBrands().flatMap((brand) => brand.editions)
  assert.equal(new Set(editionIds).size, editionIds.length)
})

test('EDC and Lost Lands editions retain IDs, years, and brand ownership', () => {
  const edc = getFestivalEdition('edc-las-vegas-2026')
  const lostLands = getFestivalEdition('lost-lands-2026')

  assert.equal(edc.id, 'edc-las-vegas-2026')
  assert.equal(edc.festivalBrandId, 'edc-las-vegas')
  assert.equal(edc.year, 2026)
  assert.equal(lostLands.id, 'lost-lands-2026')
  assert.equal(lostLands.festivalBrandId, 'lost-lands')
  assert.equal(lostLands.year, 2026)
})

test('edition themes always use the normalized shape without invented names', () => {
  const edcTheme = getFestivalEditionTheme('edc-las-vegas-2026')
  const lostLandsTheme = getFestivalEditionTheme('lost-lands-2026')

  assert.deepEqual(Object.keys(edcTheme).sort(), THEME_KEYS)
  assert.deepEqual(Object.keys(lostLandsTheme).sort(), THEME_KEYS)
  assert.equal(edcTheme.name, null)
  assert.equal(lostLandsTheme.name, null)
  assert.deepEqual(lostLandsTheme.palette, [])
  assert.deepEqual(lostLandsTheme.effects, [])
})

test('unknown edition returns null and edition results are defensive copies', () => {
  assert.equal(getFestivalEdition('unknown-edition'), null)
  const edition = getFestivalEdition('lost-lands-2026')
  edition.theme.palette.push('#fff')
  edition.discoveryIds.length = 0

  assert.deepEqual(
    getFestivalEdition('lost-lands-2026').theme.palette,
    []
  )
  assert.ok(
    getFestivalEdition('lost-lands-2026').discoveryIds.length > 0
  )
})

test('brand and edition relationship selectors return only related records', () => {
  assert.equal(
    getFestivalBrandForEdition('lost-lands-2026').id,
    'lost-lands'
  )
  assert.deepEqual(
    getFestivalEditionsByBrand('edc-las-vegas').map((item) => item.id),
    ['edc-las-vegas-2026']
  )
  assert.equal(
    getCurrentFestivalEdition('lost-lands', '2026-09-19').id,
    'lost-lands-2026'
  )
})

test('edition grouping and history keep brands separate', () => {
  const editions = [
    getFestivalEdition('edc-las-vegas-2026'),
    getFestivalEdition('lost-lands-2026'),
  ]
  const grouped = groupFestivalEditionsByBrand(editions)

  assert.deepEqual(
    grouped['edc-las-vegas'].map((item) => item.id),
    ['edc-las-vegas-2026']
  )
  assert.deepEqual(
    grouped['lost-lands'].map((item) => item.id),
    ['lost-lands-2026']
  )
  assert.deepEqual(
    getFestivalEditionHistory('lost-lands').map((item) => item.id),
    ['lost-lands-2026']
  )
})

test('persistence continues to store edition IDs, never brand IDs', () => {
  const record = createStampPersistenceRecord({
    userId: 'user-1',
    stampId: 'lost-lands-crater',
    festivalId: 'lost-lands-2026',
    claimMethod: 'admin-test',
  })

  assert.equal(record.festival_id, 'lost-lands-2026')
  assert.notEqual(record.festival_id, 'lost-lands')
})

test('database edition rows cannot replace brand identity or edition content', () => {
  const edition = getFestivalEdition('lost-lands-2026')
  const merged = mergeFestivalProfile(edition, {
    id: edition.id,
    name: 'Database Rename',
    status: 'active',
    start_date: '2026-09-19',
    location: 'Operational Entrance',
    theme: { name: 'Invented Theme' },
    discoveryIds: ['database-discovery'],
  })

  assert.equal(merged.name, 'Lost Lands 2026')
  assert.equal(merged.brandName, 'Lost Lands')
  assert.equal(merged.status, 'active')
  assert.equal(merged.startDate, '2026-09-19')
  assert.equal(merged.location, 'Operational Entrance')
  assert.equal(merged.theme.name, null)
  assert.deepEqual(merged.discoveryIds, edition.discoveryIds)
})

test('discovery selection remains constrained by edition ID', () => {
  const discoveries = getFestivalDiscoveries()
  const lostLands = getFestivalEdition('lost-lands-2026')
  const edc = getFestivalEdition('edc-las-vegas-2026')
  const lostLandsTarget = selectNextFestivalDiscovery({
    discoveries,
    collectedIds: [],
    festivalId: lostLands.id,
    festivalDiscoveryIds: lostLands.discoveryIds,
  })
  const edcTarget = selectNextFestivalDiscovery({
    discoveries,
    collectedIds: [],
    festivalId: edc.id,
    festivalDiscoveryIds: edc.discoveryIds,
  })

  assert.equal(lostLandsTarget.festivalId, 'lost-lands-2026')
  assert.equal(edcTarget.festivalId, 'edc-las-vegas-2026')
})
