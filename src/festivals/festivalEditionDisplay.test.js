import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getFestivalBrandForEdition,
  getFestivalProfile,
} from './index.js'
import {
  formatFestivalDates,
  getFestivalEditionDisplayMetadata,
} from './festivalEditionDisplay.js'

function getMetadata(editionId, editionOverrides = {}) {
  const profile = getFestivalProfile(editionId)

  return getFestivalEditionDisplayMetadata({
    edition: { ...profile, ...editionOverrides },
    profile,
    brand: getFestivalBrandForEdition(editionId),
  })
}

test('Lost Lands passport metadata includes brand, year, location, and dates', () => {
  const metadata = getMetadata('lost-lands-2026')

  assert.deepEqual(metadata, {
    brandName: 'Lost Lands',
    editionName: 'Lost Lands 2026',
    year: 2026,
    location: 'Legend Valley — Thornville, Ohio',
    startDate: '2026-09-18',
    endDate: '2026-09-20',
    themeName: null,
  })
  assert.equal(
    formatFestivalDates(metadata.startDate, metadata.endDate),
    'September 18–20, 2026'
  )
})

test('database location and snake-case dates override edition fallbacks', () => {
  const metadata = getMetadata('lost-lands-2026', {
    location: 'Database Festival Entrance',
    start_date: '2026-09-19',
    end_date: '2026-09-21',
  })

  assert.equal(metadata.location, 'Database Festival Entrance')
  assert.equal(metadata.startDate, '2026-09-19')
  assert.equal(metadata.endDate, '2026-09-21')
})

test('EDC passport metadata falls back to its edition profile', () => {
  const metadata = getMetadata('edc-las-vegas-2026', {
    location: null,
  })

  assert.equal(metadata.brandName, 'EDC Las Vegas')
  assert.equal(metadata.year, 2026)
  assert.equal(metadata.location, 'Las Vegas, Nevada')
  assert.equal(metadata.startDate, '2026-05-15')
  assert.equal(metadata.endDate, '2026-05-17')
})

test('missing edition theme remains null for passport UI', () => {
  const metadata = getMetadata('lost-lands-2026')
  assert.equal(metadata.themeName, null)
})

test('fallback edition derives year and timezone for Tomorrowland identity', () => {
  const metadata = getFestivalEditionDisplayMetadata({
    edition: {
      id: 'tomorrowland-2026',
      name: 'Tomorrowland 2026',
      location: 'Boom, Belgium',
      startDate: '2026-07-17',
      endDate: '2026-07-26',
      timezone: 'Europe/Brussels',
    },
  })

  assert.equal(metadata.year, 2026)
  assert.equal(metadata.location, 'Boom, Belgium')
})
