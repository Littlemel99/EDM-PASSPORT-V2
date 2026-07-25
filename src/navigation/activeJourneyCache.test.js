import assert from 'node:assert/strict'
import test from 'node:test'

import {
  readActiveJourneyCache,
  writeActiveJourneyCache,
} from './activeJourneyCache.js'

function createStorage() {
  const records = new Map()
  return {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, value),
  }
}

test('cached Active Journey data is account and edition scoped', () => {
  const storage = createStorage()
  writeActiveJourneyCache(storage, 'user-a', {
    festivalEditionId: 'lost-lands-2026',
    collectedIds: ['discovery-a'],
  })
  assert.deepEqual(
    readActiveJourneyCache(
      storage,
      'user-a',
      'lost-lands-2026'
    ).collectedIds,
    ['discovery-a']
  )
  assert.equal(
    readActiveJourneyCache(
      storage,
      'user-b',
      'lost-lands-2026'
    ),
    null
  )
  assert.equal(
    readActiveJourneyCache(
      storage,
      'user-a',
      'edc-las-vegas-2026'
    ),
    null
  )
})

test('cached journey records are returned as defensive values', () => {
  const storage = createStorage()
  const snapshot = {
    festivalEditionId: 'lost-lands-2026',
    collectedIds: ['a', 'a'],
    memories: [{ id: 'memory-a', note: 'First' }],
    families: [{ id: 'crew-a', name: 'Crew A' }],
  }
  writeActiveJourneyCache(storage, 'user-a', snapshot)
  const first = readActiveJourneyCache(
    storage,
    'user-a',
    'lost-lands-2026'
  )
  first.memories[0].note = 'Changed'
  first.families[0].name = 'Changed'
  const second = readActiveJourneyCache(
    storage,
    'user-a',
    'lost-lands-2026'
  )
  assert.deepEqual(second.collectedIds, ['a'])
  assert.equal(second.memories[0].note, 'First')
  assert.equal(second.families[0].name, 'Crew A')
})

test('invalid or incompatible cache data fails safely', () => {
  const storage = {
    getItem: () => '{bad-json',
    setItem: () => {},
  }
  assert.equal(
    readActiveJourneyCache(
      storage,
      'user-a',
      'lost-lands-2026'
    ),
    null
  )
})
