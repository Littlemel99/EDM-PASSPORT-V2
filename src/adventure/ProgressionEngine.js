import { normalizeDiscoveries } from './DiscoveryEngine'

function toCollectedSet(collectedIds = []) {
  return collectedIds instanceof Set
    ? collectedIds
    : new Set(collectedIds)
}

export function createCompletionReward({
  id,
  title,
  description,
  discoveries = [],
  collectedIds = [],
}) {
  const normalized = normalizeDiscoveries(discoveries)
  const collectedSet = toCollectedSet(collectedIds)
  const total = Math.max(normalized.length, 1)
  const collected = normalized.filter((discovery) =>
    collectedSet.has(discovery.id)
  ).length

  return {
    id,
    title,
    description,
    collected,
    total,
    percent: Math.round((collected / total) * 100),
    unlocked:
      normalized.length > 0 &&
      collected >= normalized.length,
  }
}

export function createCompletionRewards({
  definitions = [],
  collectedIds = [],
}) {
  return definitions.map((definition) =>
    createCompletionReward({
      ...definition,
      collectedIds,
    })
  )
}

export function createArtistCollections({
  discoveries = [],
  collectedIds = [],
  definitions = [],
}) {
  const normalized = normalizeDiscoveries(discoveries)
  const collectedSet = toCollectedSet(collectedIds)

  return definitions.map((definition) => {
    const keywords = Array.isArray(definition.keywords)
      ? definition.keywords.map((keyword) =>
          String(keyword).toLowerCase()
        )
      : []

    const matching = normalized.filter((discovery) => {
      const haystack = [
        discovery.id,
        discovery.name,
        discovery.location,
        discovery.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return keywords.some((keyword) =>
        haystack.includes(keyword)
      )
    })

    const collected = matching.filter((discovery) =>
      collectedSet.has(discovery.id)
    ).length

    const total = Math.max(matching.length, 1)

    return {
      ...definition,
      collected,
      total,
      percent: Math.round((collected / total) * 100),
      unlocked:
        matching.length > 0 &&
        collected >= matching.length,
    }
  })
}

export function getCollectionProgress(
  discoveries = [],
  collectedIds = []
) {
  const normalized = normalizeDiscoveries(discoveries)
  const collectedSet = toCollectedSet(collectedIds)
  const collected = normalized.filter((discovery) =>
    collectedSet.has(discovery.id)
  )
  const total = normalized.length

  return {
    collected,
    collectedCount: collected.length,
    total,
    percent: total
      ? Math.round((collected.length / total) * 100)
      : 0,
  }
}

export function getUnlockedItems(items = []) {
  return items.filter((item) => item.unlocked)
}
