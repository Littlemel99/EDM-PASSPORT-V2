import { normalizeDiscoveries } from './DiscoveryEngine.js'
import { getFestivalCalendarDate } from '../festivals/festivalLifecycle.js'

export const DISCOVERY_STATES = Object.freeze({
  LOCKED: 'LOCKED',
  HIDDEN: 'HIDDEN',
  AVAILABLE: 'AVAILABLE',
  COLLECTED: 'COLLECTED',
  EXPIRED: 'EXPIRED',
  UNAVAILABLE: 'UNAVAILABLE',
})

export const COLLECTION_STATES = Object.freeze({
  HIDDEN: 'HIDDEN',
  LOCKED: 'LOCKED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE',
  EXPIRED: 'EXPIRED',
  UNAVAILABLE: 'UNAVAILABLE',
})

const BLOCKED_STATUSES = new Set([
  'archived',
  'draft',
  'inactive',
  'test',
  'test-only',
  'testing',
  'unpublished',
])
const BLOCKED_SOURCES = new Set([
  'admin-test',
  'backstage-draft',
  'local-draft',
  'test',
])

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function stringArray(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(stringValue).filter(Boolean))]
}

function rawStringArray(value) {
  return Array.isArray(value)
    ? value.map(stringValue).filter(Boolean)
    : []
}

function recordFestivalId(record = {}) {
  record = record || {}
  return stringValue(
    record.festivalId ||
      record.festival_id ||
      record.editionId ||
      record.edition_id
  )
}

function isBlockedRecord(record = {}) {
  record = record || {}
  const status = stringValue(
    record.publishStatus ||
      record.publish_status ||
      record.status
  ).toLowerCase()
  const source = stringValue(record.sourceType).toLowerCase()
  return (
    record.active === false ||
    record.published === false ||
    record.archived === true ||
    record.localDraft === true ||
    record.testOnly === true ||
    BLOCKED_STATUSES.has(status) ||
    BLOCKED_SOURCES.has(source)
  )
}

function numericReward(...values) {
  for (const value of values) {
    if (value === '' || value === null || value === undefined) continue
    const number = Number(value)
    if (Number.isFinite(number)) return Math.max(0, number)
  }
  return 0
}

function normalizeDiscoveryRecord(record, festivalId) {
  const id = stringValue(record?.id || record?.discoveryId)
  const ownerFestivalId = recordFestivalId(record)
  const title = stringValue(record?.title || record?.name)
  return {
    ...record,
    id,
    festivalId: ownerFestivalId,
    editionId: stringValue(record?.editionId) || ownerFestivalId,
    title,
    description: stringValue(record?.description),
    category: stringValue(record?.category) || null,
    rarity: stringValue(record?.rarity) || null,
    xpReward: numericReward(record?.xpReward, record?.xp),
    badgeReward: record?.badgeReward || null,
    passportStampReward: record?.passportStampReward || null,
    hiddenReward: record?.hiddenReward || null,
    hiddenUntilDiscovered: Boolean(
      record?.hiddenUntilDiscovered ||
        record?.hidden_until_discovered ||
        record?.hidden ||
        record?.is_hidden
    ),
    prerequisiteDiscoveryIds: stringArray(
      record?.prerequisiteDiscoveryIds
    ),
    prerequisiteCollectionIds: stringArray(
      record?.prerequisiteCollectionIds
    ),
    unlocksDiscoveryIds: stringArray(record?.unlocksDiscoveryIds),
    unlocksCollectionIds: stringArray(record?.unlocksCollectionIds),
    collectionIds: stringArray(record?.collectionIds),
    availableFrom: record?.availableFrom || record?.available_from || null,
    availableUntil:
      record?.availableUntil || record?.available_until || null,
    claimMethod: record?.claimMethod || record?.claimMethods || null,
    location: stringValue(record?.location) || null,
    image: record?.image || record?.imageUrl || null,
    valid:
      Boolean(id && title && ownerFestivalId === festivalId) &&
      !isBlockedRecord(record) &&
      record?.claimable !== false,
  }
}

