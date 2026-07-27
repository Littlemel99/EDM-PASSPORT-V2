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
  assert.match(liveSource, /MISSION CONTROL/)
  assert.match(liveSource, /YOU’RE LIVE AT/)
  assert.match(liveSource, /<DiscoveryRadar/)
  assert.match(liveSource, /<FestivalMissionCard/)
  assert.match(appSource, /activeFestivalLifecycle === 'live'/)
})

test('upcoming Dashboard has no live Radar or Daily Mission controls', () => {
  assert.match(lifecycleSource, /YOUR JOURNEY IS READY/)
  assert.match(lifecycleSource, /This festival begins in/)
  assert.doesNotMatch(lifecycleSource, /DiscoveryRadar|FestivalMissionCard/)
  assert.match(lifecycleSource, /Discoveries Available/)
  assert.match(lifecycleSource, /Collections Available/)
})

test('completed Dashboard renders persisted recap metrics', () => {
  for (const label of [
    'JOURNEY COMPLETE',
    'Discoveries Found',
    'Collections Completed',
    'Achievements Earned',
    'Explorer Rank',
    'XP',
    'Memories Saved',
  ]) {
    assert.match(lifecycleSource, new RegExp(label))
  }
})

test('empty festival renders an honest guide state without recap actions', () => {
  assert.match(lifecycleSource, /FESTIVAL GUIDE COMING SOON/)
  assert.match(
    lifecycleSource,
    /No discoveries or collections are available for this festival yet/
  )
  assert.match(lifecycleSource, /CONTINUE TO FESTIVALS/)
  assert.doesNotMatch(lifecycleSource, /VIEW RECAP/)
  assert.match(lifecycleSource, /resolvedContentState\.isEmpty/)
})

test('App guards Journey Complete with actual attendee completion', () => {
  assert.match(appSource, /attendeeContentState\.canShowRecap/)
  assert.match(
    appSource,
    /attendeeContentState\.hasAnyPublishedContent/
  )
  assert.match(appSource, /resolveAttendeeContentState/)
})

test('attendee lifecycle does not consume Backstage local drafts', () => {
  assert.doesNotMatch(lifecycleSource, /backstageDraft|local draft/i)
  assert.doesNotMatch(liveSource, /backstageDraft|local draft/i)
})

test('unavailable Dashboard presents reliable details without failure language', () => {
  assert.match(lifecycleSource, /FESTIVAL DETAILS COMING SOON/)
  assert.doesNotMatch(
    lifecycleSource,
    /Live festival activity is unavailable/
  )
  assert.match(lifecycleSource, /VIEW PASSPORT/)
  assert.match(lifecycleSource, /CHANGE FESTIVAL/)
})

test('attendee Dashboard contains no developer-facing configuration language', () => {
  assert.doesNotMatch(lifecycleSource, /FESTIVAL PREVIEW/)
  assert.doesNotMatch(lifecycleSource, /Configured Discoveries/)
  assert.doesNotMatch(lifecycleSource, /Configured Collections/)
  assert.match(lifecycleSource, /pageName="MISSION CONTROL"/)
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

test('live fallback editions do not require a structured Festival Profile', () => {
  assert.match(
    appSource,
    /activeFestivalLifecycle === 'live' &&\s+attendeeContentState\.hasAnyPublishedContent && \(/
  )
  assert.doesNotMatch(
    appSource,
    /activeFestivalLifecycle === 'live' &&\s+activeFestivalProfile/
  )
  assert.match(
    appSource,
    /activeFestivalLifecycle !== 'live' \|\|\s+!attendeeContentState\.hasAnyPublishedContent/
  )
})
