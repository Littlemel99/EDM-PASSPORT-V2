import DiscoveryRadar from './DiscoveryRadar.jsx'
import { resolveMissionControlAdventureData } from './MissionControlAdventureData.js'

export default function MissionControlAdventureGuide({
  adventureState,
  contentState,
  radarDiscovery,
  discoveryLoading,
  radarEmptyReason,
  onOpenDiscovery,
  onOpenDiscoveries,
  onOpenCollections,
  onOpenGuide,
}) {
  const data = resolveMissionControlAdventureData({
    adventureState,
    contentState,
    radarDiscovery,
  })

  if (data.isEmpty) return null

  const openPrimaryAction = () => {
    const action = data.primaryAction || data.fallbackAction
    if (action?.route === 'collections') {
      onOpenCollections?.(action.collectionId)
      return
    }
    if (action?.route === 'discoveries') {
      onOpenDiscoveries?.(action.discoveryId)
      return
    }
    onOpenGuide?.()
  }

  return (
    <section style={styles.guide} aria-labelledby="next-adventure-title">
      <div style={styles.headingRow}>
        <div>
          <span style={styles.eyebrow}>ADVENTURE GUIDANCE</span>
          <h2 id="next-adventure-title" style={styles.title}>
            NEXT ADVENTURE
          </h2>
        </div>
        {data.urgency && (
          <strong style={styles.urgency}>{data.urgency}</strong>
        )}
      </div>

      {data.recommendation ? (
        <article style={styles.recommendation}>
          <strong style={styles.recommendationTitle}>
            {data.recommendation.title}
          </strong>
          <p style={styles.copy}>{data.recommendation.reason}</p>
          {data.recommendation.collectionId && (
            <span style={styles.impact}>
              Quest progress: {data.recommendation.progressImpact}%
            </span>
          )}

          {data.primaryAction?.route === 'radar' ? (
            <DiscoveryRadar
              discovery={radarDiscovery}
              loading={discoveryLoading}
              emptyReason={radarEmptyReason}
              onOpenDiscovery={onOpenDiscovery}
            />
          ) : (
            <button
              type="button"
              style={styles.primary}
              onClick={openPrimaryAction}
            >
              {data.primaryAction?.label || 'VIEW FESTIVAL GUIDE'}
            </button>
          )}
        </article>
      ) : (
        <article style={styles.noAction}>
          <strong>NO ACTIVE ADVENTURE AVAILABLE</strong>
          <p style={styles.copy}>{data.noActionReason}</p>
          <button
            type="button"
            style={styles.primary}
            onClick={openPrimaryAction}
          >
            {data.fallbackAction?.label || 'VIEW FESTIVAL GUIDE'}
          </button>
        </article>
      )}

      <p style={styles.momentum}>
        <strong>MOMENTUM</strong>
        <span>{data.momentum}</span>
      </p>

      {data.currentQuest && (
        <article style={styles.quest}>
          <span style={styles.eyebrow}>CURRENT QUEST</span>
          <h3 style={styles.questTitle}>{data.currentQuest.name}</h3>
          {data.currentQuest.story && (
            <p style={styles.copy}>{data.currentQuest.story}</p>
          )}
          <div style={styles.questMeta}>
            <span>State: {data.currentQuest.state}</span>
            <span>
              Difficulty: {data.currentQuest.difficulty || 'Not specified'}
            </span>
            <span>Progress: {data.currentQuest.progress}%</span>
          </div>
          {data.currentQuest.nextRequiredDiscoveries.length > 0 && (
            <p style={styles.copy}>
              Next required:{' '}
              {data.currentQuest.nextRequiredDiscoveries
                .map((item) => item.title)
                .join(', ')}
            </p>
          )}
          {data.questRewards.length > 0 && (
            <p style={styles.reward}>
              <strong>REWARD ON COMPLETION</strong>
              <span>{data.questRewards.join(' · ')}</span>
            </p>
          )}
          {data.currentQuest.timeWindow?.availableUntil && (
            <p style={styles.copy}>
              Available until{' '}
              {String(data.currentQuest.timeWindow.availableUntil)}
            </p>
          )}
        </article>
      )}

      {data.newlyUnlockedItems.length > 0 && (
        <section style={styles.compactPanel}>
          <h3 style={styles.panelTitle}>NEWLY UNLOCKED</h3>
          {data.newlyUnlockedItems.map((item) => (
            <span key={`${item.type}:${item.id}`}>{item.title}</span>
          ))}
        </section>
      )}

      {data.rewardCandidates.some(
        (candidate) => candidate.rewards.length > 0
      ) && (
        <section style={styles.compactPanel}>
          <h3 style={styles.panelTitle}>REWARD RESULT PREVIEW</h3>
          {data.rewardCandidates.map((candidate) =>
            candidate.rewards.length > 0 ? (
              <span key={`${candidate.sourceType}:${candidate.sourceId}`}>
                {candidate.rewards.join(' · ')}
              </span>
            ) : null
          )}
        </section>
      )}

      {data.progress && (
        <section style={styles.progress} aria-label="Adventure progress">
          <ProgressItem
            label="Discoveries"
            value={`${data.progress.collectedDiscoveries} / ${data.progress.totalEligibleDiscoveries}`}
          />
          <ProgressItem
            label="Collections"
            value={`${data.progress.completedCollections} / ${data.progress.totalEligibleCollections}`}
          />
          <ProgressItem
            label="Published-content XP"
            value={data.progress.earnedXpFromContent}
          />
          {data.progress.lockedDiscoveries > 0 && (
            <ProgressItem
              label="Locked"
              value={data.progress.lockedDiscoveries}
            />
          )}
          {data.progress.hiddenDiscoveries > 0 && (
            <ProgressItem
              label="Hidden"
              value={data.progress.hiddenDiscoveries}
            />
          )}
        </section>
      )}
    </section>
  )
}

