export const FESTIVAL_LIFECYCLES = Object.freeze({
  LIVE: 'live',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  UNAVAILABLE: 'unavailable',
})

const VALID_OVERRIDES = new Set(Object.values(FESTIVAL_LIFECYCLES))

function normalizeDateKey(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day)
  ))
  const key = `${year}-${month}-${day}`
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === key
    ? key
    : null
}

export function getFestivalCalendarDate(
  now = new Date(),
  timezone = null
) {
  const current = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(current.getTime())) return null

  if (!timezone) {
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(current)
    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value])
    )
    return `${values.year}-${values.month}-${values.day}`
  } catch {
    return null
  }
}

export function getFestivalJourneyDay(
  startDate,
  now = new Date(),
  timezone = null
) {
  const startKey = normalizeDateKey(startDate)
  const currentKey = getFestivalCalendarDate(now, timezone)
  if (!startKey || !currentKey) return null

  const start = new Date(`${startKey}T00:00:00Z`)
  const current = new Date(`${currentKey}T00:00:00Z`)
  const elapsed = Math.floor(
    (current.getTime() - start.getTime()) / 86400000
  )
  return elapsed >= 0 ? elapsed + 1 : 0
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

  const startDate = normalizeDateKey(
    festival.start_date || festival.startDate
  )
  const endDate = normalizeDateKey(
    festival.end_date || festival.endDate
  )
  const currentDate = getFestivalCalendarDate(
    now,
    festival.timezone || festival.time_zone || null
  )

  if (
    !startDate ||
    !endDate ||
    !currentDate ||
    endDate < startDate
  ) {
    return FESTIVAL_LIFECYCLES.UNAVAILABLE
  }
  if (currentDate < startDate) return FESTIVAL_LIFECYCLES.UPCOMING
  if (currentDate > endDate) return FESTIVAL_LIFECYCLES.COMPLETED
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
