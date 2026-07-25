import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { getFestivalCollections } from '../../collections/index.js'
import { getFestivalBrandForEdition, getFestivalEditionDisplayMetadata } from '../../festivals/index.js'
import { getFestivalDiscoveries } from '../../festivals/festivalDiscoveries.js'
import { edcLasVegas2026 } from '../../festivals/edcLasVegas2026.js'
import { lostLands2026 } from '../../festivals/lostLands2026.js'
import { getPassportEditionTheme, getPassportJourneySummary } from './passportEditionTheme.js'
import { getVisiblePassportSections } from './passportSections.js'

const allDiscoveries = getFestivalDiscoveries()
const lostDiscoveries = allDiscoveries.filter(({ festivalId }) => festivalId === lostLands2026.id)
const lostBrand = getFestivalBrandForEdition(lostLands2026.id)
const lostDisplay = getFestivalEditionDisplayMetadata({ edition: lostLands2026, profile: lostLands2026, brand: lostBrand })
const lostTheme = () => getPassportEditionTheme({ edition: lostLands2026, brand: lostBrand, display: lostDisplay })
const achievement = lostDiscoveries.find(({ id }) => id === 'lost-lands-prehistoric-explorer')
const claimableIds = lostDiscoveries.filter(({ claimable }) => claimable !== false).map(({ id }) => id)

