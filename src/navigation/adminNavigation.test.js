import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { getTopLevelDestinations } from './topLevelNavigation.js'

const appSource = readFileSync(
  new URL('../App.jsx', import.meta.url),
  'utf8'
)
const navigationSource = readFileSync(
  new URL(
    '../components/Navigation/TopLevelNavigation.jsx',
    import.meta.url
  ),
  'utf8'
)

test('Admin receives the additional top-level Admin destination', () => {
  assert.deepEqual(
    getTopLevelDestinations(true).map((item) => item.label),
    ['FESTIVALS', 'DASHBOARD', 'PASSPORT', 'BACKSTAGE']
  )
})

test('normal users never receive the Admin navigation destination', () => {
  assert.deepEqual(
    getTopLevelDestinations(false).map((item) => item.label),
    ['FESTIVALS', 'DASHBOARD', 'PASSPORT']
  )
  assert.match(navigationSource, /getTopLevelDestinations\(isAdmin\)/)
  const navigationStart = appSource.indexOf('<TopLevelNavigation')
  const navigationEnd = appSource.indexOf('/>', navigationStart)
  const navigationProps = appSource.slice(
    navigationStart,
    navigationEnd
  )
  assert.match(navigationProps, /isAdmin=\{isAdmin\}/)
})

test('loading AccountChip does not receive the Admin navigation prop', () => {
  const loadingStart = appSource.indexOf(
    "authenticatedProfileStatus === 'loading'"
  )
  const loadingEnd = appSource.indexOf(
    "authenticatedProfileStatus === 'error'",
    loadingStart
  )
  const loadingSource = appSource.slice(loadingStart, loadingEnd)

  assert.match(loadingSource, /<AccountChip/)
  assert.doesNotMatch(loadingSource, /isAdmin=\{isAdmin\}/)
})

test('App gates Admin navigation and direct locations', () => {
  assert.match(appSource, /canAccessAdminConsole\(user\)/)
  assert.match(appSource, /adminLocationRequested/)
  assert.match(appSource, /'admin-denied'/)
  assert.match(appSource, /<AdminConsole/)
  assert.match(
    appSource,
    /authorized=\{\s*topLevelDestination === 'admin' && isAdmin/
  )
})

test('Admin destination does not alter attendee Dashboard routing', () => {
  const navigateStart = appSource.indexOf(
    'function navigateTopLevel'
  )
  const navigateEnd = appSource.indexOf(
    'function backToFestivals',
    navigateStart
  )
  const navigateSource = appSource.slice(navigateStart, navigateEnd)

  assert.match(navigateSource, /destination === 'admin'/)
  assert.match(navigateSource, /destination === 'festivals'/)
  assert.match(navigateSource, /destination === 'passport'/)
  assert.match(navigateSource, /setTopLevelDestination\('dashboard'\)/)
})
