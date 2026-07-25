import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  getFestivalBrandForEdition,
  getFestivalEditionDisplayMetadata,
} from '../../festivals/index.js'
import { edcLasVegas2026 } from '../../festivals/edcLasVegas2026.js'
import { lostLands2026 } from '../../festivals/lostLands2026.js'
import {
  getPageIdentityData,
  getPassportPageIdentityTitle,
} from './PageIdentityData.js'

const source = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

function identityFor(edition, pageName = 'Dashboard') {
  const brand = getFestivalBrandForEdition(edition.id)
  const display = getFestivalEditionDisplayMetadata({
    edition,
    profile: edition,
    brand,
  })
  return getPageIdentityData({
    pageName,
    activeFestival: edition,
    activeFestivalProfile: edition,
    activeFestivalBrand: brand,
    activeFestivalDisplay: display,
  })
}

test('page identity always names the app, page, festival, and edition year', () => {
  const identity = identityFor(lostLands2026)
  assert.equal(identity.appName, 'EDM PASSPORT')
  assert.equal(identity.pageName, 'DASHBOARD')
  assert.equal(identity.festivalName, 'Lost Lands')
  assert.equal(identity.year, 2026)
})

test('Lost Lands location is resolved from existing festival metadata', () => {
  assert.equal(
    identityFor(lostLands2026).location,
    'Legend Valley • Thornville, Ohio'
  )
})

test('festival switching immediately resolves EDC identity without Lost Lands text', () => {
  const identity = identityFor(edcLasVegas2026, 'Discoveries')
  assert.equal(identity.pageName, 'DISCOVERIES')
  assert.equal(identity.festivalName, 'EDC Las Vegas')
  assert.equal(identity.year, 2026)
  assert.equal(JSON.stringify(identity).includes('Lost Lands'), false)
})

test('unknown festival and missing location render safely', () => {
  const identity = getPageIdentityData({
    pageName: 'Festival',
    activeFestival: { id: 'unknown-2030', name: 'Future Festival', year: 2030 },
  })
  assert.equal(identity.festivalName, 'Future Festival')
  assert.equal(identity.year, 2030)
  assert.equal(identity.location, null)
})

test('page identity data is immutable and does not mutate festival inputs', () => {
  const edition = structuredClone(lostLands2026)
  const before = structuredClone(edition)
  const identity = getPageIdentityData({
    pageName: 'Journey',
    activeFestival: edition,
  })
  assert.equal(Object.isFrozen(identity), true)
  assert.deepEqual(edition, before)
})

test('passport section titles follow the approved product labels', () => {
  assert.deepEqual(
    ['cover', 'journey', 'discoveries', 'memories', 'festival', 'export', 'admin']
      .map(getPassportPageIdentityTitle),
    ['PASSPORT', 'JOURNEY', 'DISCOVERIES', 'MEMORIES', 'GUIDE', 'EXPORT', 'ADMIN']
  )
})

test('Page Identity uses a semantic heading and compact responsive layout', () => {
  const component = source('./PageIdentity.jsx')
  const css = source('./pageIdentity.css')
  assert.match(component, /<h1/)
  assert.match(component, /identity\.festivalName/)
  assert.match(component, /identity\.year/)
  assert.match(css, /@media \(max-width: 360px\)/)
  assert.match(css, /overflow: hidden/)
  assert.match(css, /overflow-wrap: anywhere/)
})

test('Dashboard identity precedes Mission Control and Radar', () => {
  const dashboard = source('../Dashboard/FestivalDashboard.jsx')
  assert.ok(dashboard.indexOf('<PageIdentity') < dashboard.indexOf('aria-label="Journey status"'))
  assert.ok(dashboard.indexOf('aria-label="Journey status"') < dashboard.indexOf('<DiscoveryRadar'))
})

test('Passport shell supplies one section identity while Collections owns detail identity', () => {
  const app = source('../../App.jsx')
  const collections = source('../Collections/FestivalCollections.jsx')
  assert.match(app, /getPassportPageIdentityTitle/)
  assert.match(app, /activePassportSection\.id !== 'collections'/)
  assert.match(collections, /pageName="COLLECTIONS"/)
  assert.match(collections, /pageName="COLLECTION"/)
})

test('Reward Celebration uses only the compact Page Identity variant', () => {
  const reward = source('../Dashboard/RewardCelebration.jsx')
  assert.match(reward, /<PageIdentity/)
  assert.match(reward, /variant="reward"/)
  assert.doesNotMatch(reward, /<FestivalContextBar/)
})
