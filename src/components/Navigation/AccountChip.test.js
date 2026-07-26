import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./AccountChip.jsx', import.meta.url),
  'utf8'
)
const navigation = readFileSync(
  new URL('./TopLevelNavigation.jsx', import.meta.url),
  'utf8'
)
const css = readFileSync(
  new URL('./topLevelNavigation.css', import.meta.url),
  'utf8'
)
const identity = readFileSync(
  new URL('./accountChipIdentity.js', import.meta.url),
  'utf8'
)
const app = readFileSync(
  new URL('../../App.jsx', import.meta.url),
  'utf8'
)

test('account chip exposes identity without rendering email', () => {
  assert.match(source, /raveName/)
  assert.match(source, /avatarUrl/)
  assert.match(identity, /Complete Passport/)
  assert.doesNotMatch(source, /email/i)
  assert.match(source, /getAccountChipLabel/)
  assert.match(source, /title=\{label\}/)
})

test('account menu contains the required existing-account actions', () => {
  assert.match(source, /MY PROFILE/)
  assert.match(source, /EDIT PASSPORT/)
  assert.match(source, /SWITCH ACCOUNT/)
  assert.match(source, /SIGN OUT/)
  assert.match(source, /role="menu"/)
  assert.match(source, /role="menuitem"/)
})

test('chip is keyboard accessible and supports Escape dismissal', () => {
  assert.match(source, /aria-haspopup="menu"/)
  assert.match(source, /aria-expanded=\{open\}/)
  assert.match(source, /event\.key === 'Escape'/)
  assert.match(css, /account-chip__trigger:focus-visible/)
  assert.match(css, /min-height: 44px/)
})

test('top navigation uses the chip instead of standalone sign out', () => {
  assert.match(navigation, /<AccountChip/)
  assert.doesNotMatch(navigation, /top-level-navigation__sign-out/)
})

test('account actions reuse existing profile editor and auth flows', () => {
  assert.match(app, /function openAccountProfile/)
  assert.match(app, /setPageIndex\(11\)/)
  assert.match(app, /onEditPassport=\{\(\) => beginPassportProfileEdit\(\)\}/)
  assert.match(app, /async function switchAccount\(\)[\s\S]*await signOut\(\)[\s\S]*await signInWithGoogle\(\)/)
})

test('authenticated navigation receives no email presentation prop', () => {
  const navigationStart = app.indexOf('<TopLevelNavigation')
  const navigationEnd = app.indexOf('/>', navigationStart)
  const navigationProps = app.slice(navigationStart, navigationEnd)
  assert.doesNotMatch(navigationProps, /email/i)
})

test('long rave names use visual ellipsis without changing their label', () => {
  assert.match(css, /text-overflow: ellipsis/)
  assert.match(css, /white-space: nowrap/)
  assert.match(source, /aria-label=\{`Account menu for \$\{label\}`\}/)
})
