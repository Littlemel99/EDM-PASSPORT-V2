import test from 'node:test'
import assert from 'node:assert/strict'

import { getFestivalDiscoveries } from '../festivals/festivalDiscoveries.js'
import { getDashboardCollectionsSummary } from '../components/Dashboard/FestivalDashboardData.js'
import {
  calculateCollectionProgress,
  calculateFestivalCollectionsProgress,
  getCollectionById,
  getCollectionDiscoveryRecords,
  getCompletedCollections,
  getFestivalCollections,
  getNextCollectionTarget,
} from './index.js'

const FESTIVAL_ID = 'lost-lands-2026'

test('Lost Lands returns six ordered collections', () => {
  const collections = getFestivalCollections(FESTIVAL_ID)
  assert.equal(collections.length, 6)
  assert.deepEqual(
    collections.map((collection) => collection.name),
    ['Stages', 'Exploration', 'Community', 'Camping', 'Art', 'Event Moments']
  )
})

test('EDC returns no Lost Lands collections', () => {
  assert.deepEqual(getFestivalCollections('edc-las-vegas-2026'), [])
})

test('duplicate discovery IDs do not inflate collection progress', () => {
  const collection = {
    id: 'duplicate-test',
    festivalId: FESTIVAL_ID,
    discoveryIds: [
      'lost-lands-crater',
      'lost-lands-crater',
      'lost-lands-prehistoric-stage',
    ],
  }
  const progress = calculateCollectionProgress(collection, [
    'lost-lands-crater',
  ])

  assert.equal(progress.collectedCount, 1)
  assert.equal(progress.totalCount, 2)
  assert.equal(progress.percent, 50)
})

test('unknown discovery IDs are ignored safely', () => {
  const collection = {
    id: 'unknown-test',
    festivalId: FESTIVAL_ID,
    discoveryIds: ['unknown-discovery', 'lost-lands-crater'],
  }

  assert.equal(calculateCollectionProgress(collection, []).totalCount, 1)
})

test('achievement-only discoveries are excluded', () => {
  const collection = {
    id: 'achievement-test',
    festivalId: FESTIVAL_ID,
    discoveryIds: [
      'lost-lands-prehistoric-explorer',
      'lost-lands-crater',
    ],
  }
  const records = getCollectionDiscoveryRecords(
    collection,
    getFestivalDiscoveries()
  )

  assert.deepEqual(records.map((record) => record.id), [
    'lost-lands-crater',
  ])
})

test('zero collected discoveries gives zero progress', () => {
  const progress = calculateCollectionProgress(
    getCollectionById('lost-lands-stages'),
    []
  )

  assert.equal(progress.collectedCount, 0)
  assert.equal(progress.percent, 0)
  assert.equal(progress.complete, false)
})

test('partial collection progress is deterministic', () => {
  const progress = calculateCollectionProgress(
    getCollectionById('lost-lands-stages'),
    ['lost-lands-crater']
  )

  assert.deepEqual(progress, {
    collectionId: 'lost-lands-stages',
    collectedCount: 1,
    totalCount: 2,
    percent: 50,
    complete: false,
  })
})

test('full collection reports complete', () => {
  const progress = calculateCollectionProgress(
    getCollectionById('lost-lands-stages'),
    ['lost-lands-crater', 'lost-lands-prehistoric-stage']
  )

  assert.equal(progress.percent, 100)
  assert.equal(progress.complete, true)
})

test('empty collection never reports complete', () => {
  const progress = calculateCollectionProgress(
    { id: 'empty', festivalId: FESTIVAL_ID, discoveryIds: [] },
    []
  )

  assert.equal(progress.percent, 0)
  assert.equal(progress.complete, false)
})

test('completed collection count is correct', () => {
  const collections = getFestivalCollections(FESTIVAL_ID)
  const collectedIds = [
    'lost-lands-prehistoric-stage',
    'lost-lands-crater',
    'lost-lands-thursday-pre-party',
  ]

  assert.equal(getCompletedCollections(collections, collectedIds).length, 2)
  assert.equal(
    calculateFestivalCollectionsProgress(collections, collectedIds)
      .completedCount,
    2
  )
})

test('next collection target skips collected discoveries', () => {
  const target = getNextCollectionTarget(
    getCollectionById('lost-lands-stages'),
    getFestivalDiscoveries(),
    ['lost-lands-prehistoric-stage']
  )

  assert.equal(target.id, 'lost-lands-crater')
})

test('festival switching isolates collection progress', () => {
  const lostLands = calculateFestivalCollectionsProgress(
    getFestivalCollections(FESTIVAL_ID),
    ['lost-lands-thursday-pre-party']
  )
  const edc = calculateFestivalCollectionsProgress(
    getFestivalCollections('edc-las-vegas-2026'),
    ['lost-lands-thursday-pre-party']
  )

  assert.equal(lostLands.completedCount, 1)
  assert.equal(edc.completedCount, 0)
  assert.equal(edc.totalCollections, 0)
})

test('dashboard collection summary uses real collection engine output', () => {
  const summary = getDashboardCollectionsSummary(
    getFestivalCollections(FESTIVAL_ID),
    ['lost-lands-prehistoric-stage', 'lost-lands-crater']
  )

  assert.deepEqual(summary, { completed: 1, total: 6 })
})

test('collection selectors return defensive copies', () => {
  const collections = getFestivalCollections(FESTIVAL_ID)
  const collection = getCollectionById('lost-lands-stages')
  collections[0].discoveryIds.length = 0
  collection.name = 'Changed'

  assert.equal(getFestivalCollections(FESTIVAL_ID)[0].discoveryIds.length, 2)
  assert.equal(getCollectionById('lost-lands-stages').name, 'Stages')
})
