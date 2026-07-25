import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./FestivalDirectory.jsx', import.meta.url),
  'utf8'
)

test('Festival Directory renders lifecycle groups and one-click edition actions', () => {
  assert.match(source, /LIVE NOW/)
  assert.match(source, /UPCOMING/)
  assert.match(source, /ATTENDED/)
  assert.match(source, /getFestivalLifecycleAction/)
  assert.match(source, /onSelectFestival\?\.\(festival\.id\)/)
})

test('Upcoming and Attended groups are collapsible session UI', () => {
  assert.match(source, /aria-expanded=\{expanded\}/)
  assert.match(source, /onToggleSection/)
  assert.match(source, /lifecycle === 'upcoming'/)
  assert.match(source, /lifecycle === 'completed'/)
})

test('Festival Directory renders brand, year, location, dates, and available progress', () => {
  assert.match(source, /display\.brandName/)
  assert.match(source, /display\.year/)
  assert.match(source, /display\.location/)
  assert.match(source, /formatFestivalDates/)
  assert.match(source, /progress\.collected/)
})

test('Festival Directory cards support narrow layouts without fixed overflow', () => {
  assert.match(source, /minmax\(min\(100%,240px\),1fr\)/)
  assert.match(source, /overflowWrap: 'anywhere'/)
})
