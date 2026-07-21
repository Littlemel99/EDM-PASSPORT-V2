import test from 'node:test'
import assert from 'node:assert/strict'

import {
  LEGACY_EDC_FESTIVAL_ID,
  createFestivalStorageKey,
  createStampPersistenceRecord,
  getDefaultCollectedIds,
  resolveFestivalId,
  selectFestivalStampIds,
} from './festivalPersistence.js'

const LOST_LANDS_ID = 'lost-lands-2026'

test('EDC persistence records include the EDC festival ID', () => {
  const record = createStampPersistenceRecord({
    userId: 'user-1',
    stampId: 'world-party-parade',
    festivalId: LEGACY_EDC_FESTIVAL_ID,
    claimMethod: 'admin-test',
  })

  assert.equal(record.festival_id, LEGACY_EDC_FESTIVAL_ID)
  assert.equal(record.claim_method, 'admin-test')
})

test('Lost Lands persistence records include the Lost Lands festival ID', () => {
  const record = createStampPersistenceRecord({
    userId: 'user-1',
    stampId: 'lost-lands-crater',
    festivalId: LOST_LANDS_ID,
    claimMethod: 'admin-test',
  })

  assert.equal(record.festival_id, LOST_LANDS_ID)
})

test('switching festivals selects only records owned by that festival', () => {
  const records = [
    {
      festival_id: LEGACY_EDC_FESTIVAL_ID,
      stamp_id: 'edc-discovery',
    },
    {
      festival_id: LOST_LANDS_ID,
      stamp_id: 'lost-lands-crater',
    },
  ]

  assert.deepEqual(
    selectFestivalStampIds(records, LEGACY_EDC_FESTIVAL_ID),
    ['world-party-parade', 'edc-discovery']
  )
  assert.deepEqual(selectFestivalStampIds(records, LOST_LANDS_ID), [
    'lost-lands-crater',
  ])
})

test('festival storage keys and collections are isolated', () => {
  assert.notEqual(
    createFestivalStorageKey('mission', LEGACY_EDC_FESTIVAL_ID),
    createFestivalStorageKey('mission', LOST_LANDS_ID)
  )
  assert.deepEqual(
    selectFestivalStampIds(
      [
        {
          festival_id: LEGACY_EDC_FESTIVAL_ID,
          stamp_id: 'edc-only',
        },
      ],
      LOST_LANDS_ID
    ),
    []
  )
})

test('missing legacy festival IDs remain backward compatible with EDC', () => {
  assert.equal(resolveFestivalId(), LEGACY_EDC_FESTIVAL_ID)
  assert.deepEqual(getDefaultCollectedIds(), ['world-party-parade'])
  assert.deepEqual(
    selectFestivalStampIds([{ stamp_id: 'legacy-stamp' }]),
    ['world-party-parade', 'legacy-stamp']
  )
})
