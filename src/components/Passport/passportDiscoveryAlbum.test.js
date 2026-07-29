import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const appSource = readFileSync(
  new URL('../../App.jsx', import.meta.url),
  'utf8'
)

test('empty discovery album renders an honest festival guide state', () => {
  assert.match(
    appSource,
    /!attendeeContentState\.canShowDiscoveryAlbum/
  )
  assert.match(appSource, /Festival Guide Coming Soon/)
  assert.match(appSource, /Discoveries not yet available/)
  assert.match(
    appSource,
    /No published discoveries are available for this festival yet/
  )
})

test('empty discovery progress keeps its real zero denominator', () => {
  assert.match(
    appSource,
    /const collectionTotal = collectionProgress\.total/
  )
  assert.doesNotMatch(
    appSource,
    /const collectionTotal = collectionProgress\.total \|\| 1/
  )
})

test('configured discovery albums retain progress, filters, and cards', () => {
  assert.match(appSource, /Collection Progress/)
  assert.match(appSource, /rarityStats\.map/)
  assert.match(appSource, /collectionFilter/)
  assert.match(appSource, /<DiscoveryCardGrid/)
  assert.match(appSource, /<FestivalAchievementShowcase/)
})

test('discovery album filters normalized Adventure Engine states', () => {
  assert.match(
    appSource,
    /attendeeAdventureState\.discoveries\.filter/
  )
  assert.match(
    appSource,
    /collectionFilter === 'locked'[\s\S]*stamp\.state === 'LOCKED'/
  )
  assert.match(
    appSource,
    /collectionFilter === 'hidden'[\s\S]*stamp\.state === 'HIDDEN'/
  )
  assert.doesNotMatch(
    appSource,
    /collectionFilter === 'locked'\) return !collected/
  )
})

test('filtered discovery views do not expose the independent achievement showcase', () => {
  assert.match(
    appSource,
    /collectionFilter === 'all' && \(\s*<FestivalAchievementShowcase/
  )
})

test('empty locked state is honest when the catalog has no prerequisites', () => {
  assert.match(appSource, /No locked discoveries/)
  assert.match(
    appSource,
    /no published discoveries with unmet prerequisites/
  )
})
