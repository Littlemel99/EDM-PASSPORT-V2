export const FESTIVAL_DIRECTORY_SECTIONS = Object.freeze([
  Object.freeze({ lifecycle: 'live', label: 'LIVE NOW', collapsible: false }),
  Object.freeze({ lifecycle: 'upcoming', label: 'UPCOMING', collapsible: true }),
  Object.freeze({ lifecycle: 'completed', label: 'ATTENDED', collapsible: true }),
  Object.freeze({ lifecycle: 'unavailable', label: 'OTHER FESTIVALS', collapsible: true }),
])

export function getFestivalDirectorySections(
  lifecycleGroups = {},
  expandedSections = {},
  attendedFestivalIds = []
) {
  const attendedIdSet = new Set(attendedFestivalIds)

  return FESTIVAL_DIRECTORY_SECTIONS.map((section) => {
    const lifecycleEditions =
      lifecycleGroups[section.lifecycle] || []
    const editions =
      section.lifecycle === 'completed'
        ? lifecycleEditions.filter((edition) =>
            attendedIdSet.has(edition.id)
          )
        : lifecycleEditions
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
