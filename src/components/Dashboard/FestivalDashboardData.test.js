import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { getFestivalCollections } from '../../collections/CollectionEngine.js'
import {
  getAttendeeJourneyCompletion,
  getDashboardCollectionsSummary,
  getExplorerRank,
  getJourneyDay,
  getMissionControlLocation,
  formatMissionControlTime,
  getFestivalCountdown,
} from './FestivalDashboardData.js'

test('empty attendee content is never complete or 100 percent', () => {
  assert.deepEqual(
    getAttendeeJourneyCompletion({
      lifecycle: 'completed',
      collectedDiscoveries: 0,
      totalDiscoveries: 0,
      completedCollections: 0,
      totalCollections: 0,
    }),
    {
      state: 'empty',
      hasCompletableContent: false,
      complete: false,
      percent: 0,
    }
  )
})

test('attendee completion requires all available content to be complete', () => {
  assert.equal(
    getAttendeeJourneyCompletion({
      lifecycle: 'completed',
      totalDiscoveries: 5,
    }).state,
    'in-progress'
  )
  assert.deepEqual(
    getAttendeeJourneyCompletion({
      lifecycle: 'completed',
      collectedDiscoveries: 5,
      totalDiscoveries: 5,
      completedCollections: 2,
      totalCollections: 2,
    }),
    {
      state: 'completed',
      hasCompletableContent: true,
      complete: true,
      percent: 100,
    }
  )
})

test('explorer rank is calculated only from collected discovery count', () => {
  assert.equal(getExplorerRank(0).name, 'Explorer I')
  assert.equal(getExplorerRank(3).name, 'Explorer II')
  assert.equal(getExplorerRank(6).name, 'Explorer III')
  assert.equal(getExplorerRank(10).name, 'Trailblazer')
  assert.equal(getExplorerRank(15).name, 'Pathfinder')
  assert.equal(getExplorerRank(25).name, 'Veteran')
  assert.equal(getExplorerRank(40).name, 'Legend')
})

test('explorer rank exposes progress toward the next count threshold', () => {
  assert.deepEqual(getExplorerRank(4), {
    name: 'Explorer II',
    nextName: 'Explorer III',
    nextAt: 6,
    progress: 33,
  })
  assert.deepEqual(getExplorerRank(99), {
    name: 'Legend',
    nextName: null,
    nextAt: null,
    progress: 100,
  })
})

test('dashboard collection count is derived from festival collections', () => {
  assert.deepEqual(
    getDashboardCollectionsSummary(
      getFestivalCollections('lost-lands-2026'),
      ['lost-lands-thursday-pre-party']
    ),
    { completed: 1, total: 6 }
  )
  assert.deepEqual(
    getDashboardCollectionsSummary(
      getFestivalCollections('edc-las-vegas-2026'),
      ['lost-lands-thursday-pre-party']
    ),
    { completed: 0, total: 0 }
  )
})

test('Journey Day is derived from the edition start date', () => {
  assert.equal(
    getJourneyDay('2026-09-18', new Date(2026, 8, 18, 12)),
    1
  )
  assert.equal(
    getJourneyDay('2026-09-18', new Date(2026, 8, 20, 12)),
    3
  )
  assert.equal(
    getJourneyDay('2026-09-18', new Date(2026, 8, 17, 12)),
    0
  )
  assert.equal(getJourneyDay(null), null)
  assert.equal(
    getJourneyDay(
      '2026-07-17',
      new Date('2026-07-25T10:00:00Z'),
      'Europe/Brussels'
    ),
    9
  )
})

test('Dashboard is limited to Mission Control cards', () => {
  const source = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )
  for (const label of [
    'PROGRESS',
    'CREW',
    'OPEN PASSPORT',
    'MEMORIES',
    'CHANGE FESTIVAL',
  ]) {
    assert.match(source, new RegExp(label.replace("'", "\\'")))
  }
  assert.match(source, /<FestivalMissionCard/)
  assert.doesNotMatch(source, /RECENT DISCOVERY/)
  assert.doesNotMatch(source, /YOUR JOURNEY/)
  assert.doesNotMatch(source, /JOURNEY PROGRESS/)
})

