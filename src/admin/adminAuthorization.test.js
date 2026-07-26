import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ADMIN_ACCOUNT_EMAIL,
  canAccessAdminConsole,
  isAdminLocation,
} from './adminAuthorization.js'

test('only Account A receives Admin Console access', () => {
  assert.equal(
    canAccessAdminConsole({ email: ADMIN_ACCOUNT_EMAIL }),
    true
  )
  assert.equal(
    canAccessAdminConsole({ email: 'ravetest214@gmail.com' }),
    false
  )
  assert.equal(canAccessAdminConsole(null), false)
})

test('Admin Console access is case-insensitive but exact', () => {
  assert.equal(
    canAccessAdminConsole({ email: 'FDRUTH@GMAIL.COM' }),
    true
  )
  assert.equal(
    canAccessAdminConsole({ email: `x${ADMIN_ACCOUNT_EMAIL}` }),
    false
  )
})

test('direct Admin locations are recognized without changing routing', () => {
  assert.equal(isAdminLocation({ pathname: '/admin' }), true)
  assert.equal(
    isAdminLocation({ pathname: '/', search: '?admin=true' }),
    true
  )
  assert.equal(isAdminLocation({ pathname: '/' }), false)
})
