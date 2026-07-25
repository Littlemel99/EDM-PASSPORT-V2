import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { getOAuthRedirectUrl } from './oauthRedirect.js'

test('local OAuth returns to the initiating localhost origin and port', () => {
  assert.equal(
    getOAuthRedirectUrl('http://localhost:5175'),
    'http://localhost:5175/'
  )
  assert.equal(
    getOAuthRedirectUrl('http://localhost:5176'),
    'http://localhost:5176/'
  )
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
    /redirectTo: getOAuthRedirectUrl\(window\.location\.origin\)/
  )
  assert.doesNotMatch(
    app.slice(
      app.indexOf('async function signInWithGoogle'),
      app.indexOf('async function signOut')
    ),
    /APP_URL|vercel\.app|localhost/
  )
})
