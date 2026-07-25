import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./FestivalDirectory.jsx', import.meta.url),
  'utf8'
)

test('Festival Directory renders lifecycle groups and one-click edition actions', () => {
  assert.match(source, /getFestivalDirectorySections/)
  assert.match(source, /getFestivalLifecycleAction/)
  assert.match(source, /onSelectFestival\?\.\(festival\.id\)/)
})

test('secondary lifecycle groups use accessible disclosure controls', () => {
  assert.match(source, /<button[\s\S]*type="button"[\s\S]*aria-expanded=\{expanded\}/)
  assert.match(source, /aria-expanded=\{expanded\}/)
  assert.match(source, /aria-controls=\{panelId\}/)
  assert.match(source, /onToggleSection/)
  assert.match(source, /expanded \? '▾' : '▸'/)
})

test('native disclosure buttons support keyboard activation', () => {
  assert.match(source, /type="button"/)
  assert.match(source, /onClick=\{\(\) => onToggleSection\?\.\(lifecycle\)\}/)
  assert.match(source, /minHeight: 44/)
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

test('redundant no-journey sentence is absent from Directory UI', () => {
  const navigation = readFileSync(
    new URL('../Navigation/TopLevelNavigation.jsx', import.meta.url),
    'utf8'
  )
  assert.doesNotMatch(
    `${source}\n${navigation}`,
    /Select a festival to begin your journey\. Select a festival to view its passport\./
  )
})
