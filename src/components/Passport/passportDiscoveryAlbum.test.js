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
