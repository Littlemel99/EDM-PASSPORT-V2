import { stamps } from '../data/stamps.js'
import { lostLands2026Discoveries } from './lostLands2026Discoveries.js'

const EDC_FESTIVAL_ID = 'edc-las-vegas-2026'

function cloneDiscovery(discovery) {
  return {
    ...discovery,
    claimMethods: Array.isArray(discovery.claimMethods)
      ? [...discovery.claimMethods]
      : discovery.claimMethods,
  }
}

export function getFestivalDiscoveries(festivalId = '') {
  const discoveries = [
    ...stamps.map((stamp) => ({
      ...stamp,
      festivalId: EDC_FESTIVAL_ID,
    })),
    ...lostLands2026Discoveries,
  ]
  const seen = new Set()

  return discoveries
    .filter(
      (discovery) =>
        !festivalId || discovery.festivalId === festivalId
    )
    .filter((discovery) => {
      if (!discovery.id || seen.has(discovery.id)) return false
      seen.add(discovery.id)
      return true
    })
    .map(cloneDiscovery)
}
