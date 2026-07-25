import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const lifecycleSource = readFileSync(
  new URL('./FestivalLifecycleDashboard.jsx', import.meta.url),
  'utf8'
)
const liveSource = readFileSync(
  new URL('./FestivalDashboard.jsx', import.meta.url),
  'utf8'
)
const appSource = readFileSync(
  new URL('../../App.jsx', import.meta.url),
  'utf8'
)

test('live Dashboard retains Radar and Daily Mission', () => {
  assert.match(liveSource, /<DiscoveryRadar/)
  assert.match(liveSource, /<FestivalMissionCard/)
  assert.match(appSource, /activeFestivalLifecycle === 'live'/)
})

test('upcoming Dashboard has no live Radar or Daily Mission controls', () => {
  assert.match(lifecycleSource, /This festival has not started yet\./)
  assert.doesNotMatch(lifecycleSource, /DiscoveryRadar|FestivalMissionCard/)
  assert.match(lifecycleSource, /Configured Discoveries/)
})

test('completed Dashboard renders persisted recap metrics', () => {
  for (const label of [
    'FESTIVAL COMPLETE',
    'Discoveries',
    'Collections',
    'Achievements',
    'Explorer Rank',
    'XP',
    'Memories',
  ]) {
    assert.match(lifecycleSource, new RegExp(label))
  }
})

test('completed recap actions open Passport, Memories, and Directory', () => {
  assert.match(lifecycleSource, /VIEW PASSPORT/)
  assert.match(lifecycleSource, /VIEW MEMORIES/)
  assert.match(lifecycleSource, /RETURN TO FESTIVALS/)
  assert.match(lifecycleSource, /onOpenPassport/)
  assert.match(lifecycleSource, /onOpenMemories/)
  assert.match(lifecycleSource, /onReturnToFestivals/)
})

test('App renders exactly one lifecycle Dashboard for the selected edition', () => {
  assert.match(appSource, /topLevelDestination === 'dashboard'/)
  assert.match(appSource, /selectedFestivalId/)
  assert.match(appSource, /<FestivalLifecycleDashboard/)
  assert.match(appSource, /<FestivalDashboard/)
})
