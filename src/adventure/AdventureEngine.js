import { normalizeDiscoveries } from './DiscoveryEngine'

export function createAdventureState({
  discoveries = [],
  collectedIds = [],
  festivalId = 'edc-las-vegas-2026',
} = {}) {
  const normalizedDiscoveries = normalizeDiscoveries(discoveries, { festivalId })
  const collectedSet = new Set(collectedIds)

  const collected = normalizedDiscoveries.filter((item) => collectedSet.has(item.id))
  const locked = normalizedDiscoveries.filter((item) => !collectedSet.has(item.id))
  const total = normalizedDiscoveries.length
  const completionPercent = total
    ? Math.round((collected.length / total) * 100)
    : 0
  const totalXp = collected.reduce((sum, item) => sum + item.xp, 0)

  const rarityProgress = normalizedDiscoveries.reduce((result, item) => {
    if (!result[item.rarity]) {
      result[item.rarity] = { total: 0, collected: 0 }
    }

    result[item.rarity].total += 1
    if (collectedSet.has(item.id)) result[item.rarity].collected += 1
    return result
  }, {})

  return {
    festivalId,
    discoveries: normalizedDiscoveries,
    collected,
    locked,
    total,
    collectedCount: collected.length,
    completionPercent,
    totalXp,
    rarityProgress,
  }
}

export function getReputationLevel(totalXp = 0) {
  if (totalXp >= 10000) return 'Living Legend'
  if (totalXp >= 7500) return 'Passport Master'
  if (totalXp >= 5000) return 'Festival Legend'
  if (totalXp >= 3000) return 'Festival Veteran'
  if (totalXp >= 1500) return 'Headliner'
  if (totalXp >= 500) return 'Explorer'
  return 'Newcomer'
}
