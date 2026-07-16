import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_VISIBILITY,
} from './constants'
import { normalizeDiscoveries } from './DiscoveryEngine'

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
