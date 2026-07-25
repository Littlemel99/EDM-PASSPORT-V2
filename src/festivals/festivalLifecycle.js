export const FESTIVAL_LIFECYCLES = Object.freeze({
  LIVE: 'live',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  UNAVAILABLE: 'unavailable',
})

const VALID_OVERRIDES = new Set(Object.values(FESTIVAL_LIFECYCLES))

function localDate(value, endOfDay = false) {
  if (!value) return null
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  )
  return Number.isNaN(date.getTime()) ? null : date
}

export function resolveFestivalLifecycle(
  festival = {},
  now = new Date(),
  statusOverride = null
) {
  const explicitOverride =
    statusOverride ||
    festival.lifecycleStatus ||
    festival.lifecycle_status ||
    festival.statusOverride ||
    festival.status_override ||
    (['live', 'completed', 'attended'].includes(festival.status)
      ? festival.status
      : null)

  if (VALID_OVERRIDES.has(explicitOverride)) {
    return explicitOverride
  }
  if (explicitOverride === 'attended') {
    return FESTIVAL_LIFECYCLES.COMPLETED
  }

  const startDate = localDate(
    festival.start_date || festival.startDate
  )
  const endDate = localDate(
    festival.end_date || festival.endDate,
    true
  )
  const current = now instanceof Date ? now : new Date(now)

  if (
    !startDate ||
    !endDate ||
    Number.isNaN(current.getTime()) ||
    endDate < startDate
  ) {
    return FESTIVAL_LIFECYCLES.UNAVAILABLE
  }
  if (current < startDate) return FESTIVAL_LIFECYCLES.UPCOMING
  if (current > endDate) return FESTIVAL_LIFECYCLES.COMPLETED
  return FESTIVAL_LIFECYCLES.LIVE
}

export function groupFestivalsByLifecycle(
  festivals = [],
  now = new Date()
) {
  const groups = {
    live: [],
    upcoming: [],
    completed: [],
    unavailable: [],
  }

  festivals.forEach((festival) => {
    const lifecycle = resolveFestivalLifecycle(festival, now)
    groups[lifecycle].push({ ...festival, lifecycle })
  })

  return Object.fromEntries(
    Object.entries(groups).map(([key, records]) => [
      key,
      records.map((record) => ({ ...record })),
    ])
  )
}

export function getFestivalLifecycleAction(lifecycle) {
  if (lifecycle === FESTIVAL_LIFECYCLES.LIVE) {
    return 'ENTER FESTIVAL'
  }
  if (lifecycle === FESTIVAL_LIFECYCLES.COMPLETED) {
    return 'VIEW RECAP'
  }
  return 'VIEW FESTIVAL'
}
