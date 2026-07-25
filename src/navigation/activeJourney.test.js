import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  ACTIVE_JOURNEY_STORAGE_KEY,
  clearActiveJourneyFestivalId,
  getActiveJourneyFestivalId,
  getActiveJourneyLandingDestination,
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
