import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  authorizationUrlMatchesRedirect,
  beginOAuthAttempt,
  clearOAuthBrowserState,
  clearPendingOAuthAttempt,
  createOAuthRequestLock,
  getOAuthCallbackError,
  getOAuthErrorClearedUrl,
  getOAuthRedirectUrl,
  getSupabaseProjectRef,
  isLocalOAuthHost,
  readPendingOAuthAttempt,
} from './oauthRedirect.js'

function createStorage(entries = {}) {
  const values = new Map(Object.entries(entries))
  return {
    get length() {
      return values.size
    },
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
    key(index) {
      return [...values.keys()][index] ?? null
    },
  }
}

test('local OAuth returns to every supported initiating origin and port', () => {
  [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
  ].forEach((origin) => {
    assert.equal(getOAuthRedirectUrl(origin), `${origin}/`)
  })
})

test('production OAuth remains on the initiating production origin', () => {
  assert.equal(
    getOAuthRedirectUrl('https://edm-passport-v2.vercel.app'),
    'https://edm-passport-v2.vercel.app/'
  )
})

test('OAuth redirect normalization never duplicates trailing slashes', () => {
  assert.equal(
    getOAuthRedirectUrl('http://localhost:5175///'),
    'http://localhost:5175/'
  )
})

test('App passes the current browser origin to the OAuth redirect helper', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  assert.match(
    app,
    /const redirectTo = getOAuthRedirectUrl\(window\.location\.origin\)/
  )
  assert.doesNotMatch(
    app.slice(
      app.indexOf('async function signInWithGoogle'),
      app.indexOf('async function signOut')
    ),
    /APP_URL|vercel\.app|localhost/
  )
})

test('Supabase authorization URL cannot silently fall back to Site URL', () => {
  const localRedirect = 'http://localhost:5175/'
  assert.equal(
    authorizationUrlMatchesRedirect(
      `https://project.supabase.co/auth/v1/authorize?redirect_to=${encodeURIComponent(localRedirect)}`,
      localRedirect
    ),
    true
  )
  assert.equal(
    authorizationUrlMatchesRedirect(
      `https://project.supabase.co/auth/v1/authorize?redirect_to=${encodeURIComponent('https://edm-passport-v2.vercel.app/')}`,
      localRedirect
    ),
    false
  )
})

test('expired OAuth state becomes a safe retry message', () => {
  assert.deepEqual(
    getOAuthCallbackError(
      '?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+state+has+expired'
    ),
    {
      code: 'bad_oauth_state',
      message: 'OAuth state has expired',
    }
  )
})

test('OAuth error parameters are removed without removing unrelated state', () => {
  assert.equal(
    getOAuthErrorClearedUrl(
      'http://localhost:5175/?festival=lost-lands-2026&error=invalid_request&error_code=bad_oauth_state&error_description=Expired#passport'
    ),
    '/?festival=lost-lands-2026#passport'
  )
})

test('OAuth request lock permits only one request until failure releases it', () => {
  const lock = createOAuthRequestLock()
  assert.equal(lock.tryAcquire(), true)
  assert.equal(lock.tryAcquire(), false)
  assert.equal(lock.isLocked(), true)
  lock.release()
  assert.equal(lock.tryAcquire(), true)
})

test('one cross-tab OAuth attempt blocks a duplicate until cleared', () => {
  const storage = createStorage()
  const first = beginOAuthAttempt(storage, {
    origin: 'http://localhost:5175',
    now: 100,
    attemptId: 'attempt-one',
  })
  const duplicate = beginOAuthAttempt(storage, {
    origin: 'http://localhost:5175',
    now: 101,
    attemptId: 'attempt-two',
  })

  assert.equal(first.id, 'attempt-one')
  assert.equal(duplicate, null)
  assert.equal(readPendingOAuthAttempt(storage, 102).id, 'attempt-one')
  clearPendingOAuthAttempt(storage)
  assert.equal(readPendingOAuthAttempt(storage, 103), null)
})

test('localhost OAuth cleanup removes only project auth and OAuth setup keys', () => {
  const local = createStorage({
    'sb-grcgaxvvswegsvbmvrqf-auth-token': 'session',
    'sb-grcgaxvvswegsvbmvrqf-auth-token-code-verifier': 'verifier',
    'edm-passport:oauth-attempt': 'attempt',
    'edm-user:user-a:activeFestivalEditionId': 'lost-lands-2026',
  })
  const session = createStorage({
    'edm-passport:onboarding-draft': 'draft',
    unrelated: 'keep',
  })

  clearOAuthBrowserState({
    localStorage: local,
    sessionStorage: session,
    projectRef: getSupabaseProjectRef(
      'https://grcgaxvvswegsvbmvrqf.supabase.co'
    ),
  })

  assert.equal(local.getItem('sb-grcgaxvvswegsvbmvrqf-auth-token'), null)
  assert.equal(
    local.getItem('sb-grcgaxvvswegsvbmvrqf-auth-token-code-verifier'),
    null
  )
  assert.equal(local.getItem('edm-passport:oauth-attempt'), null)
  assert.equal(
    local.getItem('edm-user:user-a:activeFestivalEditionId'),
    'lost-lands-2026'
  )
  assert.equal(session.getItem('edm-passport:onboarding-draft'), null)
  assert.equal(session.getItem('unrelated'), 'keep')
})

test('OAuth test cleanup is restricted to loopback hosts', () => {
  assert.equal(isLocalOAuthHost('localhost'), true)
  assert.equal(isLocalOAuthHost('127.0.0.1'), true)
  assert.equal(isLocalOAuthHost('edm-passport-v2.vercel.app'), false)
})

test('App guards repeated login clicks and exposes callback retry', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const signIn = app.slice(
    app.indexOf('async function signInWithGoogle'),
    app.indexOf('async function signOut')
  )

  assert.match(signIn, /oauthRequestLockRef\.current\.tryAcquire\(\)/)
  assert.match(signIn, /skipBrowserRedirect: true/)
  assert.match(signIn, /authorizationUrlMatchesRedirect\(data\.url, redirectTo\)/)
  assert.match(signIn, /setOauthRedirecting\(true\)/)
  assert.match(app, /disabled=\{oauthRedirecting\}/)
  assert.match(app, /oauthCallbackError &&/)
  assert.match(app, /TRY GOOGLE LOGIN AGAIN/)
})
