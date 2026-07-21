import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MISSION_STORAGE_KEY,
  loadStoredMission,
  saveStoredMission,
} from './DailyMission.js'

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

test('daily missions persist separately for EDC and Lost Lands', () => {
  const storage = createMemoryStorage()
  const edcMission = saveStoredMission(
    { date: '2026-07-20', target: 3 },
    'edc-las-vegas-2026',
    storage
  )
  const lostLandsMission = saveStoredMission(
    { date: '2026-07-20', target: 2 },
    'lost-lands-2026',
    storage
  )

  assert.equal(edcMission.festivalId, 'edc-las-vegas-2026')
  assert.equal(lostLandsMission.festivalId, 'lost-lands-2026')
  assert.equal(
    loadStoredMission('edc-las-vegas-2026', storage).target,
    3
  )
  assert.equal(loadStoredMission('lost-lands-2026', storage).target, 2)
})

test('legacy unscoped daily mission migrates only to EDC', () => {
  const storage = createMemoryStorage()
  storage.setItem(
    MISSION_STORAGE_KEY,
    JSON.stringify({ date: '2026-07-20', target: 3 })
  )

  assert.equal(loadStoredMission('lost-lands-2026', storage), null)
  assert.deepEqual(loadStoredMission('edc-las-vegas-2026', storage), {
    date: '2026-07-20',
    target: 3,
    festivalId: 'edc-las-vegas-2026',
  })
})
