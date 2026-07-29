function strings(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim())
    : []
}

export function adaptPublishedDiscoveryRecord(
  record = {},
  festivalId = ''
) {
  return Object.freeze({
    id: record.id || record.discoveryId || '',
    festivalId:
      record.festivalId || record.festival_id || festivalId,
    editionId:
      record.editionId ||
      record.edition_id ||
      record.festivalId ||
      record.festival_id ||
      festivalId,
    title: record.title || record.name || '',
    description: record.description || '',
    category: record.category || null,
    rarity: record.rarity || null,
    xpReward: Math.max(0, Number(record.xpReward ?? record.xp) || 0),
    active: record.active !== false,
    published:
      record.published === true ||
      String(record.publishStatus || record.status || '').toUpperCase() ===
        'PUBLISHED',
    hiddenUntilDiscovered: Boolean(
      record.hiddenUntilDiscovered || record.hidden
    ),
    prerequisiteDiscoveryIds: strings(
      record.prerequisiteDiscoveryIds
    ),
    prerequisiteCollectionIds: strings(
      record.prerequisiteCollectionIds
    ),
    unlocksDiscoveryIds: strings(record.unlocksDiscoveryIds),
    unlocksCollectionIds: strings(record.unlocksCollectionIds),
    availableFrom: record.availableFrom || null,
    availableUntil: record.availableUntil || null,
    claimMethod: record.claimMethod || null,
    location: record.location || null,
    image: record.image || record.imageReference || null,
    collectionIds: strings(record.collectionIds),
  })
}

export function adaptPublishedCollectionRecord(
  record = {},
  festivalId = ''
) {
  return Object.freeze({
    id: record.id || record.collectionId || '',
    festivalId:
      record.festivalId || record.festival_id || festivalId,
    editionId:
      record.editionId ||
      record.edition_id ||
      record.festivalId ||
      record.festival_id ||
      festivalId,
    name: record.name || record.title || '',
    description: record.description || '',
    story: record.story || null,
    difficulty: record.difficulty || null,
    requiredDiscoveryIds: strings(
      record.requiredDiscoveryIds || record.discoveryIds
    ),
    optionalDiscoveryIds: strings(record.optionalDiscoveryIds),
    minimumRequiredCount: Math.max(
      0,
      Number(record.minimumRequiredCount) || 0
    ),
    xpReward: Math.max(0, Number(record.xpReward ?? record.xp) || 0),
    badgeReward: record.badgeReward || null,
    passportStampReward: record.passportStampReward || null,
    hiddenReward: record.hiddenReward || null,
    unlocksDiscoveryIds: strings(record.unlocksDiscoveryIds),
    unlocksCollectionIds: strings(record.unlocksCollectionIds),
    prerequisiteCollectionIds: strings(
      record.prerequisiteCollectionIds
    ),
    hiddenUntilUnlocked: Boolean(record.hiddenUntilUnlocked),
    active: record.active !== false,
    published:
      record.published === true ||
      String(record.publishStatus || record.status || '').toUpperCase() ===
        'PUBLISHED',
    availableFrom: record.availableFrom || null,
    availableUntil: record.availableUntil || null,
  })
}
