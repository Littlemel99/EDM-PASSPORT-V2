function clone(value) {
  if (Array.isArray(value)) return value.map(clone)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, clone(item)])
    )
  }
  return value
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

function normalizeProgress(progress = {}) {
  return {
    before: Math.max(0, Number(progress.before) || 0),
    after: Math.max(0, Number(progress.after) || 0),
    total: Math.max(0, Number(progress.total) || 0),
    beforePercent: Math.max(0, Number(progress.beforePercent) || 0),
    afterPercent: Math.max(0, Number(progress.afterPercent) || 0),
  }
}

export function resolveRewardRevealData(
  result,
  { festivalContext = null, currentUserId = null } = {}
) {
  if (!result?.discovery) return null
  if (
    result.userId &&
    currentUserId &&
    result.userId !== currentUserId
  ) return null

  const isNew = Boolean(result.isNew)
  const discovery = clone(result.discovery)
  const discoveryProgress = normalizeProgress(result.discoveryProgress)
  const collectionChanges = (result.collectionChanges || []).reduce(
    (changes, change) => {
      const id = change.collectionId || change.id
      if (!id || changes.some((item) => item.collectionId === id)) {
        return changes
      }
      changes.push({
        collectionId: id,
        name: change.name || 'Collection',
        before: Math.max(0, Number(change.before) || 0),
        after: Math.max(0, Number(change.after) || 0),
        total: Math.max(0, Number(change.total) || 0),
        completedNow: Boolean(change.completedNow),
      })
      return changes
    },
    []
  )
  const completedCollections = collectionChanges.filter(
    (change) => change.completedNow
  )
  const missionProgress = result.missionProgress || null
  const missionChange = missionProgress &&
    Number(missionProgress.previousProgress) !==
      Number(missionProgress.progress)
    ? {
        before: Number(missionProgress.previousProgress) || 0,
        after: Number(missionProgress.progress) || 0,
        target: Number(missionProgress.target) || 0,
        rewardUnlocked: missionProgress.rewardUnlocked || null,
      }
    : null
  const rawAchievement = result.achievementChange
  const achievementChange = rawAchievement &&
    Number(rawAchievement.before) !== Number(rawAchievement.after)
    ? {
        achievement: clone(rawAchievement.achievement),
        before: Number(rawAchievement.before) || 0,
        after: Number(rawAchievement.after) || 0,
        total: Number(rawAchievement.total) || 0,
        unlockedNow: Boolean(rawAchievement.unlockedNow),
      }
    : null

  return deepFreeze({
    state: isNew ? 'NEW_DISCOVERY' : 'ALREADY_DISCOVERED',
    discovery,
    festival: festivalContext ? clone(festivalContext) : {
      editionId: discovery.festivalId || null,
      festivalName: 'Festival Edition',
      year: null,
    },
    rarity: String(discovery.rarity || 'common').toUpperCase(),
    category: String(discovery.category || 'discovery').toUpperCase(),
    xpEarned: isNew ? Math.max(0, Number(result.xpEarned) || 0) : 0,
    isNew,
    duplicate: !isNew,
    discoveryProgress,
    collectionChanges: isNew ? collectionChanges : [],
    completedCollections: isNew ? completedCollections : [],
    completedCollectionCount:
      isNew ? Math.max(0, Number(result.completedCollectionCount) || 0) : 0,
    totalCollections:
      Math.max(0, Number(result.totalCollections) || 0),
    missionChange: isNew ? missionChange : null,
    achievementChange: isNew ? achievementChange : null,
    story:
      discovery.description ||
      'A new festival discovery has been added to your passport.',
    primaryActionLabel: isNew
      ? 'CONTINUE EXPLORING'
      : 'RETURN TO RADAR',
    secondaryActionLabel: isNew ? 'VIEW IN PASSPORT' : null,
  })
}
