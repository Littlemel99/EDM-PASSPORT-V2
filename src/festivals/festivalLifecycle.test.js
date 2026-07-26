import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getFestivalLifecycleAction,
  groupFestivalsByLifecycle,
  resolveFestivalLifecycle,
} from './festivalLifecycle.js'
import { festivals } from '../data/festivals.js'

const festival = {
  id: 'edition-2026',
  startDate: '2026-09-18',
  endDate: '2026-09-20',
}

test('festival lifecycle resolves upcoming before its local start date', () => {
  assert.equal(
    resolveFestivalLifecycle(festival, new Date(2026, 8, 17, 23, 59)),
    'upcoming'
  )
})

test('festival lifecycle is live throughout its start and end dates', () => {
  assert.equal(
    resolveFestivalLifecycle(festival, new Date(2026, 8, 18, 0, 0)),
    'live'
  )
  assert.equal(
    resolveFestivalLifecycle(festival, new Date(2026, 8, 20, 23, 59)),
    'live'
  )
})

test('festival lifecycle resolves completed after its end date', () => {
  assert.equal(
    resolveFestivalLifecycle(festival, new Date(2026, 8, 21, 0, 0)),
    'completed'
  )
})

test('missing and invalid dates resolve safely', () => {
  assert.equal(resolveFestivalLifecycle({}, new Date()), 'unavailable')
  assert.equal(
    resolveFestivalLifecycle(
      { startDate: 'invalid', endDate: '2026-09-20' },
      new Date()
    ),
    'unavailable'
  )
})

test('explicit lifecycle override takes precedence without mutating input', () => {
  const input = structuredClone(festival)
  assert.equal(
    resolveFestivalLifecycle(
      input,
      new Date(2026, 8, 17),
      'live'
    ),
    'live'
  )
  assert.deepEqual(input, festival)
})

test('directory grouping and lifecycle actions are deterministic', () => {
  const groups = groupFestivalsByLifecycle(
    [
      { ...festival, id: 'upcoming' },
      {
        ...festival,
        id: 'completed',
        startDate: '2025-09-18',
        endDate: '2025-09-20',
      },
      {
        ...festival,
        id: 'live',
        lifecycleStatus: 'live',
      },
    ],
    new Date(2026, 8, 1)
  )

  assert.deepEqual(groups.live.map((item) => item.id), ['live'])
  assert.deepEqual(groups.upcoming.map((item) => item.id), ['upcoming'])
  assert.deepEqual(groups.completed.map((item) => item.id), ['completed'])
  assert.equal(getFestivalLifecycleAction('live'), 'ENTER FESTIVAL')
  assert.equal(getFestivalLifecycleAction('upcoming'), 'VIEW FESTIVAL')
  assert.equal(getFestivalLifecycleAction('completed'), 'VIEW RECAP')
  assert.equal(getFestivalLifecycleAction('unavailable'), 'VIEW FESTIVAL')
})

test('Tomorrowland 2026 is upcoming before its first date', () => {
  const tomorrowland = festivals.find(
    (item) => item.id === 'tomorrowland-2026'
  )
  assert.equal(
    resolveFestivalLifecycle(
      tomorrowland,
      new Date('2026-07-16T21:59:00Z')
    ),
    'upcoming'
  )
})

test('Tomorrowland 2026 is live on July 25 and throughout inclusive dates', () => {
  const tomorrowland = festivals.find(
    (item) => item.id === 'tomorrowland-2026'
  )
  assert.equal(
    resolveFestivalLifecycle(
      tomorrowland,
      new Date('2026-07-16T22:00:00Z')
    ),
    'live'
  )
  assert.equal(
    resolveFestivalLifecycle(
      tomorrowland,
      new Date('2026-07-25T10:00:00Z')
    ),
    'live'
  )
  assert.equal(
    resolveFestivalLifecycle(
      tomorrowland,
      new Date('2026-07-26T21:59:59Z')
    ),
    'live'
  )
})

test('Tomorrowland 2026 is completed after its inclusive end date', () => {
  const tomorrowland = festivals.find(
    (item) => item.id === 'tomorrowland-2026'
  )
  assert.equal(
    resolveFestivalLifecycle(
      tomorrowland,
      new Date('2026-07-26T22:00:00Z')
    ),
    'completed'
  )
})

test('Tomorrowland lifecycle uses the festival timezone, not the browser timezone', () => {
  const tomorrowland = festivals.find(
    (item) => item.id === 'tomorrowland-2026'
  )
  assert.equal(tomorrowland.timezone, 'Europe/Brussels')
  assert.equal(
    resolveFestivalLifecycle(
      tomorrowland,
      new Date('2026-07-16T22:30:00Z')
    ),
    'live'
  )
})
