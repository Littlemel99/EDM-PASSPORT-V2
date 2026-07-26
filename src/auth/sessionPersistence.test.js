import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('Supabase browser sessions explicitly persist and refresh', () => {
  const source = readFileSync(
    new URL('../lib/supabase.js', import.meta.url),
    'utf8'
  )

  assert.match(source, /persistSession:\s*true/)
  assert.match(source, /autoRefreshToken:\s*true/)
  assert.match(source, /detectSessionInUrl:\s*true/)
  assert.match(source, /window\.localStorage/)
})

test('auth listener is registered before the initial session read', () => {
  const source = readFileSync(
    new URL('../App.jsx', import.meta.url),
    'utf8'
  )
  const effectStart = source.indexOf(
    "localStorage.removeItem('edm-country')"
  )
  const effectEnd = source.indexOf(
    'useEffect(() => {',
    effectStart + 1
  )
  const startup = source.slice(effectStart, effectEnd)

  assert.ok(
    startup.indexOf('supabase.auth.onAuthStateChange') <
      startup.indexOf('.getSession()')
  )
  assert.match(
    startup,
    /if \(event === 'INITIAL_SESSION' && !session\?\.user\) return/
  )
  assert.match(
    startup,
    /if \(disposed \|\| authenticatedAuthEventReceived\) return/
  )
})

test('a null initial auth event cannot suppress a persisted session read', () => {
  const source = readFileSync(
    new URL('../App.jsx', import.meta.url),
    'utf8'
  )
  const effectStart = source.indexOf(
    "localStorage.removeItem('edm-country')"
  )
  const effectEnd = source.indexOf(
    'useEffect(() => {',
    effectStart + 1
  )
  const startup = source.slice(effectStart, effectEnd)

  assert.doesNotMatch(startup, /authEventReceived\s*=\s*true/)
  assert.match(
    startup,
    /if \(session\?\.user\) \{\s*authenticatedAuthEventReceived = true/
  )
})

test('normal startup never invokes OAuth test-state cleanup', () => {
  const source = readFileSync(
    new URL('../App.jsx', import.meta.url),
    'utf8'
  )
  const effectStart = source.indexOf(
    "localStorage.removeItem('edm-country')"
  )
  const effectEnd = source.indexOf(
    'useEffect(() => {',
    effectStart + 1
  )
  const startup = source.slice(effectStart, effectEnd)

  assert.doesNotMatch(startup, /clearOAuthBrowserState/)
  assert.doesNotMatch(startup, /auth\.signOut/)
})
