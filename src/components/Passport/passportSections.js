export const PASSPORT_SECTION_PAGE_INDEX = Object.freeze({
  cover: 15,
  journey: 16,
  discoveries: 1,
  collections: 13,
  memories: 17,
  festival: 18,
  export: 12,
  admin: 14,
})

const NORMAL_SECTIONS = Object.freeze([
  Object.freeze({ id: 'cover', label: 'Cover', pageIndex: PASSPORT_SECTION_PAGE_INDEX.cover }),
  Object.freeze({ id: 'journey', label: 'Journey', pageIndex: PASSPORT_SECTION_PAGE_INDEX.journey }),
  Object.freeze({ id: 'discoveries', label: 'Discoveries', pageIndex: PASSPORT_SECTION_PAGE_INDEX.discoveries }),
  Object.freeze({ id: 'collections', label: 'Collections', pageIndex: PASSPORT_SECTION_PAGE_INDEX.collections }),
  Object.freeze({ id: 'memories', label: 'Memories', pageIndex: PASSPORT_SECTION_PAGE_INDEX.memories }),
  Object.freeze({ id: 'festival', label: 'Festival', pageIndex: PASSPORT_SECTION_PAGE_INDEX.festival }),
  Object.freeze({ id: 'export', label: 'Export', pageIndex: PASSPORT_SECTION_PAGE_INDEX.export }),
])

const ADMIN_SECTION = Object.freeze({ id: 'admin', label: 'Admin', pageIndex: PASSPORT_SECTION_PAGE_INDEX.admin })

export const HIDDEN_LEGACY_PAGE_INDICES = Object.freeze([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])

export const DASHBOARD_PASSPORT_TARGETS = Object.freeze({
  passport: 'journey',
  collections: 'collections',
  memories: 'memories',
  recentDiscovery: 'discoveries',
  rewardDiscovery: 'discoveries',
})

function cloneSection(section) {
  return { ...section }
}

export function getVisiblePassportSections(isAdmin = false) {
  return [...NORMAL_SECTIONS, ...(isAdmin ? [ADMIN_SECTION] : [])].map(cloneSection)
}

export function getPassportSectionByPageIndex(sections, pageIndex) {
  const section = sections.find((item) => item.pageIndex === pageIndex)
  return section ? cloneSection(section) : null
}

export function getPassportSectionById(sections, sectionId) {
  const section = sections.find((item) => item.id === sectionId)
  return section ? cloneSection(section) : null
}

export function getAdjacentPassportSection(sections, sectionId, direction) {
  const index = sections.findIndex((section) => section.id === sectionId)
  if (index < 0) return null
  const nextIndex = Math.min(Math.max(index + (direction === 'previous' ? -1 : 1), 0), sections.length - 1)
  return cloneSection(sections[nextIndex])
}

export function preserveVisibleSection(sections, sectionId) {
  return getPassportSectionById(sections, sectionId) || getPassportSectionById(sections, 'cover')
}

export function isHiddenLegacyPage(pageIndex) {
  return HIDDEN_LEGACY_PAGE_INDICES.includes(pageIndex)
}

export function getFestivalScopedMemories(memories = [], discoveries = []) {
  const discoveryIds = new Set(discoveries.map((discovery) => discovery.id))
  return memories.filter((memory) => discoveryIds.has(memory.stamp_id)).map((memory) => ({ ...memory }))
}
