import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getDailyMissionClaimProgress,
  getTodayKey,
  saveStoredMission,
} from '../adventure/DailyMission.js'
import { getCollectionProgress } from '../adventure/ProgressionEngine.js'
import { lostLands2026Discoveries } from '../festivals/lostLands2026Discoveries.js'
import {
  createFestivalClaimState,
  createStampPersistenceRecord,
} from './festivalPersistence.js'

const EDC_ID = 'edc-las-vegas-2026'
const LOST_LANDS_ID = 'lost-lands-2026'
const DISCOVERY_ID = 'lost-lands-prehistoric-stage'

function createMemoryStorage() {
  const values = new Map()

  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
  }
}

test('Lost Lands admin-test claim persistence record owns Lost Lands', () => {
  assert.deepEqual(
    createStampPersistenceRecord({
      userId: 'user-1',
      stampId: DISCOVERY_ID,
      festivalId: LOST_LANDS_ID,
      claimMethod: 'admin-test',
    }),
    {
      user_id: 'user-1',
      stamp_id: DISCOVERY_ID,
      festival_id: LOST_LANDS_ID,
      claim_method: 'admin-test',
    }
  )
})

test('Lost Lands claim immediately increases its collection by one', () => {
  const claim = createFestivalClaimState({
    collectedIds: [],
    discoveryId: DISCOVERY_ID,
    festivalId: LOST_LANDS_ID,
  })
  const before = getCollectionProgress(lostLands2026Discoveries, [])
  const after = getCollectionProgress(
    lostLands2026Discoveries,
    claim.updatedIds
  )

  assert.equal(claim.isNew, true)
  assert.equal(after.collectedCount, before.collectedCount + 1)
  assert.ok(after.percent > before.percent)
})

test('Lost Lands claim increments only the Lost Lands daily mission', () => {
  const storage = createMemoryStorage()
  saveStoredMission(
    {
      date: getTodayKey(),
      baselineCollectedCount: 0,
      target: 3,
      completed: false,
    },
    LOST_LANDS_ID,
    storage
  )

  assert.deepEqual(
    getDailyMissionClaimProgress(0, 1, LOST_LANDS_ID, storage),
    { progress: 1, target: 3, rewardUnlocked: null }
  )
  assert.equal(
    getDailyMissionClaimProgress(0, 1, EDC_ID, storage),
    null
  )
})

test('Lost Lands collection state remains isolated from EDC', () => {
  const lostLandsClaim = createFestivalClaimState({
    collectedIds: [],
    discoveryId: DISCOVERY_ID,
    festivalId: LOST_LANDS_ID,
  })
  const edcClaimState = createFestivalClaimState({
    collectedIds: [],
    festivalId: EDC_ID,
  })

  assert.ok(lostLandsClaim.updatedIds.includes(DISCOVERY_ID))
  assert.ok(!edcClaimState.updatedIds.includes(DISCOVERY_ID))
})

test('duplicate Lost Lands claim changes neither collection nor mission', () => {
  const storage = createMemoryStorage()
  saveStoredMission(
    {
      date: getTodayKey(),
      baselineCollectedCount: 0,
      target: 3,
      completed: false,
    },
    LOST_LANDS_ID,
    storage
  )
  const duplicate = createFestivalClaimState({
    collectedIds: [DISCOVERY_ID],
    discoveryId: DISCOVERY_ID,
    festivalId: LOST_LANDS_ID,
  })
  const before = getCollectionProgress(
    lostLands2026Discoveries,
    duplicate.previousIds
  )
  const after = getCollectionProgress(
    lostLands2026Discoveries,
    duplicate.updatedIds
  )

  assert.equal(duplicate.isNew, false)
  assert.equal(after.collectedCount, before.collectedCount)
  assert.deepEqual(
    getDailyMissionClaimProgress(
      before.collectedCount,
      after.collectedCount,
      LOST_LANDS_ID,
      storage
    ),
    { progress: 1, target: 3, rewardUnlocked: null }
  )
})
