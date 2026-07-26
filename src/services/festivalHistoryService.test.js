import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { getFestivalHistoryIds } from './festivalHistoryService.js'

test('new account with no persisted activity has zero festival history', () => {
  assert.deepEqual(getFestivalHistoryIds(), [])
})

test('festival history derives only unique editions owned by the user records', () => {
  assert.deepEqual(
    getFestivalHistoryIds({
      stampRecords: [
        { festival_id: 'lost-lands-2026' },
        { festival_id: 'lost-lands-2026' },
      ],
      memoryRecords: [{ festival_id: 'edc-las-vegas-2026' }],
    }),
    ['lost-lands-2026', 'edc-las-vegas-2026']
  )
})

test('legacy records remain EDC compatible without demo history', () => {
  assert.deepEqual(
    getFestivalHistoryIds({
      stampRecords: [{ festival_id: null }],
    }),
    ['edc-las-vegas-2026']
  )
})

test('history queries filter every table by authenticated user ID', () => {
  const source = readFileSync(
    new URL('./festivalHistoryService.js', import.meta.url),
    'utf8'
  )
  assert.equal(
    (source.match(/\.eq\('user_id', userId\)/g) || []).length,
    2
  )
  assert.doesNotMatch(source, /localStorage|fixture|sample|demo/i)
})

