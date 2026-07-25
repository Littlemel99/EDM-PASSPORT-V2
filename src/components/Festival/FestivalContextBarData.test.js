import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  getFestivalBrandForEdition,
  getFestivalEditionDisplayMetadata,
} from '../../festivals/index.js'
import { edcLasVegas2026 } from '../../festivals/edcLasVegas2026.js'
import { lostLands2026 } from '../../festivals/lostLands2026.js'
import { getVisiblePassportSections } from '../Passport/passportSections.js'
import {
  getFestivalContextBarData,
  isDiscoveryOwnedByFestival,
} from './FestivalContextBarData.js'

const source = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

function contextFor(edition) {
  const brand = getFestivalBrandForEdition(edition.id)
  const display = getFestivalEditionDisplayMetadata({
    edition,
    profile: edition,
    brand,
  })
  return getFestivalContextBarData({
    activeFestival: edition,
    activeFestivalProfile: edition,
    activeFestivalBrand: brand,
    activeFestivalDisplay: display,
  })
}

test('Lost Lands context displays Lost Lands and 2026', () => {
  const context = contextFor(lostLands2026)
  assert.equal(context.festivalName, 'Lost Lands')
  assert.equal(context.year, 2026)
  assert.equal(context.prehistoric, true)
})

test('EDC context displays EDC and its edition year', () => {
  const context = contextFor(edcLasVegas2026)
  assert.equal(context.festivalName, 'EDC Las Vegas')
  assert.equal(context.year, 2026)
  assert.equal(context.prehistoric, false)
})

test('unknown festival uses a neutral fallback', () => {
  const context = getFestivalContextBarData({
    activeFestival: { id: 'unknown-2030', name: 'Future Festival', year: 2030 },
  })
  assert.equal(context.festivalName, 'Future Festival')
  assert.equal(context.year, 2030)
  assert.equal(context.prehistoric, false)
})

test('festival name and year are always textual', () => {
  const component = source('./FestivalContextBar.jsx')
  assert.match(component, /context\.festivalName/)
  assert.match(component, /context\.year/)
})

test('location is optional and safe when missing', () => {
  const context = getFestivalContextBarData({
    activeFestival: { id: 'unknown' },
  })
  assert.equal(context.location, null)
  assert.equal(context.venueLocation, null)
})

test('Dashboard page identity precedes mission status, Radar, and mission cards', () => {
  const dashboard = source('../Dashboard/FestivalDashboard.jsx')
  assert.ok(dashboard.indexOf('<PageIdentity') < dashboard.indexOf('aria-label="Journey status"'))
  assert.ok(dashboard.indexOf('aria-label="Journey status"') < dashboard.indexOf('<DiscoveryRadar'))
  assert.ok(dashboard.indexOf('<DiscoveryRadar') < dashboard.indexOf('<FestivalMissionCard'))
})

test('Passport shell has one persistent compact context bar', () => {
  const app = source('../../App.jsx')
  const shellStart = app.indexOf("passportPresentationMode === 'dashboard'")
  const shellContext = app.indexOf('<FestivalContextBar', shellStart)
  const navigation = app.indexOf('<PassportNavigation', shellStart)
  assert.ok(shellContext > shellStart)
  assert.ok(shellContext < navigation)
})

test('Collections overview receives the active festival shell context', () => {
  const app = source('../../App.jsx')
  assert.ok(app.indexOf('<FestivalContextBar') < app.indexOf('<FestivalCollections'))
})

test('Collection detail preserves the parent Collections context', () => {
  const collections = source('../Collections/FestivalCollections.jsx')
  assert.match(collections, /<CollectionDetail/)
  assert.doesNotMatch(collections, /FestivalContextBar/)
})

test('claim page displays the owning active festival shell context', () => {
  const app = source('../../App.jsx')
  assert.ok(app.indexOf('<FestivalContextBar') < app.indexOf('pageIndex === 2'))
})

test('Reward Celebration displays the discovery festival edition', () => {
  const reward = source('../Dashboard/RewardCelebration.jsx')
  assert.match(reward, /<PageIdentity/)
  const app = source('../../App.jsx')
  assert.match(app, /rewardCelebrations\[0\]\?\.discovery\?\.festivalId/)
})

test('profile editor displays festival context without changing it', () => {
  const editor = source('../Passport/PassportProfileEditor.jsx')
  assert.match(editor, /<FestivalContextBar/)
  assert.doesNotMatch(editor, /setSelectedFestival|selectFestival/)
})

test('switching Lost Lands to EDC updates context immediately', () => {
  assert.equal(contextFor(lostLands2026).festivalName, 'Lost Lands')
  assert.equal(contextFor(edcLasVegas2026).festivalName, 'EDC Las Vegas')
})

test('no Lost Lands wording remains in EDC context', () => {
  const context = contextFor(edcLasVegas2026)
  assert.equal(JSON.stringify(context).includes('Lost Lands'), false)
  assert.equal(JSON.stringify(context).includes('PREHISTORIC'), false)
})

test('stale discovery from another edition cannot remain interactive', () => {
  assert.equal(
    isDiscoveryOwnedByFestival(
      { festivalId: 'lost-lands-2026' },
      'edc-las-vegas-2026'
    ),
    false
  )
  const app = source('../../App.jsx')
  assert.match(app, /hiddenOperationalPageOpen/)
  assert.match(app, /setSelectedStamp\(null\)/)
})

test('public passport behavior remains separate from private context bars', () => {
  const app = source('../../App.jsx')
  const publicReturn = app.indexOf('<PublicProfile')
  const privateMain = app.indexOf("passportPresentationMode === 'editor'")
  assert.ok(publicReturn > 0)
  assert.ok(publicReturn < privateMain)
})

test('context data is frozen and inputs are not mutated', () => {
  const edition = structuredClone(lostLands2026)
  const before = structuredClone(edition)
  const context = contextFor(edition)
  assert.equal(Object.isFrozen(context), true)
  assert.deepEqual(edition, before)
})

test('normal and Admin passport section counts remain unchanged', () => {
  assert.equal(getVisiblePassportSections(false).length, 7)
  assert.equal(getVisiblePassportSections(true).length, 8)
})

test('account isolation remains wired into the active festival shell', () => {
  const app = source('../../App.jsx')
  assert.match(app, /accountRequestGuardRef/)
  assert.match(app, /activeFestivalDisplay={activeFestivalDisplay}/)
})

test('320px context layout wraps without horizontal overflow', () => {
  const css = source('./festivalContextBar.css')
  assert.match(css, /max-width: 420px/)
  assert.match(css, /min-width: 0/)
  assert.match(css, /overflow: hidden/)
  assert.match(css, /overflow-wrap: anywhere/)
})

test('Journey resolves crew name or Solo Explorer', () => {
  const journey = source('../Passport/PassportJourneyPage.jsx')
  assert.match(journey, /crewName \|\| 'Solo Explorer'/)
})

test('interactive controls expose a global visible focus state', () => {
  const css = source('../../index.css')
  assert.match(css, /button:focus-visible/)
  assert.match(css, /outline: 3px solid/)
})
