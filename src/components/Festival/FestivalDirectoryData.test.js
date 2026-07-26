import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FESTIVAL_DIRECTORY_SECTIONS,
  getFestivalDirectorySections,
} from './FestivalDirectoryData.js'

const groups = {
  live: [{ id: 'live' }],
  upcoming: [{ id: 'upcoming' }],
  completed: [{ id: 'attended-a' }, { id: 'attended-b' }],
  unavailable: [{ id: 'other' }],
}

test('Live Now is expanded and secondary sections are collapsed by default', () => {
  const sections = getFestivalDirectorySections(groups)
  assert.equal(sections.find((item) => item.lifecycle === 'live').expanded, true)
  assert.equal(sections.find((item) => item.lifecycle === 'upcoming').expanded, false)
  assert.equal(sections.find((item) => item.lifecycle === 'completed').expanded, false)
  assert.equal(sections.find((item) => item.lifecycle === 'completed').count, 0)
  assert.equal(sections.find((item) => item.lifecycle === 'unavailable').expanded, false)
})

test('expanded section state reveals its festival cards', () => {
  const sections = getFestivalDirectorySections(groups, {
    upcoming: true,
    completed: true,
    unavailable: true,
  }, ['attended-a', 'attended-b'])
  assert.equal(sections.find((item) => item.lifecycle === 'upcoming').expanded, true)
  assert.equal(sections.find((item) => item.lifecycle === 'completed').expanded, true)
  assert.equal(sections.find((item) => item.lifecycle === 'unavailable').expanded, true)
})

test('directory labels and counts are normalized without mutation', () => {
  const sections = getFestivalDirectorySections(
    groups,
    {},
    ['attended-a', 'attended-b']
  )
  assert.deepEqual(
    sections.map(({ label, count }) => [label, count]),
    [
      ['LIVE NOW', 1],
      ['UPCOMING', 1],
      ['ATTENDED', 2],
      ['OTHER FESTIVALS', 1],
    ]
  )
  sections[0].editions[0].id = 'changed'
  assert.equal(groups.live[0].id, 'live')
  assert.equal(Object.isFrozen(FESTIVAL_DIRECTORY_SECTIONS), true)
})

test('existing accounts see only their own attended editions', () => {
  const accountA = getFestivalDirectorySections(
    groups,
    {},
    ['attended-a']
  )
  const accountB = getFestivalDirectorySections(
    groups,
    {},
    ['attended-b']
  )
  assert.deepEqual(
    accountA.find((item) => item.lifecycle === 'completed').editions
      .map((festival) => festival.id),
    ['attended-a']
  )
  assert.deepEqual(
    accountB.find((item) => item.lifecycle === 'completed').editions
      .map((festival) => festival.id),
    ['attended-b']
  )
})

test('account switching recalculates attended counts without shared state', () => {
  const newAccount = getFestivalDirectorySections(groups)
  const existingAccount = getFestivalDirectorySections(
    groups,
    {},
    ['attended-a']
  )
  assert.equal(
    newAccount.find((item) => item.lifecycle === 'completed').count,
    0
  )
  assert.equal(
    existingAccount.find((item) => item.lifecycle === 'completed').count,
    1
  )
})
