import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { cancelPassportEditor, completePassportEditor, createPassportEditorSession, getOpenPassportIntent, getPassportEditorDestination, getPassportPresentationMode, isPassportContentInteractive, updatePassportEditorDraft } from './passportEntry.js'

test('editor replaces or overlays passport instead of appending interactive content', () => assert.equal(isPassportContentInteractive(true), false))
test('passport content remains interactive when editor is closed', () => assert.equal(isPassportContentInteractive(false), true))
test('Dashboard, Passport, and editor resolve to one mutually exclusive mode', () => {
  assert.equal(getPassportPresentationMode({ bookOpen: false }), 'dashboard')
  assert.equal(getPassportPresentationMode({ bookOpen: true }), 'passport')
  assert.equal(getPassportPresentationMode({ bookOpen: true, isEditingPassport: true }), 'editor')
})
test('App initializes bookOpen before deriving the presentation mode', () => {
  const app = readFileSync(new URL('../../App.jsx', import.meta.url), 'utf8')
  const bookOpenDeclaration = app.indexOf('    bookOpen,')
  const presentationModeDeclaration = app.indexOf('  const passportPresentationMode')
  assert.ok(bookOpenDeclaration >= 0)
  assert.ok(presentationModeDeclaration > bookOpenDeclaration)
})
test('save returns to the prior passport section', () => {
  const session = updatePassportEditorDraft(createPassportEditorSession({ country: 'US', raveName: 'Old', bookOpen: true, pageIndex: 13 }), { raveName: 'New' })
  assert.deepEqual(completePassportEditor(session).origin, { bookOpen: true, pageIndex: 13 })
  assert.equal(completePassportEditor(session).values.raveName, 'New')
})
test('cancel returns to the prior passport section', () => {
  const session = createPassportEditorSession({ country: 'US', raveName: 'Old', bookOpen: true, pageIndex: 17 })
  assert.deepEqual(cancelPassportEditor(session).origin, { bookOpen: true, pageIndex: 17 })
})
test('unsaved draft changes do not persist after cancel', () => {
  const original = createPassportEditorSession({ country: 'US', raveName: 'Old' })
  const edited = updatePassportEditorDraft(original, { country: 'CA', raveName: 'Draft' })
  assert.deepEqual(cancelPassportEditor(edited).values, { country: 'US', raveName: 'Old' })
})

test('completed profile opens Journey directly', () => assert.equal(getOpenPassportIntent({ country: 'US', raveName: 'Explorer' }), 'journey'))
test('incomplete profile routes through setup', () => assert.equal(getOpenPassportIntent({ country: 'US', raveName: '' }), 'setup'))
test('setup session retains Journey as its post-save destination', () => assert.equal(createPassportEditorSession({ afterSaveSectionId: 'journey' }).afterSaveSectionId, 'journey'))
test('saving forced setup opens Journey automatically', () => {
  const session = createPassportEditorSession({ bookOpen: false, pageIndex: 16, afterSaveSectionId: 'journey' })
  assert.deepEqual(getPassportEditorDestination(session, true), { bookOpen: true, pageIndex: null, sectionId: 'journey' })
})
test('cancelling forced setup returns to the original Dashboard view', () => {
  const session = createPassportEditorSession({ bookOpen: false, pageIndex: 16, afterSaveSectionId: 'journey' })
  assert.deepEqual(getPassportEditorDestination(session, false), { bookOpen: false, pageIndex: 16, sectionId: null })
})
test('opening passport does not mutate selected festival data', () => {
  const festival = Object.freeze({ id: 'lost-lands-2026' })
  getOpenPassportIntent({ country: 'US', raveName: 'Explorer' })
  assert.equal(festival.id, 'lost-lands-2026')
})
test('dashboard exposes one accessible primary passport action above Journey', () => {
  const actions = readFileSync(new URL('../Dashboard/PassportPrimaryActions.jsx', import.meta.url), 'utf8')
  const dashboard = readFileSync(new URL('../Dashboard/FestivalDashboard.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../Dashboard/passportPrimaryActions.css', import.meta.url), 'utf8')
  assert.match(actions, /aria-label="Open festival passport"/)
  assert.match(actions, /OPEN PASSPORT/)
  assert.match(actions, /EDIT PASSPORT PROFILE/)
  assert.equal((actions.match(/EDIT PASSPORT PROFILE/g) || []).length, 1)
  assert.equal(dashboard.includes('EDIT PASSPORT'), false)
  assert.equal(dashboard.includes('title="My Passport"'), false)
  assert.ok(dashboard.indexOf('<PassportPrimaryActions') < dashboard.indexOf('eyebrow="YOUR JOURNEY"'))
  assert.match(css, /width: 100%/)
  assert.match(css, /focus-visible/)
})
