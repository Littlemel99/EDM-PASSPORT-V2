import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { assertProfileOwnership } from './profileService.js'

const source = readFileSync(
  new URL('./profileService.js', import.meta.url),
  'utf8'
)

test('private profile ownership accepts the authenticated row', () => {
  const profile = { id: 'user-a', rave_name: 'Explorer' }
  assert.equal(assertProfileOwnership(profile, 'user-a'), profile)
})

test('private profile ownership rejects another user row', () => {
  assert.throws(
    () => assertProfileOwnership({ id: 'helper-user' }, 'admin-user'),
    /Profile ownership mismatch/
  )
})

test('missing profile remains null for authenticated profile setup', () => {
  assert.equal(assertProfileOwnership(null, 'admin-user'), null)
})

test('private profile select filters by authenticated user ID', () => {
  assert.match(source, /\.eq\('id', userId\)/)
  assert.match(source, /requireAuthenticatedUser\(user\)/)
})

test('profile upsert derives row ID and email from authenticated session', () => {
  assert.match(source, /id: authenticatedUser\.id/)
  assert.match(source, /email: authenticatedUser\.email/)
  assert.match(source, /onConflict: 'id'/)
})

test('profile reads and writes verify returned row ownership', () => {
  assert.match(source, /assertProfileOwnership\(data, userId\)/)
  assert.match(
    source,
    /assertProfileOwnership\(data, authenticatedUser\.id\)/
  )
})

test('public profile reads are explicitly identified as URL-owner queries', () => {
  assert.match(source, /public-select-request/)
  assert.match(source, /\.eq\('id', userId\)/)
})