function normalizeCollectionRecord(record, festivalId) {
  const id = stringValue(record?.id || record?.collectionId)
  const ownerFestivalId = recordFestivalId(record)
  const requiredDiscoveryIds = stringArray(
    record?.requiredDiscoveryIds || record?.discoveryIds
  )
  const optionalDiscoveryIds = stringArray(record?.optionalDiscoveryIds)
  const rawRequired = rawStringArray(
    record?.requiredDiscoveryIds || record?.discoveryIds
  )
  const rawOptional = rawStringArray(record?.optionalDiscoveryIds)
  const minimumRequiredCount = Math.max(
    0,
    Number(record?.minimumRequiredCount) || 0
  )
  const duplicateReferences =
    new Set(rawRequired).size !== rawRequired.length ||
    new Set(rawOptional).size !== rawOptional.length ||
    requiredDiscoveryIds.some((idValue) =>
      optionalDiscoveryIds.includes(idValue)
    )
  const hasCompletionRule =
    requiredDiscoveryIds.length > 0 ||
    (minimumRequiredCount > 0 &&
      requiredDiscoveryIds.length + optionalDiscoveryIds.length > 0)

  return {
    ...record,
    id,
    festivalId: ownerFestivalId,
    editionId: stringValue(record?.editionId) || ownerFestivalId,
    name: stringValue(record?.name || record?.title),
    description: stringValue(record?.description),
    story: stringValue(record?.story) || null,
    difficulty: stringValue(record?.difficulty) || null,
    requiredDiscoveryIds,
    optionalDiscoveryIds,
    minimumRequiredCount,
    xpReward: numericReward(record?.xpReward, record?.xp),
    badgeReward: record?.badgeReward || null,
    passportStampReward: record?.passportStampReward || null,
    hiddenReward: record?.hiddenReward || null,
    unlocksDiscoveryIds: stringArray(record?.unlocksDiscoveryIds),
    unlocksCollectionIds: stringArray(record?.unlocksCollectionIds),
    prerequisiteCollectionIds: stringArray(
      record?.prerequisiteCollectionIds
    ),
    hiddenUntilUnlocked: Boolean(record?.hiddenUntilUnlocked),
    availableFrom: record?.availableFrom || record?.available_from || null,
    availableUntil:
      record?.availableUntil || record?.available_until || null,
    displayOrder: Number(record?.displayOrder) || 0,
    duplicateReferences,
    valid:
      Boolean(id && stringValue(record?.name || record?.title)) &&
      ownerFestivalId === festivalId &&
      !isBlockedRecord(record) &&
      hasCompletionRule &&
      !duplicateReferences,
  }
}

function resolveTimeWindow(record, now, timezone) {
  const current = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(current.getTime())) {
    return { valid: false, before: false, expired: false }
  }

  const compareBoundary = (value, type) => {
    if (!value) return { valid: true, passed: true }
    const text = String(value)
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      const currentKey = getFestivalCalendarDate(current, timezone)
      if (!currentKey) return { valid: false, passed: false }
      return {
        valid: true,
        passed: type === 'start' ? currentKey >= text : currentKey <= text,
      }
    }
    const boundary = new Date(value)
    if (Number.isNaN(boundary.getTime())) {
      return { valid: false, passed: false }
    }
    return {
      valid: true,
      passed:
        type === 'start'
          ? current.getTime() >= boundary.getTime()
          : current.getTime() <= boundary.getTime(),
    }
  }

  const start = compareBoundary(record.availableFrom, 'start')
  const end = compareBoundary(record.availableUntil, 'end')
  return {
    valid: start.valid && end.valid,
    before: start.valid && !start.passed,
    expired: end.valid && !end.passed,
  }
}

function addEdge(graph, from, to) {
  if (!graph.has(from)) graph.set(from, new Set())
  graph.get(from).add(to)
}

function detectCycles(graph) {
  const visiting = new Set()
  const visited = new Set()
  const path = []
  const cyclePaths = []
  const cyclicNodes = new Set()

  const visit = (node) => {
    if (visiting.has(node)) {
      const start = path.indexOf(node)
      const cycle = [...path.slice(start), node]
      cyclePaths.push(cycle)
      cycle.forEach((entry) => cyclicNodes.add(entry))
      return
    }
    if (visited.has(node)) return
    visiting.add(node)
    path.push(node)
    for (const next of graph.get(node) || []) visit(next)
    path.pop()
    visiting.delete(node)
    visited.add(node)
  }

  for (const node of graph.keys()) visit(node)
  return { cyclePaths, cyclicNodes }
}

