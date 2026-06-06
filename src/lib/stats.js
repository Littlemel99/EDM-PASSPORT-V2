export function getStats(collected, totalStampCount = 12) {
  const totalXp = collected.reduce((sum, stamp) => sum + (stamp.xp || 100), 0)

  const completion = totalStampCount
    ? Math.round((collected.length / totalStampCount) * 100)
    : 0

  const legendary = collected.filter((stamp) => stamp.glow === 'legendary').length
  const secret = collected.filter((stamp) => stamp.isSecret).length

  const score = collected.reduce((sum, stamp) => {
    if (stamp.glow === 'legendary') return sum + 50
    if (stamp.isSecret) return sum + 30
    if (stamp.glow === 'rare') return sum + 10
    return sum + 5
  }, 0)

  const level =
    totalXp >= 3000
      ? 'Festival Legend'
      : totalXp >= 1500
        ? 'EDC Veteran'
        : totalXp >= 500
          ? 'Stage Collector'
          : 'Passport Rookie'

  return {
    totalXp,
    completion,
    legendary,
    secret,
    score,
    level,
  }
}

export function getAchievements(collected) {
  const ids = collected.map((stamp) => stamp.id)

  return [
    {
      icon: '⚡',
      name: 'FIRST DROP FOUND',
      unlocked: collected.length >= 1,
    },
    {
      icon: '🎡',
      name: 'STAGE COLLECTOR',
      unlocked: collected.length >= 4,
    },
    {
      icon: '🔊',
      name: 'BASSHEAD',
      unlocked: ids.includes('basspod'),
    },
    {
      icon: '🌀',
      name: 'TRANCE TRAVELER',
      unlocked: ids.includes('quantum-valley'),
    },
    {
      icon: '🕵️',
      name: 'HIDDEN HUNTER',
      unlocked: collected.some((stamp) => stamp.isSecret),
    },
    {
      icon: '🌅',
      name: 'LEGENDARY COLLECTOR',
      unlocked: collected.some((stamp) => stamp.glow === 'legendary'),
    },
  ]
}
