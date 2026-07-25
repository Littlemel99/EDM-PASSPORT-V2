import {
  isHiddenDiscovery,
  normalizeDiscovery,
} from '../../adventure/DiscoveryEngine.js'

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getDiscoveryRadarDisplay(discovery = {}) {
  const normalized = normalizeDiscovery(discovery)
  const configuredVisibility = String(
    discovery.visibility || ''
  ).toLowerCase()
  const restricted =
    ['hidden', 'secret'].includes(configuredVisibility) ||
    isHiddenDiscovery(normalized)

  if (restricted) {
    return Object.freeze({
      discoveryId: normalized.id || null,
      restricted: true,
      title: 'Mystery Discovery',
      location: 'Location restricted',
      metadata: 'Details restricted',
      rarityLabel: null,
      categoryLabel: null,
    })
  }

  const rarityLabel = titleCase(normalized.rarity || 'common')
  const categoryLabel = titleCase(
    normalized.category || 'festival discovery'
  )

  return Object.freeze({
    discoveryId: normalized.id || null,
    restricted: false,
    title: normalized.name || 'Festival Discovery',
    location:
      normalized.location || 'Explore the active festival area',
    metadata: `${rarityLabel} • ${categoryLabel}`,
    rarityLabel,
    categoryLabel,
  })
}
