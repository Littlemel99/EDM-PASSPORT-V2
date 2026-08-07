const SAFE_ROUTES = new Set(['discoveries', 'collections'])

function safeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function rewardParts(reward = {}) {
  return [
    safeNumber(reward.xp) > 0 ? `+${safeNumber(reward.xp)} XP` : null,
    reward.badge ? `${reward.badge} badge` : null,
    reward.passportStamp ? `${reward.passportStamp} passport stamp` : null,
    reward.hiddenReward ? 'Secret reward' : null,
  ].filter(Boolean)
}

function safeUnlock(item = {}) {
  const state = String(item.state || '').toUpperCase()
  return {
    type: item.type === 'collection' ? 'collection' : 'discovery',
    id: item.id || null,
    state,
    title:
      state === 'HIDDEN'
        ? 'Mystery unlock'
        : item.title || 'New festival content',
  }
}

function resolvePrimaryAction(recommendation, radarDiscovery) {
  if (!recommendation) return null
  if (
    recommendation.type === 'discovery' &&
    recommendation.discoveryId &&
    radarDiscovery?.id === recommendation.discoveryId
  ) {
    return {
      label: 'OPEN RADAR',
      route: 'radar',
      discoveryId: recommendation.discoveryId,
      collectionId: recommendation.collectionId || null,
    }
  }
  const route = SAFE_ROUTES.has(recommendation.routeTarget)
    ? recommendation.routeTarget
    : recommendation.type === 'collection'
      ? 'collections'
      : 'discoveries'
  return {
    label:
      route === 'collections' ? 'VIEW COLLECTION' : 'VIEW DISCOVERY',
    route,
    discoveryId: recommendation.discoveryId || null,
    collectionId: recommendation.collectionId || null,
  }
}

function resolveMomentum({ recommendation, quest, newlyUnlockedItems }) {
  if (newlyUnlockedItems.length > 0) {
    return 'A new adventure has unlocked.'
  }
  if (recommendation?.urgency === 'expiring') {
    return 'This discovery has a real availability window and expires soonest.'
  }
  const remaining = quest?.nextRequiredDiscoveries?.length || 0
  if (remaining === 1) {
    return 'One discovery away from completing this collection.'
  }
  if (remaining > 1) {
    return `${remaining} discoveries remain in this quest.`
  }
  if (recommendation) {
    return 'Your next festival adventure is ready.'
  }
  return 'No active adventure is currently available.'
}

function resolveQuest(adventureState, empty) {
  if (empty || !adventureState?.currentQuest) return null
  const quest = adventureState.currentQuest
  const discoveryById = new Map(
    (adventureState.discoveries || []).map((item) => [item.id, item])
  )
  return {
    ...quest,
    nextRequiredDiscoveries: (
      quest.nextRequiredDiscoveries || []
    ).map((id) => {
      const discovery = discoveryById.get(id)
      return {
        id,
        state: discovery?.state || 'UNAVAILABLE',
        title:
          discovery?.state === 'HIDDEN'
            ? 'Mystery discovery'
            : discovery?.title || discovery?.name || 'Unavailable discovery',
      }
    }),
  }
}

export function resolveMissionControlAdventureData({
  adventureState,
  contentState,
  radarDiscovery = null,
} = {}) {
  const empty = Boolean(contentState?.isEmpty)
  const progression = adventureState?.progression || null
  const recommendation = empty
    ? null
    : adventureState?.nextRecommendedAction || null
  const quest = resolveQuest(adventureState, empty)
  const newlyUnlockedItems = empty
    ? []
    : (adventureState?.newlyUnlockedItems || []).map(safeUnlock)
  const rewardCandidates = empty
    ? []
    : (adventureState?.rewardCandidates || []).map((candidate) => ({
        sourceType: candidate.sourceType,
        sourceId: candidate.sourceId,
        rewards: rewardParts(candidate),
      }))
  const questRewards = rewardParts(quest?.rewards)
  const primaryAction = resolvePrimaryAction(
    recommendation,
    radarDiscovery
  )
  const fallbackAction =
    !empty && !recommendation
      ? progression?.totalEligibleCollections > 0
        ? { label: 'VIEW COLLECTIONS', route: 'collections' }
        : progression?.totalEligibleDiscoveries > 0
          ? { label: 'VIEW DISCOVERIES', route: 'discoveries' }
          : { label: 'VIEW FESTIVAL GUIDE', route: 'guide' }
      : null
  const urgency =
    recommendation?.urgency === 'expiring'
      ? 'ENDS SOON'
      : recommendation?.urgency === 'time-limited'
        ? 'AVAILABLE NOW'
        : null

  return Object.freeze({
    isEmpty: empty,
    recommendation,
    primaryAction,
    fallbackAction,
    currentQuest: quest,
    momentum: resolveMomentum({
      recommendation,
      quest,
      newlyUnlockedItems,
    }),
    urgency,
    questRewards: Object.freeze(questRewards),
    newlyUnlockedItems: Object.freeze(newlyUnlockedItems),
    rewardCandidates: Object.freeze(rewardCandidates),
    progress: !empty && progression
      ? Object.freeze({
          collectedDiscoveries: safeNumber(
            progression.collectedDiscoveries
          ),
          totalEligibleDiscoveries: safeNumber(
            progression.totalEligibleDiscoveries
          ),
          completedCollections: safeNumber(
            progression.completedCollections
          ),
          totalEligibleCollections: safeNumber(
            progression.totalEligibleCollections
          ),
          earnedXpFromContent: safeNumber(
            progression.earnedXpFromContent
          ),
          lockedDiscoveries: safeNumber(
            progression.lockedDiscoveries
          ),
          hiddenDiscoveries: safeNumber(
            progression.hiddenDiscoveries
          ),
        })
      : null,
    noActionReason:
      !empty && !recommendation
        ? progression?.availableDiscoveries === 0
          ? 'No published discovery is currently available.'
          : 'No active adventure recommendation is available.'
        : null,
  })
}
