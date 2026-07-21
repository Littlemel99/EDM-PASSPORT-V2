import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getFestivalProfile,
  getFestivalProfiles,
  mergeFestivalProfile,
} from './index.js'

test('EDC Las Vegas 2026 profile loads with repository discoveries', () => {
  const profile = getFestivalProfile('edc-las-vegas-2026')

  assert.equal(profile?.name, 'EDC Las Vegas 2026')
  assert.ok(profile.discoveryIds.includes('kinetic-field'))
  assert.ok(profile.stages.some((stage) => stage.id === 'kinetic-field'))
})

test('Lost Lands 2026 profile loads with verified dates and venue', () => {
  const profile = getFestivalProfile('lost-lands-2026')

  assert.equal(profile?.name, 'Lost Lands 2026')
  assert.equal(profile.venue, 'Legend Valley')
  assert.equal(profile.city, 'Thornville')
  assert.equal(profile.region, 'Ohio')
  assert.equal(profile.startDate, '2026-09-18')
  assert.equal(profile.endDate, '2026-09-20')
  assert.ok(profile.discoveryIds.includes('lost-lands-prehistoric-stage'))
  assert.deepEqual(profile.artists, [])
  assert.equal(profile.mapImage, null)
})

test('unknown festival returns null', () => {
  assert.equal(getFestivalProfile('unknown-festival'), null)
})

test('profile results cannot mutate the stored catalog', () => {
  const profile = getFestivalProfile('edc-las-vegas-2026')
  const profiles = getFestivalProfiles()

  profile.discoveryIds.length = 0
  profiles[0].stages.length = 0

  const freshProfile = getFestivalProfile('edc-las-vegas-2026')
  assert.ok(freshProfile.discoveryIds.length > 0)
  assert.ok(freshProfile.stages.length > 0)
})

test('database operational fields override profile operational fields', () => {
  const profile = getFestivalProfile('edc-las-vegas-2026')
  const merged = mergeFestivalProfile(profile, {
    id: profile.id,
    name: profile.name,
    status: 'active',
    start_date: '2026-05-20',
    end_date: '2026-05-22',
    location: 'Database Location',
    active_configuration: { claimsEnabled: true },
  })

  assert.equal(merged.status, 'active')
  assert.equal(merged.startDate, '2026-05-20')
  assert.equal(merged.endDate, '2026-05-22')
  assert.equal(merged.location, 'Database Location')
  assert.deepEqual(merged.active_configuration, { claimsEnabled: true })
})

test('profile content remains available after database merge', () => {
  const profile = getFestivalProfile('edc-las-vegas-2026')
  const merged = mergeFestivalProfile(profile, {
    id: profile.id,
    status: 'active',
    discoveryIds: ['database-should-not-replace-content'],
    stages: [],
  })

  assert.deepEqual(merged.discoveryIds, profile.discoveryIds)
  assert.deepEqual(merged.stages, profile.stages)
})