function completionForCollection(
  collection,
  validDiscoveryIds,
  collectedSet
) {
  const configuredIds = [
    ...collection.requiredDiscoveryIds,
    ...collection.optionalDiscoveryIds,
  ]
  const missingReferenceIds = configuredIds.filter(
    (id) => !validDiscoveryIds.has(id)
  )
  const completedRequiredCount = collection.requiredDiscoveryIds.filter(
    (id) => collectedSet.has(id) && validDiscoveryIds.has(id)
  ).length
  const completedOptionalCount = collection.optionalDiscoveryIds.filter(
    (id) => collectedSet.has(id) && validDiscoveryIds.has(id)
  ).length
  const minimum = collection.minimumRequiredCount
  const completedConfiguredCount =
    completedRequiredCount + completedOptionalCount
  const requiredTarget =
    minimum > 0 ? minimum : collection.requiredDiscoveryIds.length
  const isComplete =
    missingReferenceIds.length === 0 &&
    requiredTarget > 0 &&
    (minimum > 0
      ? completedConfiguredCount >= minimum
      : completedRequiredCount === collection.requiredDiscoveryIds.length)

  return {
    requiredCount: collection.requiredDiscoveryIds.length,
    completedRequiredCount,
    optionalCount: collection.optionalDiscoveryIds.length,
    completedOptionalCount,
    minimumRequiredCount: minimum,
    progressPercent:
      requiredTarget > 0
        ? Math.min(
            100,
            Math.round((completedConfiguredCount / requiredTarget) * 100)
          )
        : 0,
    isComplete,
    missingReferenceIds,
  }
}

function rewardCandidate(sourceType, record) {
  return Object.freeze({
    sourceType,
    sourceId: record.id,
    xp: record.xpReward,
    badge: record.badgeReward || null,
    passportStamp: record.passportStampReward || null,
    hiddenReward: record.hiddenReward || null,
    unlockDiscoveryIds: Object.freeze([
      ...record.unlocksDiscoveryIds,
    ]),
    unlockCollectionIds: Object.freeze([
      ...record.unlocksCollectionIds,
    ]),
  })
}

function recommendationFor({
  discoveries,
  collections,
  currentQuest,
  newlyUnlockedItems,
}) {
  const available = discoveries.filter(
    (item) => item.state === DISCOVERY_STATES.AVAILABLE
  )
  const questCandidates = collections
    .filter((item) => item.state === COLLECTION_STATES.IN_PROGRESS)
    .sort(
      (a, b) =>
        b.progressPercent - a.progressPercent ||
        a.displayOrder - b.displayOrder ||
        a.id.localeCompare(b.id)
    )

  for (const quest of questCandidates) {
    const target = quest.nextRequiredDiscoveries
      .map((id) => available.find((item) => item.id === id))
      .find(Boolean)
    if (target) {
      return Object.freeze({
        type: 'discovery',
        discoveryId: target.id,
        collectionId: quest.id,
        title: target.title,
        reason: `Advances ${quest.name}, the nearest collection to completion.`,
        progressImpact: quest.progressPercent,
        urgency: target.availableUntil ? 'time-limited' : 'normal',
        routeTarget: 'discoveries',
      })
    }
  }

  if (currentQuest) {
    return Object.freeze({
      type: 'collection',
      discoveryId: null,
      collectionId: currentQuest.collectionId,
      title: currentQuest.name,
      reason: 'Continue your highest-progress active collection.',
      progressImpact: currentQuest.progress,
      urgency: currentQuest.timeWindow?.availableUntil
        ? 'time-limited'
        : 'normal',
      routeTarget: 'collections',
    })
  }

  const newlyUnlockedDiscovery = newlyUnlockedItems.find(
    (item) =>
      item.type === 'discovery' &&
      available.some((availableItem) => availableItem.id === item.id)
  )
  if (newlyUnlockedDiscovery) {
    const target = available.find(
      (item) => item.id === newlyUnlockedDiscovery.id
    )
    return Object.freeze({
      type: 'discovery',
      discoveryId: target.id,
      collectionId: null,
      title: target.title,
      reason: 'A newly unlocked discovery is ready.',
      progressImpact: 0,
      urgency: target.availableUntil ? 'time-limited' : 'normal',
      routeTarget: 'discoveries',
    })
  }

  const expiring = available
    .filter((item) => item.availableUntil)
    .sort(
      (a, b) =>
        new Date(a.availableUntil).getTime() -
        new Date(b.availableUntil).getTime()
    )[0]
  const target = expiring || available[0]
  return target
    ? Object.freeze({
        type: 'discovery',
        discoveryId: target.id,
        collectionId: null,
        title: target.title,
        reason: expiring
          ? 'This discovery expires soonest.'
          : 'An available festival discovery is ready.',
        progressImpact: 0,
        urgency: expiring ? 'expiring' : 'normal',
        routeTarget: 'discoveries',
      })
    : null
}

