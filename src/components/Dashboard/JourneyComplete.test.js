import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./JourneyComplete.jsx', import.meta.url),
  'utf8'
)

test('Journey Complete presents recap and festival-exit actions', () => {
  assert.match(source, /JOURNEY COMPLETE/)
  assert.match(source, /VIEW RECAP/)
  assert.match(source, /CONTINUE TO FESTIVALS/)
  assert.match(source, /onViewRecap/)
  assert.match(source, /onContinueToFestivals/)
})

test('Journey Complete summary uses existing edition progress', () => {
  assert.match(source, /collectedCount/)
  assert.match(source, /totalCount/)
  assert.match(source, /collectionsCompleted/)
  assert.match(source, /collectionsTotal/)
})
