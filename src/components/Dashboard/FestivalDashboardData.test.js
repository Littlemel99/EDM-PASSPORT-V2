import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { getFestivalCollections } from '../../collections/CollectionEngine.js'
import {
  getDashboardCollectionsSummary,
  getExplorerRank,
  getJourneyDay,
} from './FestivalDashboardData.js'

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
})

test('Dashboard is limited to Mission Control cards', () => {
  const source = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )
  for (const label of [
    'PROGRESS',
    'CREW',
    'PASSPORT',
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
