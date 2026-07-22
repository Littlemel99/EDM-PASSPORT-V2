import { getFestivalDiscoveries } from '../festivals/festivalDiscoveries.js'
import { lostLandsCollections } from './lostLandsCollections.js'

const COLLECTIONS = [...lostLandsCollections]

function clone(value) {
  if (Array.isArray(value)) return value.map(clone)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, clone(item)])
    )
  }
  return value
}

function getValidDiscoveryRecords(collection, discoveries) {
  if (!collection) return []

  const discoveryById = new Map(
    discoveries
      .filter(
        (discovery) =>
          discovery?.id &&
          discovery.festivalId === collection.festivalId &&
          discovery.claimable !== false &&
          discovery.sourceType !== 'derived-achievement'
      )
      .map((discovery) => [discovery.id, discovery])
  )
  const seen = new Set()

  return (collection.discoveryIds || [])
    .filter((discoveryId) => {
      if (seen.has(discoveryId) || !discoveryById.has(discoveryId)) {
        return false
      }
      seen.add(discoveryId)
      return true
    })
    .map((discoveryId) => discoveryById.get(discoveryId))
}

export function getFestivalCollections(festivalId) {
  return clone(
    COLLECTIONS
      .filter((collection) => collection.festivalId === festivalId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  )
}

export function getCollectionById(collectionId) {
  const collection = COLLECTIONS.find((item) => item.id === collectionId)
  return collection ? clone(collection) : null
}

export function getCollectionDiscoveryRecords(
  collection,
  discoveries = getFestivalDiscoveries()
) {
  return clone(getValidDiscoveryRecords(collection, discoveries))
}

export function calculateCollectionProgress(collection, collectedIds = []) {
  const records = getValidDiscoveryRecords(
    collection,
    getFestivalDiscoveries()
  )
  const collectedSet = new Set(collectedIds)
  const collectedCount = records.filter((record) =>
    collectedSet.has(record.id)
  ).length
  const totalCount = records.length
  const percent = totalCount
    ? Math.round((collectedCount / totalCount) * 100)
    : 0

  return {
    collectionId: collection?.id || null,
    collectedCount,
    totalCount,
    percent,
    complete: totalCount > 0 && collectedCount === totalCount,
  }
}

export function calculateFestivalCollectionsProgress(
  collections = [],
  collectedIds = []
) {
  const progress = collections.map((collection) => ({
    collection: clone(collection),
    ...calculateCollectionProgress(collection, collectedIds),
  }))
  const uniqueDiscoveryIds = new Set(
    collections.flatMap((collection) =>
      getValidDiscoveryRecords(collection, getFestivalDiscoveries()).map(
        (discovery) => discovery.id
      )
    )
  )
  const collectedSet = new Set(collectedIds)
  const coveredCount = [...uniqueDiscoveryIds].filter((discoveryId) =>
    collectedSet.has(discoveryId)
  ).length
  const totalDiscoveryCount = uniqueDiscoveryIds.size

  return {
    collections: progress,
    completedCount: progress.filter((item) => item.complete).length,
    totalCollections: progress.length,
    coveredCount,
    totalDiscoveryCount,
    coveragePercent: totalDiscoveryCount
      ? Math.round((coveredCount / totalDiscoveryCount) * 100)
      : 0,
  }
}

export function getCompletedCollections(collections = [], collectedIds = []) {
  return clone(
    collections.filter(
      (collection) =>
        calculateCollectionProgress(collection, collectedIds).complete
    )
  )
}

export function getNextCollectionTarget(
  collection,
  discoveries = [],
  collectedIds = []
) {
  const collectedSet = new Set(collectedIds)
  const target = getValidDiscoveryRecords(collection, discoveries).find(
    (discovery) => !collectedSet.has(discovery.id)
  )
  return target ? clone(target) : null
}
