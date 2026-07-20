import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_RARITIES,
  DISCOVERY_VISIBILITY,
} from './constants.js'

const LEGACY_RARITY_MAP = Object.freeze({
  normal: DISCOVERY_RARITIES.COMMON,
  common: DISCOVERY_RARITIES.COMMON,
  'stage drop': DISCOVERY_RARITIES.RARE,
  rare: DISCOVERY_RARITIES.RARE,
  epic: DISCOVERY_RARITIES.EPIC,
  'founder drop': DISCOVERY_RARITIES.LEGENDARY,
  legendary: DISCOVERY_RARITIES.LEGENDARY,
  'legendary hidden drop': DISCOVERY_RARITIES.LEGENDARY,
  mythic: DISCOVERY_RARITIES.MYTHIC,
  hidden: DISCOVERY_RARITIES.EPIC,
  secret: DISCOVERY_RARITIES.EPIC,
  'secret drop': DISCOVERY_RARITIES.EPIC,
})

function clean(value) {
  return String(value || '').trim().toLowerCase()
}

export function normalizeRarity(discovery = {}) {
  const raw = clean(discovery.rarity)

  if (LEGACY_RARITY_MAP[raw]) return LEGACY_RARITY_MAP[raw]
  if (discovery.glow === 'legendary') return DISCOVERY_RARITIES.LEGENDARY
  if (discovery.glow === 'rare') return DISCOVERY_RARITIES.RARE

  const xp = Number(discovery.xp) || 0
  if (xp >= 1500) return DISCOVERY_RARITIES.MYTHIC
  if (xp >= 1000) return DISCOVERY_RARITIES.LEGENDARY
  if (xp >= 750) return DISCOVERY_RARITIES.EPIC
  if (xp >= 250) return DISCOVERY_RARITIES.RARE
  return DISCOVERY_RARITIES.COMMON
}

export function normalizeVisibility(discovery = {}) {
  const raw = clean(discovery.rarity)

  if (discovery.isSecret || discovery.is_secret || raw.includes('secret')) {
    return DISCOVERY_VISIBILITY.SECRET
  }

  if (discovery.hidden || discovery.is_hidden || raw.includes('hidden')) {
    return DISCOVERY_VISIBILITY.HIDDEN
  }

  return DISCOVERY_VISIBILITY.VISIBLE
}

export function inferCategory(discovery = {}) {
  const haystack = clean(
    `${discovery.id} ${discovery.name} ${discovery.location} ${discovery.category}`
  )

  if (haystack.includes('artist')) return DISCOVERY_CATEGORIES.ARTIST
  if (haystack.includes('crew') || haystack.includes('family')) return DISCOVERY_CATEGORIES.CREW
  if (haystack.includes('quest') || haystack.includes('mission')) return DISCOVERY_CATEGORIES.QUEST
  if (haystack.includes('memory') || haystack.includes('photo')) return DISCOVERY_CATEGORIES.MEMORY

  if (
    haystack.includes('stage') ||
    haystack.includes('field') ||
    haystack.includes('grounds') ||
    haystack.includes('meadow') ||
    haystack.includes('basspod') ||
    haystack.includes('garden') ||
    haystack.includes('valley') ||
    haystack.includes('bloom') ||
    haystack.includes('jungle') ||
    haystack.includes('wasteland')
  ) {
    return DISCOVERY_CATEGORIES.STAGE
  }

  return DISCOVERY_CATEGORIES.SPECIAL
}

export function normalizeDiscovery(discovery = {}, options = {}) {
  const legacyRarity = discovery.rarity || 'normal'
  const rarity = normalizeRarity(discovery)
  const visibility = normalizeVisibility(discovery)
  const category = discovery.category || inferCategory(discovery)
  const xp = Math.max(0, Number(discovery.xp) || 100)

  return {
    ...discovery,
    discoveryId: discovery.discoveryId || discovery.id,
    festivalId:
      discovery.festivalId ||
      discovery.festival_id ||
      options.festivalId ||
      'edc-las-vegas-2026',
    category,
    rarity,
    legacyRarity,
    visibility,
    xp,
    isSecret:
      discovery.isSecret ||
      discovery.is_secret ||
      visibility === DISCOVERY_VISIBILITY.SECRET,
    hidden:
      discovery.hidden ||
      discovery.is_hidden ||
      visibility !== DISCOVERY_VISIBILITY.VISIBLE,
    glow:
      discovery.glow ||
      (rarity === DISCOVERY_RARITIES.LEGENDARY ||
      rarity === DISCOVERY_RARITIES.MYTHIC
        ? 'legendary'
        : rarity === DISCOVERY_RARITIES.RARE ||
          rarity === DISCOVERY_RARITIES.EPIC
          ? 'rare'
          : undefined),
  }
}

export function normalizeDiscoveries(discoveries = [], options = {}) {
  const seen = new Set()

  return discoveries
    .filter(Boolean)
    .map((discovery) => normalizeDiscovery(discovery, options))
    .filter((discovery) => {
      if (!discovery.id || seen.has(discovery.id)) return false
      seen.add(discovery.id)
      return true
    })
}

export function isHiddenDiscovery(discovery = {}) {
  const normalized = normalizeDiscovery(discovery)
  return normalized.visibility !== DISCOVERY_VISIBILITY.VISIBLE
}

export function getDiscoveryRarity(discovery = {}) {
  return normalizeRarity(discovery)
}
