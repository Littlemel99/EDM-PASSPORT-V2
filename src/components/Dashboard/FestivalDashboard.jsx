import FestivalMissionCard from './FestivalMissionCard.jsx'
import DiscoveryRadar from './DiscoveryRadar.jsx'

export default function FestivalDashboard({
  displayName,
  country,
  collectedCount,
  totalCount,
  collectionPercent,
  totalXp,
  rank,
  crewName,
  festivalName,
  festivalId,
  nextDiscovery,
  discoveryLoading,
  developerMode = false,
  previousDiscovery,
  onRepeatPreviousDiscovery,
  onOpenPassport,
  onOpenDiscovery,
  onEditPassport,
  onSignOut,
  missionReady,
}) {
  return (
    <section style={styles.dashboard}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>WELCOME BACK</p>
          <h2 style={styles.name}>{displayName}</h2>
          <p style={styles.identity}>
            {country || 'Country not selected'} Passport
          </p>
        </div>

        <div style={styles.rankBadge}>
          <strong>{rank || 1}</strong>
          <span>RANK</span>
        </div>
      </div>

      <div style={styles.festivalCard}>
        <span style={styles.cardLabel}>CURRENT FESTIVAL</span>
        <strong style={styles.festivalName}>
          {festivalName || 'Choose your next festival'}
        </strong>
      </div>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <strong>{collectedCount}</strong>
          <span>STAMPS</span>
        </div>

        <div style={styles.statCard}>
          <strong>{totalXp || 0}</strong>
          <span>XP</span>
        </div>

        <div style={styles.statCard}>
          <strong>{crewName || 'SOLO'}</strong>
          <span>CREW</span>
        </div>
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span>Passport Progress</span>
          <strong>
            {collectedCount} / {totalCount}
          </strong>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.min(
                Math.max(collectionPercent || 0, 0),
                100
              )}%`,
            }}
          />
        </div>

        <small>{collectionPercent || 0}% discovered</small>
      </div>

      <div style={styles.objectiveCard}>
        <span style={styles.cardLabel}>NEXT OBJECTIVE</span>

        {discoveryLoading ? (
          <>
            <strong style={styles.objectiveTitle}>
              Finding a live target
            </strong>
            <p style={styles.objectiveText}>
              Loading discovery data for the selected festival.
            </p>
          </>
        ) : nextDiscovery ? (
          <>
            <strong style={styles.objectiveTitle}>
              Discover {nextDiscovery.name}
            </strong>
            <p style={styles.objectiveText}>
              {nextDiscovery.location ||
                'Explore the festival to find your next stamp.'}
            </p>
          </>
        ) : (
          <>
            <strong style={styles.objectiveTitle}>
              Collection complete
            </strong>
            <p style={styles.objectiveText}>
              You have discovered every currently available stamp.
            </p>
          </>
        )}
      </div>

      <DiscoveryRadar
        discovery={nextDiscovery}
        loading={discoveryLoading}
        onOpenDiscovery={onOpenDiscovery}
      />

      {developerMode && previousDiscovery && (
        <button
          type="button"
          style={styles.developerButton}
          onClick={onRepeatPreviousDiscovery}
        >
          REPEAT PREVIOUS DISCOVERY
        </button>
      )}

      <FestivalMissionCard
        collectedCount={collectedCount}
        festivalId={festivalId}
        ready={missionReady}
      />

      <div style={styles.actionGrid}>
        <button
          type="button"
          style={styles.openButton}
          onClick={onOpenPassport}
        >
          OPEN MY PASSPORT
        </button>

        <button
          type="button"
          style={styles.editButton}
          onClick={onEditPassport}
        >
          EDIT PASSPORT
        </button>

        <button
          type="button"
          style={styles.signOutButton}
          onClick={onSignOut}
        >
          SIGN OUT
        </button>
      </div>
    </section>
  )
}

const styles = {
  dashboard: {
    width: '100%',
    boxSizing: 'border-box',
    margin: '18px 0',
    padding: 18,
    borderRadius: 22,
    color: '#ffffff',
    background:
      'linear-gradient(145deg, rgba(29,12,65,0.98), rgba(5,15,38,0.98))',
    border: '1px solid rgba(141, 92, 246, 0.55)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
  },

  developerButton: {
    width: '100%',
    marginTop: 12,
    padding: '11px 14px',
    borderRadius: 12,
    border: '1px dashed rgba(255,196,0,0.65)',
    color: '#ffd666',
    background: 'rgba(255,196,0,0.08)',
    fontWeight: 900,
    cursor: 'pointer',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  eyebrow: {
    margin: 0,
    fontSize: 11,
    letterSpacing: 2,
    opacity: 0.7,
  },

  name: {
    margin: '4px 0',
    fontSize: 26,
  },

  identity: {
    margin: 0,
    opacity: 0.75,
  },

  rankBadge: {
    minWidth: 64,
    minHeight: 64,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
  },

  festivalCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.08)',
  },

  cardLabel: {
    display: 'block',
    fontSize: 10,
    letterSpacing: 1.6,
    opacity: 0.65,
    marginBottom: 6,
  },

  festivalName: {
    fontSize: 18,
  },

  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
    marginTop: 12,
  },

  statCard: {
    minHeight: 70,
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 8,
    background: 'rgba(255,255,255,0.07)',
  },

  progressSection: {
    marginTop: 16,
  },

  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
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

  objectiveCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 16,
    background: 'rgba(0,245,255,0.08)',
    border: '1px solid rgba(0,245,255,0.25)',
  },

  objectiveTitle: {
    display: 'block',
    fontSize: 17,
  },

  objectiveText: {
    margin: '6px 0 0',
    lineHeight: 1.4,
    opacity: 0.8,
  },

  actionGrid: {
    display: 'grid',
    gap: 10,
    marginTop: 16,
  },

  openButton: {
    width: '100%',
    padding: '14px 16px',
    border: 0,
    borderRadius: 14,
    fontWeight: 900,
    cursor: 'pointer',
    color: '#090512',
    background:
      'linear-gradient(90deg, #00f5ff, #c084fc, #ff4fd8)',
  },

  editButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 14,
    fontWeight: 800,
    cursor: 'pointer',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.22)',
  },

  signOutButton: {
    width: '100%',
    padding: '11px 16px',
    borderRadius: 14,
    fontWeight: 800,
    cursor: 'pointer',
    color: '#ffffff',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.14)',
  },
}
