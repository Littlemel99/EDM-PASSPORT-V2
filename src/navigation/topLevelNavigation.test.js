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

test('top navigation labels never change without an Active Journey', () => {
  const component = readFileSync(
    new URL(
      '../components/Navigation/TopLevelNavigation.jsx',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(component, /destination\.label/)
  assert.doesNotMatch(component, /SELECT A FESTIVAL/)
  assert.doesNotMatch(component, /disabled=/)
})

test('top navigation remains touch-safe and compact at narrow widths', () => {
  const css = readFileSync(
    new URL(
      '../components/Navigation/topLevelNavigation.css',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(css, /min-height: 44px/)
  assert.match(css, /min-width: 0/)
  assert.match(css, /@media \(max-width: 360px\)/)
  assert.match(css, /focus-visible/)
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

test('no-journey Dashboard and Passport open selection placeholders', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  assert.match(
    app,
    /Select a festival to begin your journey\./
  )
  assert.match(
    app,
    /Select a festival to view its passport\./
  )
  const navigationStart = app.indexOf('function navigateTopLevel')
  const navigationEnd = app.indexOf(
    'function backToFestivals',
    navigationStart
  )
  const navigation = app.slice(navigationStart, navigationEnd)
  assert.match(navigation, /setTopLevelDestination\(destination\)/)
  assert.match(navigation, /setSelectedFestivalId\(''\)/)
})

test('account transitions reset session-only Directory expansion state', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const clearStart = app.indexOf('function clearAuthenticatedUserState')
  const authStart = app.indexOf(
    'function hydrateActiveJourneyCache',
    clearStart
  )
  const clear = app.slice(clearStart, authStart)
  assert.match(clear, /setDirectoryExpandedSections/)
  assert.match(clear, /upcoming: false/)
  assert.match(clear, /completed: false/)
  assert.match(clear, /unavailable: false/)
})