test('Lost Lands resolves the prehistoric passport identity theme', () => {
  const theme = lostTheme()
  assert.equal(theme.editionId, 'lost-lands-2026')
  assert.equal(theme.atmosphere, 'PREHISTORIC ARCHIVE')
  assert.match(theme.surface, /rgba\(210,116,45/)
})

test('unknown edition resolves a safe neutral theme', () => {
  const theme = getPassportEditionTheme({ edition: { id: 'unknown-2030', name: 'Unknown 2030' } })
  assert.equal(theme.atmosphere, 'FESTIVAL ARCHIVE')
  assert.equal(theme.brandName, 'Unknown 2030')
})

test('theme result cannot be mutated accidentally', () => {
  const theme = lostTheme()
  assert.equal(Object.isFrozen(theme), true)
  assert.throws(() => { theme.brandName = 'Changed' }, TypeError)
})

test('Cover resolves festival brand and year from active edition data', () => {
  assert.equal(lostTheme().brandName, 'Lost Lands')
  assert.equal(lostTheme().year, 2026)
})

test('Cover resolves venue, location and dates from metadata', () => {
  const theme = lostTheme()
  assert.equal(theme.venue, 'Legend Valley')
  assert.equal(theme.cityRegion, 'Thornville, Ohio')
  assert.equal(theme.dateLabel, 'September 18–20, 2026')
})

test('Cover identity respects merged operational location overrides', () => {
  const theme = getPassportEditionTheme({
    edition: lostLands2026,
    brand: lostBrand,
    display: { ...lostDisplay, location: 'Updated Venue — Updated City, Ohio' },
  })
  assert.equal(theme.venue, 'Updated Venue')
  assert.equal(theme.cityRegion, 'Updated City, Ohio')
})

test('Cover is view-only and contains no profile form fields', () => {
  const source = readFileSync(new URL('./PassportCoverPage.jsx', import.meta.url), 'utf8')
  assert.equal(/<input|<select|<textarea|<button/.test(source), false)
  assert.match(source, /EDM PASSPORT/)
})

test('Journey uses the existing Explorer Rank calculation', () => {
  const summary = getPassportJourneySummary({ discoveries: lostDiscoveries, collectedIds: claimableIds.slice(0, 3) })
  assert.equal(summary.rank.name, 'Explorer II')
})

test('Journey uses existing discovery progress', () => {
  const summary = getPassportJourneySummary({ discoveries: lostDiscoveries, collectedIds: claimableIds.slice(0, 3) })
  assert.equal(summary.collectedCount, 3)
  assert.equal(summary.totalCount, 9)
  assert.equal(summary.percent, 33)
})

test('Journey uses real completed-collection count', () => {
  const summary = getPassportJourneySummary({ collections: getFestivalCollections(lostLands2026.id), discoveries: lostDiscoveries, collectedIds: ['lost-lands-prehistoric-stage', 'lost-lands-crater'] })
  assert.equal(summary.collectionsCompleted, 1)
  assert.equal(summary.collectionsTotal, 6)
})

test('Journey shows Prehistoric Explorer as achievement-only', () => {
  const summary = getPassportJourneySummary({ discoveries: lostDiscoveries, achievement })
  assert.equal(summary.achievement.id, 'lost-lands-prehistoric-explorer')
  assert.equal(summary.achievement.claimable, false)
})

test('achievement progress uses nine claimable discoveries', () => {
  const summary = getPassportJourneySummary({ discoveries: lostDiscoveries, achievement, achievementProgress: { collectedCount: 4, totalCount: 9 } })
  assert.equal(summary.achievementProgress.totalCount, 9)
  assert.equal(summary.totalCount, 9)
})

test('achievement cannot enter the claim flow', () => {
  const cardSource = readFileSync(new URL('../DiscoveryCards/DiscoveryCard.jsx', import.meta.url), 'utf8')
  assert.equal(achievement.claimable, false)
  assert.match(cardSource, /!view\.achievement/)
})

test('Recent Discovery uses shared compact Discovery Card identity', () => {
  const source = readFileSync(new URL('./PassportJourneyPage.jsx', import.meta.url), 'utf8')
  assert.match(source, /<DiscoveryCard discovery={recentDiscovery} collected variant="compact"/)
})

test('empty recent-discovery state renders safely', () => {
  const source = readFileSync(new URL('./PassportJourneyPage.jsx', import.meta.url), 'utf8')
  assert.match(source, /Your first.*discovery is waiting/)
})

test('current collection goal chooses an incomplete collection', () => {
  const summary = getPassportJourneySummary({ collections: getFestivalCollections(lostLands2026.id), discoveries: lostDiscoveries, collectedIds: [] })
  assert.equal(summary.currentCollection.name, 'Stages')
})

test('completed collections are skipped as the current goal', () => {
  const summary = getPassportJourneySummary({ collections: getFestivalCollections(lostLands2026.id), discoveries: lostDiscoveries, collectedIds: ['lost-lands-prehistoric-stage', 'lost-lands-crater'] })
  assert.equal(summary.currentCollection.name, 'Exploration')
})

test('memory summary uses festival-scoped memories', () => {
  const memories = [{ id: 'old', stamp_id: 'lost-lands-crater', created_at: '2026-01-01' }, { id: 'new', stamp_id: 'lost-lands-prehistoric-stage', created_at: '2026-02-01' }, { id: 'edc', stamp_id: 'basspod', created_at: '2026-03-01' }]
  const summary = getPassportJourneySummary({ discoveries: lostDiscoveries, memories })
  assert.equal(summary.memoryCount, 2)
  assert.equal(summary.recentMemory.id, 'new')
})

test('empty memory state renders safely', () => {
  const summary = getPassportJourneySummary({ discoveries: lostDiscoveries, memories: [] })
  assert.equal(summary.memoryCount, 0)
  assert.equal(summary.recentMemory, null)
})

test('Lost Lands data does not leak into EDC', () => {
  const edcBrand = getFestivalBrandForEdition(edcLasVegas2026.id)
  const edcDisplay = getFestivalEditionDisplayMetadata({ edition: edcLasVegas2026, profile: edcLasVegas2026, brand: edcBrand })
  const theme = getPassportEditionTheme({ edition: edcLasVegas2026, brand: edcBrand, display: edcDisplay })
  const summary = getPassportJourneySummary({ collections: getFestivalCollections(edcLasVegas2026.id), discoveries: allDiscoveries.filter(({ festivalId }) => festivalId === edcLasVegas2026.id) })
  assert.equal(theme.atmosphere, 'FESTIVAL ARCHIVE')
  assert.equal(theme.brandName.includes('Lost Lands'), false)
  assert.equal(summary.currentCollection, null)
  assert.equal(summary.achievement, null)
})

test('Open Passport still targets Journey', async () => {
  const { DASHBOARD_PASSPORT_TARGETS } = await import('./passportSections.js')
  assert.equal(DASHBOARD_PASSPORT_TARGETS.passport, 'journey')
})

test('seven-section navigation remains unchanged', () => assert.deepEqual(getVisiblePassportSections().map(({ id }) => id), ['cover', 'journey', 'discoveries', 'collections', 'memories', 'festival', 'export']))
test('Admin remains eighth only for admins', () => {
  assert.equal(getVisiblePassportSections().length, 7)
  assert.equal(getVisiblePassportSections(true)[7].id, 'admin')
})

test('Journey and theme helpers do not mutate input records', () => {
  const edition = structuredClone(lostLands2026)
  const discoveries = structuredClone(lostDiscoveries)
  const beforeEdition = structuredClone(edition)
  const beforeDiscoveries = structuredClone(discoveries)
  getPassportEditionTheme({ edition, brand: lostBrand, display: lostDisplay })
  getPassportJourneySummary({ discoveries, collectedIds: [] })
  assert.deepEqual(edition, beforeEdition)
  assert.deepEqual(discoveries, beforeDiscoveries)
})

test('reduced-motion behavior remains supported', () => {
  const css = readFileSync(new URL('./passportIdentity.css', import.meta.url), 'utf8')
  assert.match(css, /prefers-reduced-motion:reduce/)
  assert.match(css, /transition:none/)
})
