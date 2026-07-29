import { useEffect, useMemo, useState } from 'react'
import {
  getTodayKey,
  loadStoredMission,
  MISSION_TARGET,
  saveStoredMission,
} from '../../adventure/DailyMission.js'
import { resolveFestivalId } from '../../services/festivalPersistence.js'

export default function FestivalMissionCard({
  collectedCount,
  festivalId,
  userId,
  ready = false,
}) {
  const [mission, setMission] = useState(null)
  const missionMatchesFestival =
    mission?.festivalId === resolveFestivalId(festivalId)

  // Mission state mirrors the account-scoped local persistence boundary.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready) return

    const today = getTodayKey()
    const storedMission = loadStoredMission(festivalId, localStorage, userId)

    if (storedMission?.date === today) {
      setMission(storedMission)
      return
    }

    const newMission = {
      date: today,
      baselineCollectedCount: collectedCount,
      target: MISSION_TARGET,
      completed: false,
      completedAt: null,
      badge: null,
    }

    setMission(saveStoredMission(newMission, festivalId, localStorage, userId))
  }, [ready, collectedCount, festivalId, userId])

  const progress = useMemo(() => {
    if (!mission || !missionMatchesFestival) return 0

    return Math.min(
      Math.max(
        collectedCount -
          mission.baselineCollectedCount,
        0
      ),
      mission.target
    )
  }, [collectedCount, mission, missionMatchesFestival])

  // Persisting completion intentionally publishes the resulting stored value.
  useEffect(() => {
    if (!mission || !missionMatchesFestival || mission.completed) return
    if (progress < mission.target) return

    const completedMission = {
      ...mission,
      completed: true,
      completedAt: new Date().toISOString(),
      badge: 'Daily Explorer',
    }

    setMission(saveStoredMission(completedMission, festivalId, localStorage, userId))
  }, [festivalId, mission, missionMatchesFestival, progress, userId])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!ready || !mission || !missionMatchesFestival) {
    return (
      <section style={styles.card}>
        <span style={styles.label}>TODAY'S MISSION</span>
        <strong style={styles.title}>
          Preparing your next adventure...
        </strong>
      </section>
    )
  }

  const percent = Math.round(
    (progress / mission.target) * 100
  )

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div>
          <span style={styles.label}>
            TODAY'S MISSION
          </span>

          <strong style={styles.title}>
            Festival Explorer
          </strong>
        </div>

        <span
          style={
            mission.completed
              ? styles.completeBadge
              : styles.activeBadge
          }
        >
          {mission.completed ? 'COMPLETE' : 'ACTIVE'}
        </span>
      </div>

      <p style={styles.description}>
        Collect {mission.target} new festival stamps.
      </p>

      <div style={styles.progressHeader}>
        <span>Mission progress</span>
        <strong>
          {progress} / {mission.target}
        </strong>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percent}%`,
          }}
        />
      </div>

      <div style={styles.reward}>
        <span style={styles.label}>REWARD</span>

        <strong>
          {mission.completed
            ? 'Daily Explorer badge unlocked'
            : 'Daily Explorer badge'}
        </strong>
      </div>

      {mission.completed && (
        <p style={styles.success}>
          Mission complete. Your beta badge is saved
          on this device.
        </p>
      )}
    </section>
  )
}

const styles = {
  card: {
    marginTop: 16,
    padding: 15,
    borderRadius: 16,
    color: '#ffffff',
    background:
      'linear-gradient(145deg, rgba(255,79,216,0.12), rgba(0,245,255,0.08))',
    border: '1px solid rgba(255,79,216,0.3)',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  label: {
    display: 'block',
    marginBottom: 5,
    fontSize: 10,
    letterSpacing: 1.6,
    opacity: 0.65,
  },

  title: {
    display: 'block',
    fontSize: 18,
  },

  description: {
    margin: '12px 0',
    lineHeight: 1.4,
    opacity: 0.82,
  },

  activeBadge: {
    padding: '6px 9px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 900,
    color: '#050512',
    background: '#00f5ff',
  },

  completeBadge: {
    padding: '6px 9px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 900,
    color: '#050512',
    background: '#72ff8f',
  },

  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
    fontSize: 13,
  },

  progressTrack: {
    width: '100%',
    height: 10,
    overflow: 'hidden',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.12)',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
    background:
      'linear-gradient(90deg, #00f5ff, #a855f7, #ff4fd8)',
    transition: 'width 250ms ease',
  },

  reward: {
    marginTop: 14,
    padding: 12,
    borderRadius: 13,
    background: 'rgba(255,255,255,0.06)',
  },

  success: {
    margin: '12px 0 0',
    fontWeight: 800,
    color: '#72ff8f',
  },
}
