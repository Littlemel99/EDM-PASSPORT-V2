function getProfileLocation(profile = {}) {
  const cityRegion = [profile.city, profile.region].filter(Boolean).join(', ')
  return [profile.venue, cityRegion].filter(Boolean).join(' — ') || null
}

export function formatFestivalDates(startDate, endDate) {
  if (!startDate) return ''

  const start = new Date(`${startDate}T00:00:00`)
  const end = endDate ? new Date(`${endDate}T00:00:00`) : null
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' })

  if (
    end &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${month.format(start)} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  }

  return start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getFestivalEditionDisplayMetadata({
  edition,
  profile,
  brand,
} = {}) {
  const selectedEdition = edition || profile || null
  if (!selectedEdition) return null
  const startDate =
    selectedEdition.start_date ||
    selectedEdition.startDate ||
    profile?.startDate ||
    null

  return {
    brandName:
      brand?.name ||
      selectedEdition.brandName ||
      profile?.shortName ||
      selectedEdition.shortName ||
      selectedEdition.name ||
      '',
    editionName:
      selectedEdition.displayName ||
      profile?.displayName ||
      selectedEdition.name ||
      '',
    year:
      selectedEdition.year ||
      profile?.year ||
      (startDate ? Number(String(startDate).slice(0, 4)) : null),
    location:
      selectedEdition.location ||
      getProfileLocation(selectedEdition) ||
      getProfileLocation(profile) ||
      null,
    startDate,
    endDate:
      selectedEdition.end_date ||
      selectedEdition.endDate ||
      profile?.endDate ||
      null,
    themeName:
      selectedEdition.theme?.name ||
      profile?.theme?.name ||
      null,
  }
}
