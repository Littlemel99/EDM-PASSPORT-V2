export const FESTIVAL_DIRECTORY_SECTIONS = Object.freeze([
  Object.freeze({ lifecycle: 'live', label: 'LIVE NOW', collapsible: false }),
  Object.freeze({ lifecycle: 'upcoming', label: 'UPCOMING', collapsible: true }),
  Object.freeze({ lifecycle: 'completed', label: 'ATTENDED', collapsible: true }),
  Object.freeze({ lifecycle: 'unavailable', label: 'OTHER FESTIVALS', collapsible: true }),
])

export function getFestivalDirectorySections(
  lifecycleGroups = {},
  expandedSections = {}
) {
  return FESTIVAL_DIRECTORY_SECTIONS.map((section) => {
    const editions = lifecycleGroups[section.lifecycle] || []
    return {
      ...section,
      editions: editions.map((edition) => ({ ...edition })),
      count: editions.length,
      expanded:
        !section.collapsible ||
        Boolean(expandedSections[section.lifecycle]),
    }
  })
}
