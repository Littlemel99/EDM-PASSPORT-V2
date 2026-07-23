import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { getFestivalCollections } from '../../collections/index.js'
import { getFestivalDiscoveries } from '../../festivals/festivalDiscoveries.js'
import { getFestivalEditionDisplayMetadata } from '../../festivals/index.js'
import { lostLands2026 } from '../../festivals/lostLands2026.js'
import {
  DASHBOARD_PASSPORT_TARGETS,
  HIDDEN_LEGACY_PAGE_INDICES,
  PASSPORT_SECTION_PAGE_INDEX,
  getAdjacentPassportSection,
  getFestivalScopedMemories,
  getPassportSectionById,
  getVisiblePassportSections,
  isHiddenLegacyPage,
  preserveVisibleSection,
} from './passportSections.js'

test('normal users receive exactly seven visible sections', () => assert.equal(getVisiblePassportSections().length, 7))
test('admin users receive exactly eight visible sections', () => assert.equal(getVisiblePassportSections(true).length, 8))
test('Admin is absent for normal users', () => assert.equal(getPassportSectionById(getVisiblePassportSections(), 'admin'), null))
test('visible section order is stable', () => assert.deepEqual(getVisiblePassportSections().map(({ id }) => id), ['cover', 'journey', 'discoveries', 'collections', 'memories', 'festival', 'export']))
test('Next and Previous follow visible sections and skip hidden pages', () => {
  const sections = getVisiblePassportSections()
  assert.equal(getAdjacentPassportSection(sections, 'journey', 'next').id, 'discoveries')
  assert.equal(getAdjacentPassportSection(sections, 'journey', 'previous').id, 'cover')
  assert.equal(HIDDEN_LEGACY_PAGE_INDICES.includes(getAdjacentPassportSection(sections, 'journey', 'next').pageIndex), false)
})
test('Collections dashboard action opens Collections', () => assert.equal(DASHBOARD_PASSPORT_TARGETS.collections, 'collections'))
test('Recent Memories opens Memories', () => assert.equal(DASHBOARD_PASSPORT_TARGETS.memories, 'memories'))
test('Recent Discovery opens Discoveries', () => assert.equal(DASHBOARD_PASSPORT_TARGETS.recentDiscovery, 'discoveries'))
test('claim flow hidden operational page remains addressable', () => assert.equal(isHiddenLegacyPage(2), true))
test('Radar operational flow remains outside tabs', () => assert.equal(getVisiblePassportSections().some(({ pageIndex }) => pageIndex === 2), false))
test('collection detail remains within Collections section', () => assert.equal(PASSPORT_SECTION_PAGE_INDEX.collections, 13))
test('Prehistoric Explorer remains achievement-only', () => {
  const achievement = getFestivalDiscoveries().find(({ id }) => id === 'lost-lands-prehistoric-explorer')
  assert.equal(achievement.claimable, false)
  assert.equal(achievement.sourceType, 'derived-achievement')
})
test('Lost Lands discoveries remain festival-scoped', () => assert.ok(getFestivalDiscoveries().filter(({ festivalId }) => festivalId === 'lost-lands-2026').every(({ id }) => id.startsWith('lost-lands-'))))
test('EDC receives neither Lost Lands collections nor discoveries', () => {
  assert.equal(getFestivalCollections('edc-las-vegas-2026').length, 0)
  assert.equal(getFestivalDiscoveries().filter(({ festivalId }) => festivalId === 'edc-las-vegas-2026').some(({ id }) => id.startsWith('lost-lands-')), false)
})
test('switching festivals preserves a valid selected visible section', () => assert.equal(preserveVisibleSection(getVisiblePassportSections(), 'memories').id, 'memories'))
test('Memories section filters existing memories through current discoveries', () => {
  const memories = [{ id: 1, stamp_id: 'lost-lands-crater' }, { id: 2, stamp_id: 'basspod' }]
  const discoveries = getFestivalDiscoveries().filter(({ festivalId }) => festivalId === 'lost-lands-2026')
  assert.deepEqual(getFestivalScopedMemories(memories, discoveries).map(({ id }) => id), [1])
})
test('Festival section resolves Lost Lands dates and location', () => {
  const display = getFestivalEditionDisplayMetadata({ edition: lostLands2026, profile: lostLands2026 })
  assert.equal(display.location, 'Legend Valley — Thornville, Ohio')
  assert.equal(display.startDate, '2026-09-18')
})
test('navigation configuration is returned defensively', () => {
  const sections = getVisiblePassportSections()
  sections[0].label = 'Changed'
  sections.push({ id: 'fake' })
  assert.equal(getVisiblePassportSections()[0].label, 'Cover')
  assert.equal(getVisiblePassportSections().length, 7)
})
test('mobile tab labels use semantic buttons', () => {
  const source = readFileSync(new URL('./PassportNavigation.jsx', import.meta.url), 'utf8')
  assert.match(source, /<button/)
  assert.match(source, /aria-current/)
  assert.match(source, /overflowX: 'auto'/)
})
test('hidden legacy pages are absent from tab configuration', () => {
  const visibleIndices = new Set(getVisiblePassportSections(true).map(({ pageIndex }) => pageIndex))
  assert.ok(HIDDEN_LEGACY_PAGE_INDICES.every((pageIndex) => !visibleIndices.has(pageIndex)))
})
