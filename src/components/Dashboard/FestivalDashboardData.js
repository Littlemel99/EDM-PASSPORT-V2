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
