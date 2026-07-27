import { getFestivalJourneyDay } from '../../festivals/festivalLifecycle.js'
import { resolveAttendeeContentStateFromCounts } from '../../attendee/attendeeContentState.js'

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

export function getAttendeeJourneyCompletion({
  lifecycle,
  collectedDiscoveries = 0,
  totalDiscoveries = 0,
  completedCollections = 0,
  totalCollections = 0,
} = {}) {
  const contentState = resolveAttendeeContentStateFromCounts({
    totalDiscoveries,
    completedDiscoveries: collectedDiscoveries,
    totalCollections,
    completedCollections,
  })

  return Object.freeze({
    state: contentState.isEmpty
      ? 'empty'
      : lifecycle === 'completed' && contentState.isComplete
        ? 'completed'
        : lifecycle === 'completed'
          ? 'in-progress'
          : lifecycle || 'unavailable',
    hasCompletableContent: contentState.hasAnyPublishedContent,
    complete: contentState.isComplete,
    percent: contentState.overallProgressPercent,
  })
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

export function getJourneyDay(
  startDate,
  now = new Date(),
  timezone = null
) {
  return getFestivalJourneyDay(startDate, now, timezone)
}

export function getMissionControlLocation({
  discovery,
  venue,
  location,
} = {}) {
  return (
    String(discovery?.location || '').trim() ||
    String(venue || '').trim() ||
    String(location || '').trim() ||
    'Festival grounds'
  )
}

export function formatMissionControlTime(
  now = new Date(),
  locale = undefined
) {
  const date = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(date.getTime())) return 'Time unavailable'

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function getFestivalCountdown(startDate, now = new Date()) {
  const start = parseLocalDate(startDate)
  const current = now instanceof Date ? now : new Date(now)
  if (!start || Number.isNaN(current.getTime())) return null

  const currentDay = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate()
  )
  const days = Math.ceil((start - currentDay) / 86400000)
  if (days <= 0) return 'today'
  return `${days} ${days === 1 ? 'day' : 'days'}`
}
import { calculateFestivalCollectionsProgress } from '../../collections/CollectionEngine.js'
