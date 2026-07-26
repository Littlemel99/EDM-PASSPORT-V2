import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import {
  AUTHENTICATED_WELCOME_DESTINATIONS,
  isAuthenticatedProfileComplete,
  resolveAuthenticatedWelcome,
} from './authenticatedWelcome.js'

test('an incomplete authenticated profile resolves to passport setup', () => {
  assert.equal(
    resolveAuthenticatedWelcome({
      profile: { rave_name: '', country: 'United States' },
      activeFestivalEditionId: 'lost-lands-2026',
    }),
    AUTHENTICATED_WELCOME_DESTINATIONS.setup
  )
})

test('a complete profile without an Active Journey resolves to festivals', () => {
  assert.equal(
    resolveAuthenticatedWelcome({
      profile: { rave_name: 'TrailGuide', country: 'United States' },
    }),
    AUTHENTICATED_WELCOME_DESTINATIONS.festivals
  )
})

test('a complete profile with an Active Journey resolves to its dashboard', () => {
  assert.equal(
    resolveAuthenticatedWelcome({
      profile: { rave_name: 'TrailGuide', country: 'United States' },
      activeFestivalEditionId: 'lost-lands-2026',
    }),
    AUTHENTICATED_WELCOME_DESTINATIONS.dashboard
  )
})

test('profile completeness accepts normalized and persisted field names', () => {
  assert.equal(
    isAuthenticatedProfileComplete({
      raveName: 'Explorer',
      country: 'Canada',
    }),
    true
  )
  assert.equal(
    isAuthenticatedProfileComplete({
      rave_name: 'Explorer',
      country: '',
    }),
    false
  )
})

test('authenticated welcome keeps Google login inside the signed-out branch', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const signedOutBranch = app.indexOf('{!user && (')
  const googleLogin = app.indexOf('LOGIN WITH GOOGLE')

  assert.ok(signedOutBranch >= 0)
  assert.ok(googleLogin > signedOutBranch)
  assert.match(app, /user && authenticatedProfileStatus === 'loading'/)
  assert.match(app, /user && passportPresentationMode === 'editor'/)
})

test('required authenticated setup uses Complete Passport and cannot be cancelled', () => {
  const editor = readFileSync(
    new URL(
      '../components/Passport/PassportProfileEditor.jsx',
      import.meta.url
    ),
    'utf8'
  )

  assert.match(editor, /requiredSetup \? 'COMPLETE PASSPORT'/)
  assert.match(editor, /!requiredSetup && \(/)
})

test('saving authenticated setup routes by the account Active Journey', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')

  assert.match(
    app,
    /activeJourneyFestivalId \? 'dashboard' : 'festivals'/
  )
})
