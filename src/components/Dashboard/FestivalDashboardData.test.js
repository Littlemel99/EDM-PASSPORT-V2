import test from 'node:test'
import assert from 'node:assert/strict'

import { getFestivalCollections } from '../../collections/CollectionEngine.js'
import {
  getDashboardCollectionsSummary,
  getExplorerRank,
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
