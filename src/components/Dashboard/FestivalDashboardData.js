const EXPLORER_RANKS = [
  { name: 'Explorer I', minimum: 0 },
  { name: 'Explorer II', minimum: 3 },
  { name: 'Explorer III', minimum: 6 },
  { name: 'Trailblazer', minimum: 10 },
  { name: 'Pathfinder', minimum: 15 },
  { name: 'Veteran', minimum: 25 },
  { name: 'Legend', minimum: 40 },
]

export function getExplorerRank(totalDiscoveries = 0) {
  const count = Math.max(0, Number(totalDiscoveries) || 0)
  const rankIndex = EXPLORER_RANKS.findLastIndex(
    (rank) => count >= rank.minimum
  )
  const rank = EXPLORER_RANKS[Math.max(rankIndex, 0)]
  const nextRank = EXPLORER_RANKS[rankIndex + 1] || null
  const progress = nextRank
    ? Math.round(
        ((count - rank.minimum) /
          (nextRank.minimum - rank.minimum)) *
          100
      )
    : 100

  return {
    name: rank.name,
    nextName: nextRank?.name || null,
    nextAt: nextRank?.minimum || null,
    progress: Math.min(Math.max(progress, 0), 100),
  }
}

export function getDashboardCollectionsSummary(
  collections = [],
  collectedIds = []
) {
  const progress = calculateFestivalCollectionsProgress(
    collections,
    collectedIds
  )

  return {
    completed: progress.completedCount,
    total: progress.totalCollections,
  }
}

function parseLocalDate(value) {
  const match = String(value || '').match(
    /^(\d{4})-(\d{2})-(\d{2})/
  )
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  )
  return Number.isNaN(date.getTime()) ? null : date
}

export function getJourneyDay(startDate, now = new Date()) {
  const start = parseLocalDate(startDate)
  const current = now instanceof Date ? now : new Date(now)
  if (!start || Number.isNaN(current.getTime())) return null
  const elapsed = Math.floor(
    (new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate()
    ) - start) /
      86400000
  )
  return elapsed >= 0 ? elapsed + 1 : 0
}
import { calculateFestivalCollectionsProgress } from '../../collections/CollectionEngine.js'