test('Dashboard welcomes the returning explorer by rave name', () => {
  const source = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )
  assert.match(source, /Welcome back,/)
  assert.match(source, /raveName \|\| 'Explorer'/)
  assert.doesNotMatch(source, /email/i)
})

test('Mission Control location is derived from local discovery and edition data', () => {
  assert.equal(
    getMissionControlLocation({
      discovery: { location: 'The Crater' },
      venue: 'Legend Valley',
    }),
    'The Crater'
  )
  assert.equal(
    getMissionControlLocation({ venue: 'Legend Valley' }),
    'Legend Valley'
  )
  assert.equal(
    getMissionControlLocation({ location: 'Boom, Belgium' }),
    'Boom, Belgium'
  )
  assert.equal(getMissionControlLocation(), 'Festival grounds')
})

test('Mission Control time is local and fails safely', () => {
  assert.equal(
    formatMissionControlTime(
      new Date(2026, 8, 18, 21, 5),
      'en-US'
    ),
    '9:05 PM'
  )
  assert.equal(
    formatMissionControlTime('not-a-date'),
    'Time unavailable'
  )
})

test('upcoming countdown is derived only from valid festival dates', () => {
  assert.equal(
    getFestivalCountdown(
      '2026-09-18',
      new Date(2026, 8, 16, 18)
    ),
    '2 days'
  )
  assert.equal(
    getFestivalCountdown(
      '2026-09-18',
      new Date(2026, 8, 17, 18)
    ),
    '1 day'
  )
  assert.equal(getFestivalCountdown(null), null)
})

test('live progress uses attendee-facing authenticated progress values', () => {
  const source = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )
  assert.match(source, /Discoveries Found/)
  assert.match(
    source,
    /\{resolvedCollectedCount\} \/ \{resolvedTotalCount\}/
  )
  assert.match(source, /Collections Completed/)
  assert.match(
    source,
    /\{resolvedCollectionsCompleted\} \/ \{resolvedCollectionsTotal\}/
  )
  assert.match(source, /contentState\?\.completedDiscoveries/)
})

test('Dashboard exposes the one-thumb primary and secondary action sets', () => {
  const source = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )
  for (const label of [
    'DISCOVER',
    'RADAR',
    'MAP',
    'SCHEDULE',
    'CREW',
    'COLLECTIONS',
    'ACHIEVEMENTS',
  ]) {
    assert.match(source, new RegExp(`label="${label}"`))
  }
  assert.match(source, /OPEN PASSPORT/)
  assert.match(source, />\s*SETTINGS\s*</)
  assert.match(source, /label=\{`MEMORIES ·/)
  assert.match(source, /CHANGE FESTIVAL/)
  assert.doesNotMatch(source, /from ['"].*services\//)
})

test('Tomorrowland live Mission Control uses attendee-facing live language', () => {
  const source = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )
  const radarSource = readFileSync(
    new URL('./DiscoveryRadar.jsx', import.meta.url),
    'utf8'
  )
  assert.match(source, /MISSION CONTROL/)
  assert.match(source, /LIVE NOW/)
  assert.match(source, /label="RADAR"[\s\S]*primary/)
  assert.match(radarSource, /OPEN RADAR/)
  assert.doesNotMatch(source, /Edition pending/)
  assert.doesNotMatch(source, /FESTIVAL DETAILS COMING SOON/)
  assert.doesNotMatch(source, /Configured Discoveries|Configured Collections/)
})

test('Mission Control replaces unavailable Radar and omits discovery missions', () => {
  const source = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )

  assert.match(source, /nextDiscovery \? \(/)
  assert.match(source, /label="VIEW FESTIVAL GUIDE"/)
  assert.match(source, /\{resolvedTotalCount > 0 && \(/)
})
