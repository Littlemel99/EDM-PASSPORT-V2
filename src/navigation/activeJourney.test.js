import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  ACTIVE_JOURNEY_STORAGE_KEY,
  clearActiveJourneyFestivalId,
  getActiveJourneyFestivalId,
  getActiveJourneyLandingDestination,
  restoreActiveJourneyFestivalId,
  resolveActiveJourneyStartup,
  setActiveJourneyFestivalId,
} from './activeJourney.js'
import { createUserStorageKey } from '../auth/accountIsolation.js'

function createStorage() {
  const records = new Map()
  return {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, value),
    removeItem: (key) => records.delete(key),
  }
}

test('first login without an Active Journey opens Festivals', () => {
  assert.equal(getActiveJourneyLandingDestination(''), 'festivals')
})

test('selecting a festival persists an account-scoped Active Journey', () => {
  const storage = createStorage()
  setActiveJourneyFestivalId(
    storage,
    'user-a',
    'lost-lands-2026'
  )
  assert.equal(
    storage.getItem(
      createUserStorageKey(ACTIVE_JOURNEY_STORAGE_KEY, 'user-a')
    ),
    'lost-lands-2026'
  )
  assert.equal(
    getActiveJourneyFestivalId(storage, 'user-a'),
    'lost-lands-2026'
  )
})

test('subsequent app opens land on the Active Journey Dashboard', () => {
  assert.equal(
    getActiveJourneyLandingDestination('lost-lands-2026'),
    'dashboard'
  )
})

test('failed Active Journey restore exposes an actionable error', () => {
  const storage = {
    getItem() {
      throw new Error('Storage denied')
    },
  }
  assert.throws(
    () => restoreActiveJourneyFestivalId(storage, 'user-a'),
    /Active Journey restore failed: Storage denied/
  )
})

test('failed Active Journey save throws without affecting another account', () => {
  const storage = createStorage()
  setActiveJourneyFestivalId(storage, 'user-b', 'lost-lands-2026')
  const failingStorage = {
    getItem: storage.getItem,
    setItem() {
      throw new Error('Storage quota denied')
    },
  }

  assert.throws(
    () =>
      setActiveJourneyFestivalId(
        failingStorage,
        'user-a',
        'tomorrowland-2026'
      ),
    /Storage quota denied/
  )
  assert.equal(
    getActiveJourneyFestivalId(storage, 'user-b'),
    'lost-lands-2026'
  )
})

test('changing festival replaces only the active edition reference', () => {
  const storage = createStorage()
  setActiveJourneyFestivalId(storage, 'user-a', 'lost-lands-2026')
  setActiveJourneyFestivalId(storage, 'user-a', 'edc-las-vegas-2026')
  assert.equal(
    getActiveJourneyFestivalId(storage, 'user-a'),
    'edc-las-vegas-2026'
  )
})

test('Active Journeys are isolated between accounts', () => {
  const storage = createStorage()
  setActiveJourneyFestivalId(storage, 'user-a', 'lost-lands-2026')
  setActiveJourneyFestivalId(storage, 'user-b', 'edc-las-vegas-2026')
  assert.equal(
    getActiveJourneyFestivalId(storage, 'user-a'),
    'lost-lands-2026'
  )
  assert.equal(
    getActiveJourneyFestivalId(storage, 'user-b'),
    'edc-las-vegas-2026'
  )
})

test('switching accounts recalculates the startup destination by UUID', () => {
  const storage = createStorage()
  setActiveJourneyFestivalId(storage, 'user-a', 'lost-lands-2026')

  assert.deepEqual(
    resolveActiveJourneyStartup(storage, 'user-a'),
    {
      authenticatedUserId: 'user-a',
      festivalId: 'lost-lands-2026',
      destination: 'dashboard',
    }
  )
  assert.deepEqual(
    resolveActiveJourneyStartup(storage, 'user-b'),
    {
      authenticatedUserId: 'user-b',
      festivalId: '',
      destination: 'festivals',
    }
  )
})

test('app restart resolves only the persisted account journey', () => {
  const storage = createStorage()
  setActiveJourneyFestivalId(storage, 'user-a', 'lost-lands-2026')

  const restoredStorage = {
    getItem: storage.getItem,
  }
  assert.equal(
    resolveActiveJourneyStartup(restoredStorage, 'user-a').destination,
    'dashboard'
  )
  assert.equal(
    resolveActiveJourneyStartup(restoredStorage, 'user-b').destination,
    'festivals'
  )
})

test('Active Journey startup rejects a missing authenticated UUID', () => {
  assert.throws(
    () => resolveActiveJourneyStartup(createStorage(), ''),
    /Authenticated user UUID is required/
  )
})

test('clearing a completed Active Journey preserves other accounts', () => {
  const storage = createStorage()
  setActiveJourneyFestivalId(storage, 'user-a', 'lost-lands-2026')
  setActiveJourneyFestivalId(storage, 'user-b', 'edc-las-vegas-2026')
  clearActiveJourneyFestivalId(storage, 'user-a')
  assert.equal(getActiveJourneyFestivalId(storage, 'user-a'), '')
  assert.equal(
    getActiveJourneyFestivalId(storage, 'user-b'),
    'edc-las-vegas-2026'
  )
})

test('App publishes cached Active Journey before background refresh', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const authStart = app.indexOf('async function handleAuthenticatedUser')
  const refreshStart = app.indexOf(
    'async function refreshFestivalPersistenceData',
    authStart
  )
  const auth = app.slice(authStart, refreshStart)
  const hydrate = auth.indexOf('hydrateActiveJourneyCache')
  const publish = auth.indexOf('setAuthLoading(false)', hydrate)
  const refresh = auth.indexOf('refreshUserData(', publish)
  assert.ok(
    hydrate < publish
  )
  assert.ok(
    publish < refresh
  )
  assert.match(auth, /Background journey refresh failed/)
})
