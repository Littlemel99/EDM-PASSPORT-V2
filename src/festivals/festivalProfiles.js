import { edcLasVegas2026 } from './edcLasVegas2026.js'
import { lostLands2026 } from './lostLands2026.js'
import { edcLasVegasBrand } from './brands/edcLasVegas.js'
import { lostLandsBrand } from './brands/lostLands.js'

const ARRAY_FIELDS = [
  'stages',
  'artists',
  'discoveryIds',
  'missionIds',
  'rewardIds',
  'liveDropIds',
  'gpsDropIds',
]

const CONTENT_FIELDS = [
  'shortName',
  'festivalBrandId',
  'year',
  'displayName',
  'country',
  'city',
  'region',
  'venue',
  'timezone',
  'description',
  'logo',
  'heroImage',
  'mapImage',
  'theme',
  ...ARRAY_FIELDS,
]

function clone(value) {
  if (Array.isArray(value)) return value.map(clone)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, clone(item)])
    )
  }
  return value
}

const EMPTY_THEME = {
  name: null,
  tagline: null,
  description: null,
  palette: [],
  artworkDirection: null,
  typographyDirection: null,
  effects: [],
}

function normalizeTheme(theme = {}) {
  return {
    ...EMPTY_THEME,
    ...clone(theme || {}),
    palette: Array.isArray(theme?.palette) ? clone(theme.palette) : [],
    effects: Array.isArray(theme?.effects) ? clone(theme.effects) : [],
  }
}

function normalizeProfile(profile = {}) {
  const normalized = {
    id: profile.id || '',
    festivalBrandId: profile.festivalBrandId || null,
    year: Number(profile.year) || null,
    name: profile.name || '',
    displayName: profile.displayName || profile.name || '',
    shortName: profile.shortName || profile.name || '',
    country: profile.country || null,
    city: profile.city || null,
    region: profile.region || null,
    venue: profile.venue || null,
    timezone: profile.timezone || null,
    startDate: profile.startDate || profile.start_date || null,
    endDate: profile.endDate || profile.end_date || null,
    status: profile.status || null,
    description: profile.description || null,
    logo: profile.logo || null,
    heroImage:
      profile.heroImage || profile.bannerUrl || profile.banner_url || null,
    mapImage: profile.mapImage || profile.mapUrl || profile.map_url || null,
    theme: normalizeTheme(profile.theme),
  }

  ARRAY_FIELDS.forEach((field) => {
    normalized[field] = Array.isArray(profile[field])
      ? clone(profile[field])
      : []
  })

  return normalized
}

function getProfileLocation(profile) {
  const cityRegion = [profile.city, profile.region].filter(Boolean).join(', ')
  return [profile.venue, cityRegion].filter(Boolean).join(' — ') || null
}

const FESTIVAL_PROFILES = [edcLasVegas2026, lostLands2026].map(
  normalizeProfile
)
const FESTIVAL_BRANDS = [edcLasVegasBrand, lostLandsBrand]

export function getFestivalProfiles() {
  return clone(FESTIVAL_PROFILES)
}

export function getFestivalProfile(festivalId) {
  const profile = FESTIVAL_PROFILES.find(
    (festival) => festival.id === festivalId
  )
  return profile ? clone(profile) : null
}

export function getFestivalDiscoveryIds(festivalId) {
  return getFestivalProfile(festivalId)?.discoveryIds || []
}

export function getFestivalStages(festivalId) {
  return getFestivalProfile(festivalId)?.stages || []
}

export function getFestivalTheme(festivalId) {
  return getFestivalProfile(festivalId)?.theme || null
}

export function getFestivalEdition(editionId) {
  return getFestivalProfile(editionId)
}

export function getFestivalEditionTheme(editionId) {
  return getFestivalEdition(editionId)?.theme || null
}

export function mergeFestivalProfile(profile, databaseRecord) {
  if (!profile && !databaseRecord) return null

  const normalizedProfile = normalizeProfile(profile || databaseRecord)
  const brand = FESTIVAL_BRANDS.find(
    (item) => item.id === normalizedProfile.festivalBrandId
  )
  if (!databaseRecord) {
    return {
      ...normalizedProfile,
      brandName: brand?.name || null,
      brandShortName: brand?.shortName || null,
      brandDescription: brand?.description || null,
      location: getProfileLocation(normalizedProfile),
    }
  }

  const merged = {
    ...normalizedProfile,
    ...clone(databaseRecord),
    id: databaseRecord.id || normalizedProfile.id,
    name: profile
      ? normalizedProfile.name
      : databaseRecord.name || normalizedProfile.name,
    status: databaseRecord.status ?? normalizedProfile.status,
    startDate:
      databaseRecord.start_date ??
      databaseRecord.startDate ??
      normalizedProfile.startDate,
    endDate:
      databaseRecord.end_date ??
      databaseRecord.endDate ??
      normalizedProfile.endDate,
    location:
      databaseRecord.location ?? getProfileLocation(normalizedProfile),
    brandName: brand?.name || null,
    brandShortName: brand?.shortName || null,
    brandDescription: brand?.description || null,
  }

  // Database rows own operational fields. Profile content remains the source
  // of presentation and gameplay catalog metadata when a profile exists.
  if (profile) {
    CONTENT_FIELDS.forEach((field) => {
      merged[field] = clone(normalizedProfile[field])
    })
  }

  return merged
}

export function mergeFestivalCatalog(
  databaseRecords = [],
  fallbackRecords = []
) {
  const profileRecords = getFestivalProfiles()
  const databaseById = new Map(
    databaseRecords.filter((record) => record?.id).map((record) => [record.id, record])
  )
  const fallbackById = new Map(
    fallbackRecords.filter((record) => record?.id).map((record) => [record.id, record])
  )
  const orderedIds = [
    ...profileRecords.map((profile) => profile.id),
    ...fallbackRecords.map((record) => record.id),
    ...databaseRecords.map((record) => record.id),
  ].filter((id, index, ids) => id && ids.indexOf(id) === index)

  return orderedIds.map((id) => {
    const profile = profileRecords.find((item) => item.id === id) || null
    const operationalRecord = databaseById.get(id) || fallbackById.get(id) || null
    return mergeFestivalProfile(profile, operationalRecord)
  })
}
