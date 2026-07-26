import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getAccountChipLabel,
  resolveAccountChipRaveName,
} from './accountChipIdentity.js'

test('new authenticated user displays the saved rave name', () => {
  assert.equal(
    resolveAccountChipRaveName({
      authenticatedUserId: 'new-user',
      profile: {
        id: 'new-user',
        rave_name: 'New Explorer',
      },
    }),
    'New Explorer'
  )
})

test('existing authenticated user displays only their private profile rave name', () => {
  assert.equal(
    resolveAccountChipRaveName({
      authenticatedUserId: 'existing-user',
      profile: {
        id: 'existing-user',
        rave_name: 'Festival Veteran',
      },
      raveName: 'Cached Name',
      email: 'ignored@example.com',
      googleName: 'Ignored Google Name',
    }),
    'Festival Veteran'
  )
})

test('another account profile cannot supply the chip identity', () => {
  assert.equal(
    resolveAccountChipRaveName({
      authenticatedUserId: 'user-b',
      profile: {
        id: 'user-a',
        rave_name: 'User A Name',
      },
      raveName: 'Unsaved User B Draft',
    }),
    ''
  )
})

test('Google display name and onboarding draft never replace saved rave name', () => {
  assert.equal(
    resolveAccountChipRaveName({
      authenticatedUserId: 'user-b',
      profile: {
        id: 'user-b',
        rave_name: 'littlemel99',
      },
      raveName: 'Unsaved Draft',
      googleName: 'Google Account Name',
    }),
    'littlemel99'
  )
})

test('authenticated account without a loaded saved profile shows setup state', () => {
  assert.equal(
    resolveAccountChipRaveName({
      authenticatedUserId: 'user-b',
      profile: null,
      raveName: 'Draft Must Not Render',
      googleName: 'Google Must Not Render',
    }),
    ''
  )
})

test('long rave names remain intact for accessible ellipsis presentation', () => {
  const longName = 'The Prehistoric Pathfinder From Legend Valley'
  assert.equal(getAccountChipLabel(longName), longName)
})

test('missing rave name displays Complete Passport', () => {
  assert.equal(getAccountChipLabel(''), 'Complete Passport')
  assert.equal(getAccountChipLabel(null), 'Complete Passport')
})
