import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { isDevIncompleteProfileEnabled } from './devIncompleteProfile.js'

test('localhost development query enables incomplete-profile testing', () => {
  assert.equal(
    isDevIncompleteProfileEnabled({
      isDev: true,
      hostname: 'localhost',
      search: '?devIncompleteProfile=true',
    }),
    true
  )
})

test('loopback development hosts support the override', () => {
  assert.equal(
    isDevIncompleteProfileEnabled({
      isDev: true,
      hostname: '127.0.0.1',
      search: '?devIncompleteProfile=true',
    }),
    true
  )
  assert.equal(
    isDevIncompleteProfileEnabled({
      isDev: true,
      hostname: '::1',
      search: '?devIncompleteProfile=true',
    }),
    true
  )
})

test('production builds can never enable the override', () => {
  assert.equal(
    isDevIncompleteProfileEnabled({
      isDev: false,
      hostname: 'localhost',
      search: '?devIncompleteProfile=true',
    }),
    false
  )
})

test('non-local hosts can never enable the override', () => {
  assert.equal(
    isDevIncompleteProfileEnabled({
      isDev: true,
      hostname: 'edm-passport-v2.vercel.app',
      search: '?devIncompleteProfile=true',
    }),
    false
  )
})

test('missing or false query value leaves normal onboarding active', () => {
  assert.equal(
    isDevIncompleteProfileEnabled({
      isDev: true,
      hostname: 'localhost',
      search: '',
    }),
    false
  )
  assert.equal(
    isDevIncompleteProfileEnabled({
      isDev: true,
      hostname: 'localhost',
      search: '?devIncompleteProfile=false',
    }),
    false
  )
})

test('App gates the override behind the Vite development constant', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')

  assert.match(
    app,
    /import\.meta\.env\.DEV &&\s+isDevIncompleteProfileEnabled/
  )
  assert.match(app, /authenticatedWelcome: true/)
  assert.match(app, /setRaveName\(''\)/)
  assert.match(app, /if \(devIncompleteProfileOverride\) return/)
})
