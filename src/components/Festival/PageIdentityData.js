import { getFestivalContextBarData } from './FestivalContextBarData.js'

const PASSPORT_PAGE_TITLES = Object.freeze({
  cover: 'PASSPORT',
  journey: 'JOURNEY',
  discoveries: 'DISCOVERIES',
  memories: 'MEMORIES',
  festival: 'GUIDE',
  export: 'EXPORT',
  admin: 'ADMIN',
})

export function getPageIdentityData({
  pageName,
  activeFestival = null,
  activeFestivalProfile = null,
  activeFestivalBrand = null,
  activeFestivalDisplay = null,
} = {}) {
  const festival = getFestivalContextBarData({
    activeFestival,
    activeFestivalProfile,
    activeFestivalBrand,
    activeFestivalDisplay,
  })

  return Object.freeze({
    appName: 'EDM PASSPORT',
    pageName: String(pageName || 'PASSPORT').toUpperCase(),
    editionId: festival.editionId,
    festivalName: festival.festivalName,
    year: festival.year,
    location: festival.venueLocation || festival.location || null,
    accent: festival.accent,
    border: festival.border,
    glow: festival.glow,
    surface: festival.surface,
  })
}

export function getPassportPageIdentityTitle(sectionId) {
  return PASSPORT_PAGE_TITLES[sectionId] || 'PASSPORT'
}
