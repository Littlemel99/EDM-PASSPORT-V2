import { calculateCollectionProgress, getNextCollectionTarget } from '../../collections/index.js'
import { formatFestivalDates } from '../../festivals/index.js'
import { getExplorerRank } from '../Dashboard/FestivalDashboardData.js'
import { resolveAttendeeContentState } from '../../attendee/attendeeContentState.js'
import { getFestivalScopedMemories } from './passportSections.js'

const LOST_LANDS_EDITION_ID = 'lost-lands-2026'

const THEMES = Object.freeze({
  prehistoric: Object.freeze({
    eyebrow: 'PREHISTORIC EDITION RECORD',
    surface: 'radial-gradient(circle at 76% 12%,rgba(210,116,45,.18),transparent 25%),radial-gradient(circle at 18% 78%,rgba(75,117,74,.14),transparent 32%),linear-gradient(155deg,#171812,#090b0a 62%,#050706)',
    border: '#826436', accent: '#e1ad59', glow: 'rgba(213,135,53,.23)',
    texture: 'repeating-linear-gradient(118deg,transparent 0 17px,rgba(255,255,255,.018) 18px 19px)',
    atmosphere: 'PREHISTORIC ARCHIVE',
  }),
  neutral: Object.freeze({
    eyebrow: 'FESTIVAL EDITION RECORD',
    surface: 'radial-gradient(circle at 75% 8%,rgba(86,132,139,.15),transparent 28%),linear-gradient(155deg,#151a1b,#080b0c 65%,#050708)',
    border: '#4b6265', accent: '#9ac1c4', glow: 'rgba(91,153,158,.16)',
    texture: 'repeating-linear-gradient(118deg,transparent 0 17px,rgba(255,255,255,.014) 18px 19px)',
    atmosphere: 'FESTIVAL ARCHIVE',
  }),
})

function editionMark(editionId) {
  let hash = 0
  for (const character of String(editionId || 'festival-edition')) {
    hash = ((hash << 5) - hash + character.charCodeAt(0)) >>> 0
  }
  return `ED-${hash.toString(36).toUpperCase().padStart(6, '0').slice(-6)}`
}

function getLocationParts(edition = {}, display = {}) {
  if (display.location) {
    const [displayVenue, displayCityRegion] = String(display.location).split(' — ')
    return { venue: displayVenue || null, cityRegion: displayCityRegion || null }
  }
  const venue = edition.venue || null
  const cityRegion = [edition.city, edition.region].filter(Boolean).join(', ') || null
  if (venue || cityRegion) return { venue, cityRegion }
  return { venue: null, cityRegion: null }
}

export function getPassportEditionTheme({ edition = {}, brand = {}, display = {} } = {}) {
  const editionId = edition.id || null
  const visual = editionId === LOST_LANDS_EDITION_ID ? THEMES.prehistoric : THEMES.neutral
  const location = getLocationParts(edition, display)
  return Object.freeze({
    editionId,
    brandName: display.brandName || brand.name || edition.shortName || edition.name || 'Festival Passport',
    editionName: display.editionName || edition.displayName || edition.name || 'Festival Edition',
    year: display.year || edition.year || null,
    location: display.location || [location.venue, location.cityRegion].filter(Boolean).join(' — ') || null,
    venue: location.venue,
    cityRegion: location.cityRegion,
    dateLabel: formatFestivalDates(display.startDate || edition.startDate, display.endDate || edition.endDate),
    themeName: display.themeName || edition.theme?.name || null,
    editionMark: editionMark(editionId),
    ...visual,
  })
}

export function getPassportJourneySummary({ festivalId = null, collections = [], discoveries = [], collectedIds = [], memories = [], achievement = null, achievementProgress = {}, contentState = null } = {}) {
  const resolvedContentState =
    contentState ||
    resolveAttendeeContentState({
      festivalId,
      collections,
      discoveries,
      collectedIds,
    })
  const visibleDiscoveries =
    resolvedContentState.eligibleDiscoveries || discoveries
  const visibleCollections =
    resolvedContentState.eligibleCollections || collections
  const collectionProgress = visibleCollections.map((collection) => ({ collection, ...calculateCollectionProgress(collection, collectedIds) }))
  const currentCollection = collectionProgress.find((item) => !item.complete) || null
  const nextTarget = currentCollection ? getNextCollectionTarget(currentCollection.collection, visibleDiscoveries, collectedIds) : null
  const safelyVisibleTarget = nextTarget && !['hidden', 'secret'].includes(String(nextTarget.visibility || '').toLowerCase()) ? nextTarget : null
  const scopedMemories = getFestivalScopedMemories(memories, visibleDiscoveries).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

  return {
    rank: getExplorerRank(resolvedContentState.completedDiscoveries),
    collectedCount: resolvedContentState.completedDiscoveries,
    totalCount: resolvedContentState.totalDiscoveries,
    percent: resolvedContentState.discoveryProgressPercent,
    collectionsCompleted: resolvedContentState.completedCollections,
    collectionsTotal: resolvedContentState.totalCollections,
    hasCompletableContent: resolvedContentState.hasAnyPublishedContent,
    contentState: resolvedContentState,
    collectionGoalState:
      !resolvedContentState.hasPublishedCollections
        ? 'unavailable'
        : currentCollection
          ? 'in-progress'
          : 'complete',
    currentCollection: currentCollection ? {
      id: currentCollection.collection.id,
      name: currentCollection.collection.name,
      collectedCount: currentCollection.collectedCount,
      totalCount: currentCollection.totalCount,
      percent: currentCollection.percent,
      nextDiscovery: safelyVisibleTarget ? { ...safelyVisibleTarget } : null,
    } : null,
    achievement: achievement ? { ...achievement } : null,
    achievementProgress: { ...achievementProgress },
    memoryCount: scopedMemories.length,
    recentMemory: scopedMemories[0] ? { ...scopedMemories[0] } : null,
  }
}
