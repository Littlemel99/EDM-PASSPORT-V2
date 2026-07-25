import { getPassportEditionTheme } from '../Passport/passportEditionTheme.js'

export function getFestivalContextBarData({
  activeFestival = null,
  activeFestivalProfile = null,
  activeFestivalBrand = null,
  activeFestivalDisplay = null,
} = {}) {
  const edition =
    activeFestivalProfile ||
    activeFestival ||
    (activeFestivalDisplay?.editionId
      ? { id: activeFestivalDisplay.editionId }
      : {})
  const identity = getPassportEditionTheme({
    edition,
    brand: activeFestivalBrand || {},
    display: activeFestivalDisplay || {},
  })

  return Object.freeze({
    editionId: identity.editionId,
    festivalName: identity.brandName,
    year: identity.year || 'Edition pending',
    location: identity.location || null,
    venueLocation: [identity.venue, identity.cityRegion]
      .filter(Boolean)
      .join(' • ') || null,
    accent: identity.accent,
    border: identity.border,
    glow: identity.glow,
    surface: identity.surface,
    prehistoric: identity.editionId === 'lost-lands-2026',
  })
}

export function isDiscoveryOwnedByFestival(discovery, festivalId) {
  if (!discovery?.festivalId || !festivalId) return false
  return discovery.festivalId === festivalId
}
