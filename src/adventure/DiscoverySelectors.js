import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_VISIBILITY,
} from './constants.js'
import { normalizeDiscoveries } from './DiscoveryEngine.js'

function toCollectedSet(collectedIds = []) {
  return collectedIds instanceof Set ? collectedIds : new Set(collectedIds)
}

export function getHiddenDiscoveries(discoveries = []) {
  return normalizeDiscoveries(discoveries).filter(
    (discovery) => discovery.visibility !== DISCOVERY_VISIBILITY.VISIBLE
  )
}

export function getUndiscoveredHiddenCount(
  discoveries = [],
  collectedIds = []
) {
  const collectedSet = toCollectedSet(collectedIds)

  return getHiddenDiscoveries(discoveries).filter(
    (discovery) => !collectedSet.has(discovery.id)
  ).length
}

export function getDiscoveredHiddenCount(
  discoveries = [],
  collectedIds = []
) {
  const collectedSet = toCollectedSet(collectedIds)

  return getHiddenDiscoveries(discoveries).filter((discovery) =>
    collectedSet.has(discovery.id)
  ).length
}

export function getRarityProgress(discoveries = [], collectedIds = []) {
  const normalized = normalizeDiscoveries(discoveries)
  const collectedSet = toCollectedSet(collectedIds)

  return normalized.reduce((progress, discovery) => {
    if (!progress[discovery.rarity]) {
      progress[discovery.rarity] = {
        total: 0,
        collected: 0,
      }
    }

    progress[discovery.rarity].total += 1

    if (collectedSet.has(discovery.id)) {
      progress[discovery.rarity].collected += 1
    }

    return progress
  }, {})
}

export function getDiscoveriesByCategory(discoveries = [], category) {
  return normalizeDiscoveries(discoveries).filter(
    (discovery) => discovery.category === category
  )
}

export function getStageDiscoveries(discoveries = []) {
  return getDiscoveriesByCategory(
    discoveries,
    DISCOVERY_CATEGORIES.STAGE
  )
}

export function searchDiscoveries(discoveries = [], query = '') {
  const normalizedQuery = String(query).trim().toLowerCase()

  if (!normalizedQuery) {
    return normalizeDiscoveries(discoveries)
  }

  return normalizeDiscoveries(discoveries).filter((discovery) => {
    const haystack = [
      discovery.id,
      discovery.name,
      discovery.location,
      discovery.category,
      discovery.rarity,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

function getFestivalId(item = {}) {
  return item.festivalId || item.festival_id || ''
}

function getStampId(item = {}) {
  return item.stampId || item.stamp_id || ''
}

function isWithinLiveWindow(window, now) {
  if (!window || window.isActive === false || window.is_active === false) {
    return false
  }
  if (!Number.isFinite(now)) return false

  const startsAt = window.startsAt || window.starts_at
  const endsAt = window.endsAt || window.ends_at
  const startsAtTime = startsAt ? new Date(startsAt).getTime() : null
  const endsAtTime = endsAt ? new Date(endsAt).getTime() : null

  if (startsAt && Number.isNaN(startsAtTime)) return false
  if (endsAt && Number.isNaN(endsAtTime)) return false
  if (startsAtTime !== null && startsAtTime > now) return false
  if (endsAtTime !== null && endsAtTime < now) return false

  return true
}

export function selectNextFestivalDiscovery({
  discoveries = [],
  collectedIds = [],
  festivalId = '',
  festivalDiscoveryIds,
  activeDropIds = [],
  activeDropWindows = {},
  gpsDrops = [],
  nearbyGpsDrops = [],
  now = new Date(),
} = {}) {
  const discoveryById = new Map(
    discoveries
      .filter((discovery) => discovery?.id)
      .map((discovery) => [discovery.id, discovery])
  )
  const collectedSet = toCollectedSet(collectedIds)
  const configuredDiscoverySet =
    Array.isArray(festivalDiscoveryIds) && festivalDiscoveryIds.length > 0
      ? new Set(festivalDiscoveryIds)
      : null
  const nowTime = now instanceof Date ? now.getTime() : new Date(now).getTime()
  const getUncollectedDiscovery = (stampId) => {
    if (!stampId || collectedSet.has(stampId)) return null
    if (configuredDiscoverySet && !configuredDiscoverySet.has(stampId)) {
      return null
    }
    return discoveryById.get(stampId) || null
  }
  const isSelectedFestival = (item) =>
    Boolean(festivalId) && getFestivalId(item) === festivalId
  const findDropDiscovery = (drops, predicate = () => true) => {
    for (const drop of drops) {
      if (!isSelectedFestival(drop) || !predicate(drop)) continue

      const discovery = getUncollectedDiscovery(getStampId(drop))
      if (discovery) return discovery
    }

    return null
  }

  const nearbyDiscovery = findDropDiscovery(
    nearbyGpsDrops,
    (drop) => drop.is_active !== false && drop.unlocked === true
  )
  if (nearbyDiscovery) return nearbyDiscovery

  if (festivalId) {
    for (const stampId of activeDropIds) {
      const window =
        activeDropWindows instanceof Map
          ? activeDropWindows.get(stampId)
          : activeDropWindows[stampId]

      if (
        !isSelectedFestival(window) ||
        !isWithinLiveWindow(window, nowTime)
      ) {
        continue
      }

      const discovery = getUncollectedDiscovery(stampId)
      if (discovery) return discovery
    }
  }

  const gpsDiscovery = findDropDiscovery(
    gpsDrops,
    (drop) => drop.is_active !== false
  )
  if (gpsDiscovery) return gpsDiscovery

  if (Array.isArray(festivalDiscoveryIds)) {
    for (const stampId of festivalDiscoveryIds) {
      const discovery = getUncollectedDiscovery(stampId)
      if (discovery) return discovery
    }

    if (festivalDiscoveryIds.length > 0) return null

    return (
      discoveries.find(
        (discovery) =>
          discovery?.id && !collectedSet.has(discovery.id)
      ) || null
    )
  }

  if (festivalId) {
    const festivalDiscovery = discoveries.find(
      (discovery) =>
        isSelectedFestival(discovery) &&
        !collectedSet.has(discovery.id)
    )

    if (festivalDiscovery) return festivalDiscovery
  }

  return (
    discoveries.find(
      (discovery) =>
        discovery?.id && !collectedSet.has(discovery.id)
    ) || null
  )
}
