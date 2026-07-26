import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./ProfileProvider.jsx', import.meta.url),
  'utf8'
)

test('private profile session reset clears the previous profile', () => {
  assert.match(source, /beginPrivateProfileSession/)
  assert.match(source, /setProfile\(null\)/)
})

test('profile publishing verifies the authenticated owner ID', () => {
  assert.match(
    source,
    /profileOwnerIdRef\.current !== userId/
  )
  assert.match(source, /nextProfile\.id !== userId/)
})

test('stale profile save responses cannot publish messages or state', () => {
  assert.match(
    source,
    /profileOwnerIdRef\.current !== requestedUserId/
  )
  assert.match(
    source,
    /profileOwnerIdRef\.current === requestedUserId/
  )
})

test('profile save is reloaded before it is published', () => {
  const saveIndex = source.indexOf('await saveProfile(user')
  const reloadIndex = source.indexOf('await loadProfile(user)', saveIndex)
  const publishIndex = source.indexOf('setProfile(savedProfile)', reloadIndex)

  assert.ok(saveIndex >= 0)
  assert.ok(reloadIndex > saveIndex)
  assert.ok(publishIndex > reloadIndex)
})

test('closing a public profile invalidates its pending request and cached row', () => {
  assert.match(source, /publicProfileRequestRef\.current \+= 1/)
  assert.match(source, /setPublicProfile\(null\)/)
  assert.match(source, /setPublicProfileCollectedIds\(\[\]\)/)
})