function ProgressItem({ label, value }) {
  return (
    <div style={styles.progressItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const styles = {
  guide: {
    minWidth: 0,
    display: 'grid',
    gap: 12,
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    background: 'linear-gradient(145deg,#18251f,#090e0d)',
    border: '1px solid rgba(241,189,99,.32)',
  },
  headingRow: {
    minWidth: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    flexWrap: 'wrap',
    gap: 10,
  },
  eyebrow: {
    color: '#78ffd6',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '.16em',
  },
  title: { margin: '4px 0 0', fontSize: 25 },
  urgency: {
    padding: '6px 9px',
    borderRadius: 999,
    color: '#171109',
    background: '#f1bd63',
    fontSize: 10,
    letterSpacing: '.1em',
  },
  recommendation: { minWidth: 0, display: 'grid', gap: 9 },
  recommendationTitle: {
    fontSize: 'clamp(22px,7vw,32px)',
    overflowWrap: 'normal',
  },
  copy: {
    margin: 0,
    color: 'rgba(255,255,255,.7)',
    lineHeight: 1.5,
  },
  impact: { color: '#f1bd63', fontWeight: 850 },
  primary: {
    minHeight: 48,
    border: 0,
    borderRadius: 12,
    color: '#171109',
    background: '#f1bd63',
    fontWeight: 950,
    cursor: 'pointer',
  },
  noAction: { display: 'grid', gap: 10 },
  momentum: {
    display: 'grid',
    gap: 4,
    margin: 0,
    padding: 11,
    borderRadius: 12,
    background: 'rgba(120,255,214,.07)',
  },
  quest: {
    minWidth: 0,
    display: 'grid',
    gap: 8,
    paddingTop: 12,
    borderTop: '1px solid rgba(255,255,255,.1)',
  },
  questTitle: { margin: 0, fontSize: 20, overflowWrap: 'normal' },
  questMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    gap: 7,
    fontSize: 11,
  },
  reward: {
    display: 'grid',
    gap: 4,
    margin: 0,
    color: '#f1bd63',
  },
  compactPanel: {
    display: 'grid',
    gap: 6,
    padding: 11,
    borderRadius: 12,
    background: 'rgba(255,255,255,.045)',
  },
  panelTitle: { margin: 0, fontSize: 12, letterSpacing: '.12em' },
  progress: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    gap: 7,
  },
  progressItem: {
    minWidth: 0,
    display: 'grid',
    gap: 4,
    padding: 10,
    borderRadius: 11,
    background: 'rgba(255,255,255,.045)',
    fontSize: 11,
    overflowWrap: 'normal',
  },
}