export function resolveAdventureState({
  festival = {},
  festivalId: festivalIdInput = null,
  discoveries = [],
  collections = [],
  collectedDiscoveryIds = [],
  collectedIds = [],
  attendeeXp = 0,
  now,
  claimContext = null,
  rewardedSourceKeys = [],
  selectedQuestId = null,
} = {}) {
  const festivalId =
    stringValue(festivalIdInput) ||
    recordFestivalId(festival) ||
    stringValue(festival.id)
  const timezone =
    stringValue(festival.timezone || festival.time_zone) || null
  const currentTime = now instanceof Date ? now : new Date(now)
  const safeNow = Number.isNaN(currentTime.getTime())
    ? new Date('1970-01-01T00:00:00.000Z')
    : currentTime
  const warnings = []
  const invalidDiscoveryIds = new Set()
  const invalidCollectionIds = new Set()
  const missingReferences = []
  const duplicateDiscoveryIds = []
  const duplicateCollectionIds = []
  const discoverySeen = new Set()
  const collectionSeen = new Set()

  const normalizedDiscoveries = (Array.isArray(discoveries)
    ? discoveries
    : []
  ).map((record, index) => {
    const normalized = normalizeDiscoveryRecord(record, festivalId)
    if (!normalized.id) invalidDiscoveryIds.add(`index:${index}`)
    else if (discoverySeen.has(normalized.id)) {
      duplicateDiscoveryIds.push(normalized.id)
      invalidDiscoveryIds.add(normalized.id)
    } else discoverySeen.add(normalized.id)
    if (!normalized.valid && normalized.id) {
      invalidDiscoveryIds.add(normalized.id)
    }
    return normalized
  })
  const normalizedCollections = (Array.isArray(collections)
    ? collections
    : []
  ).map((record, index) => {
    const normalized = normalizeCollectionRecord(record, festivalId)
    if (!normalized.id) invalidCollectionIds.add(`index:${index}`)
    else if (collectionSeen.has(normalized.id)) {
      duplicateCollectionIds.push(normalized.id)
      invalidCollectionIds.add(normalized.id)
    } else collectionSeen.add(normalized.id)
    if (!normalized.valid && normalized.id) {
      invalidCollectionIds.add(normalized.id)
    }
    return normalized
  })

  const validDiscoveryIds = new Set(
    normalizedDiscoveries
      .filter(
        (item) =>
          item.valid && !invalidDiscoveryIds.has(item.id)
      )
      .map((item) => item.id)
  )
  const validCollectionIds = new Set(
    normalizedCollections
      .filter(
        (item) =>
          item.valid && !invalidCollectionIds.has(item.id)
      )
      .map((item) => item.id)
  )
  const collectedSet = new Set(
    [...collectedDiscoveryIds, ...collectedIds].filter((id) =>
      validDiscoveryIds.has(id)
    )
  )

  const graph = new Map()
  for (const discovery of normalizedDiscoveries) {
    const node = `discovery:${discovery.id}`
    for (const id of discovery.prerequisiteDiscoveryIds) {
      addEdge(graph, node, `discovery:${id}`)
      if (!validDiscoveryIds.has(id)) missingReferences.push(`${node}->discovery:${id}`)
    }
    for (const id of discovery.prerequisiteCollectionIds) {
      addEdge(graph, node, `collection:${id}`)
      if (!validCollectionIds.has(id)) missingReferences.push(`${node}->collection:${id}`)
    }
    for (const id of discovery.unlocksDiscoveryIds) {
      addEdge(graph, `discovery:${id}`, node)
      if (!validDiscoveryIds.has(id)) missingReferences.push(`${node}->discovery:${id}`)
    }
    for (const id of discovery.unlocksCollectionIds) {
      addEdge(graph, `collection:${id}`, node)
      if (!validCollectionIds.has(id)) missingReferences.push(`${node}->collection:${id}`)
    }
  }
  for (const collection of normalizedCollections) {
    const node = `collection:${collection.id}`
    for (const id of collection.prerequisiteCollectionIds) {
      addEdge(graph, node, `collection:${id}`)
      if (!validCollectionIds.has(id)) missingReferences.push(`${node}->collection:${id}`)
    }
    for (const id of collection.unlocksDiscoveryIds) {
      addEdge(graph, `discovery:${id}`, node)
      if (!validDiscoveryIds.has(id)) missingReferences.push(`${node}->discovery:${id}`)
    }
    for (const id of collection.unlocksCollectionIds) {
      addEdge(graph, `collection:${id}`, node)
      if (!validCollectionIds.has(id)) missingReferences.push(`${node}->collection:${id}`)
    }
  }
  const cycles = detectCycles(graph)
  for (const node of cycles.cyclicNodes) {
    const separator = node.indexOf(':')
    const type = node.slice(0, separator)
    const id = node.slice(separator + 1)
    if (type === 'discovery') invalidDiscoveryIds.add(id)
    if (type === 'collection') invalidCollectionIds.add(id)
  }
  for (const id of invalidDiscoveryIds) validDiscoveryIds.delete(id)
  for (const id of invalidCollectionIds) validCollectionIds.delete(id)

  const baseCollectionCompletion = new Map()
  for (const collection of normalizedCollections) {
    const completion = completionForCollection(
      collection,
      validDiscoveryIds,
      collectedSet
    )
    if (completion.missingReferenceIds.length) {
      invalidCollectionIds.add(collection.id)
      completion.missingReferenceIds.forEach((id) =>
        missingReferences.push(`collection:${collection.id}->discovery:${id}`)
      )
    }
    baseCollectionCompletion.set(collection.id, completion)
  }

  const completedCollectionIds = new Set()
  let changed = true
  while (changed) {
    changed = false
    for (const collection of normalizedCollections) {
      if (
        invalidCollectionIds.has(collection.id) ||
        completedCollectionIds.has(collection.id) ||
        !baseCollectionCompletion.get(collection.id)?.isComplete
      ) {
        continue
      }
      if (
        collection.prerequisiteCollectionIds.every((id) =>
          completedCollectionIds.has(id)
        )
      ) {
        completedCollectionIds.add(collection.id)
        changed = true
      }
    }
  }

  const inboundDiscoveryUnlocks = new Map()
  const inboundCollectionUnlocks = new Map()
  const addInbound = (map, target, source) => {
    if (!map.has(target)) map.set(target, [])
    map.get(target).push(source)
  }
  for (const discovery of normalizedDiscoveries) {
    discovery.unlocksDiscoveryIds.forEach((id) =>
      addInbound(inboundDiscoveryUnlocks, id, {
        type: 'discovery',
        id: discovery.id,
      })
    )
    discovery.unlocksCollectionIds.forEach((id) =>
      addInbound(inboundCollectionUnlocks, id, {
        type: 'discovery',
        id: discovery.id,
      })
    )
  }
  for (const collection of normalizedCollections) {
    collection.unlocksDiscoveryIds.forEach((id) =>
      addInbound(inboundDiscoveryUnlocks, id, {
        type: 'collection',
        id: collection.id,
      })
    )
    collection.unlocksCollectionIds.forEach((id) =>
      addInbound(inboundCollectionUnlocks, id, {
        type: 'collection',
        id: collection.id,
      })
    )
  }
  const sourceSatisfied = (source) =>
    source.type === 'discovery'
      ? validDiscoveryIds.has(source.id) && collectedSet.has(source.id)
      : completedCollectionIds.has(source.id)

  completedCollectionIds.clear()
  changed = true
  while (changed) {
    changed = false
    for (const collection of normalizedCollections) {
      const inbound = inboundCollectionUnlocks.get(collection.id) || []
      if (
        invalidCollectionIds.has(collection.id) ||
        completedCollectionIds.has(collection.id) ||
        !baseCollectionCompletion.get(collection.id)?.isComplete
      ) {
        continue
      }
      if (
        collection.prerequisiteCollectionIds.every((id) =>
          completedCollectionIds.has(id)
        ) &&
        inbound.every(sourceSatisfied)
      ) {
        completedCollectionIds.add(collection.id)
        changed = true
      }
    }
  }

  const discoveryStates = normalizedDiscoveries.map((discovery) => {
    const window = resolveTimeWindow(discovery, safeNow, timezone)
    const inbound = inboundDiscoveryUnlocks.get(discovery.id) || []
    const prerequisitesMet =
      discovery.prerequisiteDiscoveryIds.every((id) =>
        collectedSet.has(id)
      ) &&
      discovery.prerequisiteCollectionIds.every((id) =>
        completedCollectionIds.has(id)
      ) &&
      inbound.every(sourceSatisfied)
    let state = DISCOVERY_STATES.UNAVAILABLE
    if (
      discovery.valid &&
      !invalidDiscoveryIds.has(discovery.id) &&
      window.valid
    ) {
      if (collectedSet.has(discovery.id)) {
        state = DISCOVERY_STATES.COLLECTED
      } else if (window.expired) {
        state = DISCOVERY_STATES.EXPIRED
      } else if (!prerequisitesMet || window.before) {
        state = discovery.hiddenUntilDiscovered
          ? DISCOVERY_STATES.HIDDEN
          : DISCOVERY_STATES.LOCKED
      } else if (discovery.hiddenUntilDiscovered) {
        state = DISCOVERY_STATES.HIDDEN
      } else {
        state = DISCOVERY_STATES.AVAILABLE
      }
    }
    const hiddenPresentation = state === DISCOVERY_STATES.HIDDEN
    return Object.freeze({
      ...discovery,
      ...(hiddenPresentation
        ? {
            title: null,
            description: '',
            location: null,
            image: null,
            xpReward: 0,
            badgeReward: null,
            passportStampReward: null,
            hiddenReward: null,
          }
        : {}),
      hiddenReward:
        state === DISCOVERY_STATES.COLLECTED
          ? discovery.hiddenReward
          : null,
      state,
      prerequisitesMet,
      timeWindow: Object.freeze({
        availableFrom: discovery.availableFrom,
        availableUntil: discovery.availableUntil,
      }),
    })
  })

  const collectionStates = normalizedCollections.map((collection) => {
    const window = resolveTimeWindow(collection, safeNow, timezone)
    const completion = baseCollectionCompletion.get(collection.id)
    const inbound = inboundCollectionUnlocks.get(collection.id) || []
    const prerequisitesMet =
      collection.prerequisiteCollectionIds.every((id) =>
        completedCollectionIds.has(id)
      ) && inbound.every(sourceSatisfied)
    let state = COLLECTION_STATES.UNAVAILABLE
    if (
      collection.valid &&
      !invalidCollectionIds.has(collection.id) &&
      window.valid
    ) {
      if (completion.isComplete && prerequisitesMet) {
        state = COLLECTION_STATES.COMPLETE
      } else if (window.expired) {
        state = COLLECTION_STATES.EXPIRED
      } else if (!prerequisitesMet || window.before) {
        state = collection.hiddenUntilUnlocked
          ? COLLECTION_STATES.HIDDEN
          : COLLECTION_STATES.LOCKED
      } else {
        state = COLLECTION_STATES.IN_PROGRESS
      }
    }
    const hiddenPresentation = state === COLLECTION_STATES.HIDDEN
    return Object.freeze({
      ...collection,
      ...(hiddenPresentation
        ? {
            name: null,
            description: '',
            story: null,
            xpReward: 0,
            badgeReward: null,
            passportStampReward: null,
            hiddenReward: null,
          }
        : {
            hiddenReward:
              state === COLLECTION_STATES.COMPLETE
                ? collection.hiddenReward
                : null,
          }),
      ...completion,
      isComplete: state === COLLECTION_STATES.COMPLETE,
      state,
      prerequisitesMet,
      nextRequiredDiscoveries: Object.freeze(
        [
          ...collection.requiredDiscoveryIds,
          ...collection.optionalDiscoveryIds,
        ].filter(
          (id) =>
            validDiscoveryIds.has(id) && !collectedSet.has(id)
        )
      ),
      timeWindow: Object.freeze({
        availableFrom: collection.availableFrom,
        availableUntil: collection.availableUntil,
      }),
    })
  })

  const activeQuestCandidates = collectionStates.filter((collection) =>
    collection.state === COLLECTION_STATES.IN_PROGRESS
  )
  const selectedQuest = activeQuestCandidates.find(
    (item) => item.id === selectedQuestId
  )
  const currentQuestRecord =
    selectedQuest ||
    [...activeQuestCandidates].sort(
      (a, b) =>
        b.progressPercent - a.progressPercent ||
        (a.availableUntil ? 0 : 1) - (b.availableUntil ? 0 : 1) ||
        String(a.availableUntil || '').localeCompare(
          String(b.availableUntil || '')
        ) ||
        a.displayOrder - b.displayOrder ||
        a.id.localeCompare(b.id)
    )[0] ||
    null
  const currentQuest = currentQuestRecord
    ? Object.freeze({
        collectionId: currentQuestRecord.id,
        name: currentQuestRecord.name,
        story: currentQuestRecord.story,
        difficulty: currentQuestRecord.difficulty,
        progress: currentQuestRecord.progressPercent,
        nextRequiredDiscoveries:
          currentQuestRecord.nextRequiredDiscoveries,
        rewards: Object.freeze({
          xp: currentQuestRecord.xpReward,
          badge: currentQuestRecord.badgeReward,
          passportStamp: currentQuestRecord.passportStampReward,
          hiddenReward:
            currentQuestRecord.state === COLLECTION_STATES.COMPLETE
              ? currentQuestRecord.hiddenReward
              : null,
        }),
        timeWindow: currentQuestRecord.timeWindow,
        state: currentQuestRecord.state,
      })
    : null

  const newlyCompletedDiscoveryIds = new Set(
    claimContext?.newlyCollectedDiscoveryIds ||
      (claimContext?.sourceType === 'discovery'
        ? [claimContext.sourceId]
        : [])
  )
  const newlyCompletedCollectionIds = new Set(
    claimContext?.newlyCompletedCollectionIds ||
      (claimContext?.sourceType === 'collection'
        ? [claimContext.sourceId]
        : [])
  )
  const newlyUnlockedKeys = new Set()
  const newlyUnlockedItems = []
  const publishUnlocked = (type, id) => {
    const key = `${type}:${id}`
    if (newlyUnlockedKeys.has(key)) return
    const item =
      type === 'discovery'
        ? discoveryStates.find((entry) => entry.id === id)
        : collectionStates.find((entry) => entry.id === id)
    if (
      !item ||
      item.state === DISCOVERY_STATES.UNAVAILABLE ||
      item.state === COLLECTION_STATES.UNAVAILABLE
    ) {
      return
    }
    newlyUnlockedKeys.add(key)
    newlyUnlockedItems.push(
      Object.freeze({
        type,
        id,
        state: item.state,
        title: item.title || item.name,
      })
    )
  }
  normalizedDiscoveries
    .filter((item) => newlyCompletedDiscoveryIds.has(item.id))
    .forEach((item) => {
      item.unlocksDiscoveryIds.forEach((id) =>
        publishUnlocked('discovery', id)
      )
      item.unlocksCollectionIds.forEach((id) =>
        publishUnlocked('collection', id)
      )
    })
  normalizedCollections
    .filter((item) => newlyCompletedCollectionIds.has(item.id))
    .forEach((item) => {
      item.unlocksDiscoveryIds.forEach((id) =>
        publishUnlocked('discovery', id)
      )
      item.unlocksCollectionIds.forEach((id) =>
        publishUnlocked('collection', id)
      )
    })

  const rewardedSet = new Set(rewardedSourceKeys)
  const rewardCandidates = [
    ...discoveryStates
      .filter(
        (item) =>
          item.state === DISCOVERY_STATES.COLLECTED &&
          !rewardedSet.has(`discovery:${item.id}`)
      )
      .map((item) => rewardCandidate('discovery', item)),
    ...collectionStates
      .filter(
        (item) =>
          item.state === COLLECTION_STATES.COMPLETE &&
          !rewardedSet.has(`collection:${item.id}`)
      )
      .map((item) => rewardCandidate('collection', item)),
  ]
  const earnedXpFromContent =
    discoveryStates
      .filter((item) => item.state === DISCOVERY_STATES.COLLECTED)
      .reduce((total, item) => total + item.xpReward, 0) +
    collectionStates
      .filter((item) => item.state === COLLECTION_STATES.COMPLETE)
      .reduce((total, item) => total + item.xpReward, 0)
  const nextRecommendedAction = recommendationFor({
    discoveries: discoveryStates,
    collections: collectionStates,
    currentQuest,
    newlyUnlockedItems,
  })

  if (duplicateDiscoveryIds.length) {
    warnings.push('Duplicate discovery IDs were excluded.')
  }
  if (duplicateCollectionIds.length) {
    warnings.push('Duplicate collection IDs were excluded.')
  }
  if (missingReferences.length) {
    warnings.push('Missing or cross-festival references were ignored.')
  }
  if (cycles.cyclePaths.length) {
    warnings.push('Adventure prerequisite or unlock cycles were excluded.')
  }

  const progression = Object.freeze({
    totalEligibleDiscoveries: discoveryStates.filter((item) =>
      [
        DISCOVERY_STATES.AVAILABLE,
        DISCOVERY_STATES.COLLECTED,
        DISCOVERY_STATES.LOCKED,
        DISCOVERY_STATES.HIDDEN,
        DISCOVERY_STATES.EXPIRED,
      ].includes(item.state)
    ).length,
    collectedDiscoveries: discoveryStates.filter(
      (item) => item.state === DISCOVERY_STATES.COLLECTED
    ).length,
    availableDiscoveries: discoveryStates.filter(
      (item) => item.state === DISCOVERY_STATES.AVAILABLE
    ).length,
    lockedDiscoveries: discoveryStates.filter(
      (item) => item.state === DISCOVERY_STATES.LOCKED
    ).length,
    hiddenDiscoveries: discoveryStates.filter(
      (item) => item.state === DISCOVERY_STATES.HIDDEN
    ).length,
    expiredDiscoveries: discoveryStates.filter(
      (item) => item.state === DISCOVERY_STATES.EXPIRED
    ).length,
    totalEligibleCollections: collectionStates.filter(
      (item) => item.state !== COLLECTION_STATES.UNAVAILABLE
    ).length,
    completedCollections: collectionStates.filter(
      (item) => item.state === COLLECTION_STATES.COMPLETE
    ).length,
    inProgressCollections: collectionStates.filter(
      (item) => item.state === COLLECTION_STATES.IN_PROGRESS
    ).length,
    lockedCollections: collectionStates.filter(
      (item) => item.state === COLLECTION_STATES.LOCKED
    ).length,
    hiddenCollections: collectionStates.filter(
      (item) => item.state === COLLECTION_STATES.HIDDEN
    ).length,
    earnedXpFromContent,
    attendeeXp: Math.max(0, Number(attendeeXp) || 0),
    nextRecommendedAction,
    currentQuest,
    newlyUnlockedItems: Object.freeze(newlyUnlockedItems),
    rewardCandidates: Object.freeze(rewardCandidates),
  })

  return Object.freeze({
    festivalId,
    discoveries: Object.freeze(discoveryStates),
    collections: Object.freeze(collectionStates),
    progression,
    nextRecommendedAction,
    currentQuest,
    newlyUnlockedItems: Object.freeze(newlyUnlockedItems),
    rewardCandidates: Object.freeze(rewardCandidates),
    diagnostics: Object.freeze({
      warnings: Object.freeze(warnings),
      invalidDiscoveryIds: Object.freeze([...invalidDiscoveryIds]),
      invalidCollectionIds: Object.freeze([...invalidCollectionIds]),
      duplicateDiscoveryIds: Object.freeze(duplicateDiscoveryIds),
      duplicateCollectionIds: Object.freeze(duplicateCollectionIds),
      missingReferences: Object.freeze([...new Set(missingReferences)]),
      cyclePaths: Object.freeze(
        cycles.cyclePaths.map((path) => Object.freeze([...path]))
      ),
    }),
  })
}

export function createAdventureState({
  discoveries = [],
  collectedIds = [],
  festivalId = 'edc-las-vegas-2026',
} = {}) {
  const normalizedDiscoveries = normalizeDiscoveries(discoveries, {
    festivalId,
  })
  const collectedSet = new Set(collectedIds)
  const collected = normalizedDiscoveries.filter((item) =>
    collectedSet.has(item.id)
  )
  const locked = normalizedDiscoveries.filter(
    (item) => !collectedSet.has(item.id)
  )
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
