const MISSION_STORAGE_KEY = 'edm-daily-festival-mission'

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function loadStoredMission() {
  try {
    const rawMission = localStorage.getItem(MISSION_STORAGE_KEY)
    return rawMission ? JSON.parse(rawMission) : null
  } catch {
    return null
  }
}

export function getDailyMissionClaimProgress(
  previousCollectedCount,
  updatedCollectedCount
) {
  const mission = loadStoredMission()

  if (!mission || mission.date !== getTodayKey()) return null

  const target = Number(mission.target) || 0
  const getProgress = (count) =>
    Math.min(
      Math.max(count - Number(mission.baselineCollectedCount || 0), 0),
      target
    )
  const previousProgress = getProgress(previousCollectedCount)
  const progress = getProgress(updatedCollectedCount)

  return {
    progress,
    target,
    rewardUnlocked:
      !mission.completed &&
      previousProgress < target &&
      progress >= target
        ? mission.badge || 'Daily Explorer'
        : null,
  }
}
