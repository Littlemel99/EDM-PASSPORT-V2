import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  createAccountRequestGuard,
  createUserStorageKey,
  isProfileOwnedByUser,
  readUserStorage,
  writeUserStorage,
} from './accountIsolation.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
  }
}

const appSource = readFileSync(
  new URL('../App.jsx', import.meta.url),
  'utf8'
)

test('User A profile is accepted only for User A', () => {
  assert.equal(isProfileOwnedByUser({ id: 'user-a' }, 'user-a'), true)
  assert.equal(isProfileOwnedByUser({ id: 'user-a' }, 'user-b'), false)
})

test('sign out invalidates the active account request', () => {
  const guard = createAccountRequestGuard()
  const userARequest = guard.begin('user-a')
  guard.begin(null)
  assert.equal(guard.isCurrent(userARequest), false)
  assert.equal(guard.getUserId(), null)
})

test('User B sign-in invalidates User A requests', () => {
  const guard = createAccountRequestGuard()
  const userARequest = guard.begin('user-a')
  const userBRequest = guard.begin('user-b')
  assert.equal(guard.isCurrent(userARequest), false)
  assert.equal(guard.isCurrent(userBRequest), true)
})

test('Admin account accepts only its own profile', () => {
  assert.equal(isProfileOwnedByUser({ id: 'normal-user' }, 'admin-user'), false)
  assert.equal(isProfileOwnedByUser({ id: 'admin-user' }, 'admin-user'), true)
})

test('missing Admin profile remains incomplete', () => {
  assert.equal(isProfileOwnedByUser(null, 'admin-user'), false)
})

test('stale User A response cannot overwrite User B', () => {
  const guard = createAccountRequestGuard()
  const userARequest = guard.begin('user-a')
  const userBRequest = guard.begin('user-b')
  assert.equal(guard.isCurrent(userBRequest), true)
  assert.equal(guard.isCurrent(userARequest), false)
})

test('user-scoped browser keys never collide', () => {
  assert.notEqual(
    createUserStorageKey('selected-festival', 'user-a'),
    createUserStorageKey('selected-festival', 'user-b')
  )
})

test('admin identity is derived from the current authenticated user', () => {
  const guard = createAccountRequestGuard()
  guard.begin('admin-user')
  assert.equal(guard.getUserId(), 'admin-user')
  guard.begin(null)
  assert.equal(guard.getUserId(), null)
})

test('User A discovery and memory storage cannot be read by User B', () => {
  const storage = createStorage()
  writeUserStorage(storage, 'selected-festival', 'user-a', 'lost-lands-2026')
  assert.equal(readUserStorage(storage, 'selected-festival', 'user-b', ''), '')
})

test('switching back to User A restores only User A scoped preference', () => {
  const storage = createStorage()
  writeUserStorage(storage, 'selected-festival', 'user-a', 'lost-lands-2026')
  writeUserStorage(storage, 'selected-festival', 'user-b', 'edc-las-vegas-2026')
  assert.equal(readUserStorage(storage, 'selected-festival', 'user-a'), 'lost-lands-2026')
})

test('App clears private gameplay and passport state at the account boundary', () => {
  for (const reset of [
    'setCountry(\'\')',
    'setRaveName(\'\')',
    'setMemories([])',
    'setFamilies([])',
    'setRewardCelebrations([])',
    'setLastClaimedDiscovery(null)',
    'setAdminTestMode(false)',
    'setBookOpen(false)',
  ]) {
    assert.match(appSource, new RegExp(reset.replace(/[()[\]]/g, '\\$&')))
  }
})

test('App presents a neutral auth loading state before account UI', () => {
  assert.match(appSource, /if \(authLoading\)/)
  assert.match(appSource, /Loading your passport/)
})

test('shared profile browser keys are removed rather than used as fallback', () => {
  assert.doesNotMatch(
    appSource,
    /useState\(localStorage\.getItem\('edm-(country|rave-name)'/
  )
  assert.match(appSource, /localStorage\.removeItem\('edm-country'\)/)
  assert.match(appSource, /localStorage\.removeItem\('edm-rave-name'\)/)
})

test('Google sign-in requires explicit account selection', () => {
  assert.match(appSource, /prompt: 'select_account'/)
})

test('sign out exits a URL-owned public profile before the next account signs in', () => {
  assert.match(appSource, /if \(publicProfileId\) closePublicProfile\(\)/)
  assert.match(appSource, /country={publicProfile\.country \|\| ''}/)
})
