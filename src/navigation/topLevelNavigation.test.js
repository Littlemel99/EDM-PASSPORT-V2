import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  canOpenEditionDestination,
  getAuthenticatedLandingDestination,
  getTopLevelDestinations,
} from './topLevelNavigation.js'
import { getVisiblePassportSections } from '../components/Passport/passportSections.js'

test('default authenticated landing is Festival Directory without a journey', () => {
  assert.equal(getAuthenticatedLandingDestination(), 'festivals')
})

test('normal top-level navigation is Festivals, Dashboard, Passport', () => {
  assert.deepEqual(
    getTopLevelDestinations().map((destination) => destination.label),
    ['FESTIVALS', 'DASHBOARD', 'PASSPORT']
  )
})

test('Dashboard and Passport require a selected festival', () => {
  assert.equal(canOpenEditionDestination('festivals', ''), true)
  assert.equal(canOpenEditionDestination('dashboard', ''), false)
  assert.equal(canOpenEditionDestination('passport', ''), false)
  assert.equal(
    canOpenEditionDestination('passport', 'lost-lands-2026'),
    true
  )
})

test('Festival Directory is not a Passport tab and Guide replaces Festival', () => {
  const sections = getVisiblePassportSections(false)
  assert.equal(sections.length, 7)
  assert.equal(
    sections.some((section) => section.label === 'Festivals'),
    false
  )
  assert.equal(sections.find((section) => section.id === 'festival').label, 'Guide')
  assert.equal(getVisiblePassportSections(true).length, 8)
})

test('top-level navigation configuration is defensive', () => {
  const first = getTopLevelDestinations()
  first[0].label = 'Changed'
  assert.equal(getTopLevelDestinations()[0].label, 'FESTIVALS')
})

test('App authentication restores an account-scoped Active Journey', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  assert.match(app, /setTopLevelDestination\('festivals'\)/)
  assert.match(app, /getAuthenticatedLandingDestination/)
  const authStart = app.indexOf('async function handleAuthenticatedUser')
  const refreshStart = app.indexOf(
    'async function refreshFestivalPersistenceData',
    authStart
  )
  const authSource = app.slice(authStart, refreshStart)
  assert.match(authSource, /getActiveJourneyFestivalId/)
  assert.match(authSource, /getActiveJourneyLandingDestination/)
  assert.doesNotMatch(authSource, /'selected-festival'/)
})

test('selecting an edition opens its Dashboard in one action', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const selectStart = app.indexOf('function selectFestival')
  const navigationStart = app.indexOf(
    'function navigateTopLevel',
    selectStart
  )
  const selectSource = app.slice(selectStart, navigationStart)
  assert.match(selectSource, /openFestivalEdition\(festivalId\)/)
  assert.match(selectSource, /persistActiveJourney/)
  const editionStart = app.indexOf('function openFestivalEdition')
  const editionSource = app.slice(editionStart, selectStart)
  assert.match(editionSource, /setSelectedFestivalId\(festivalId\)/)
  assert.match(editionSource, /setTopLevelDestination\('dashboard'\)/)
  assert.match(editionSource, /setBookOpen\(false\)/)
})

test('completed journeys are not silently reopened as live dashboards', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  assert.match(app, /setJourneyCompletionPending/)
  assert.match(app, /<JourneyComplete/)
  assert.match(app, /clearPersistedActiveJourney/)
})
