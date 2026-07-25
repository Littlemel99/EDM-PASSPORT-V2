import FestivalMissionCard from './FestivalMissionCard.jsx'
import DiscoveryRadar from './DiscoveryRadar.jsx'
import {
  getExplorerRank,
  getJourneyDay,
} from './FestivalDashboardData.js'
import { PageIdentity } from '../Festival/index.js'

export default function FestivalDashboard({
  collectedCount,
  totalCount,
  collectionPercent,
  collectionsCompleted = 0,
  collectionsTotal = 0,
  festivalStartDate,
  festivalId,
  lifecycle = 'live',
  nextDiscovery,
  discoveryLoading,
  radarEmptyReason,
  developerMode = false,
  previousDiscovery,
  crewName,
  memoriesCount = 0,
  onRepeatPreviousDiscovery,
  onOpenPassport,
  onOpenMemories,
  onOpenDiscovery,
  onEditPassport,
  onChangeFestival,
  missionReady,
  missionUserId,
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
}) {
  const explorerRank = getExplorerRank(collectedCount)
  const journeyDay = getJourneyDay(festivalStartDate)
  const safePercent = Math.min(
    Math.max(collectionPercent || 0, 0),
    100
  )

  return (
    <section style={styles.dashboard}>
      <PageIdentity
        pageName="DASHBOARD"
        activeFestival={activeFestival}
        activeFestivalProfile={activeFestivalProfile}
        activeFestivalBrand={activeFestivalBrand}
        activeFestivalDisplay={activeFestivalDisplay}
        variant="dashboard"
      />

      <section style={styles.missionHeader} aria-label="Journey status">
        <StatusItem
          label="JOURNEY DAY"
          value={
            journeyDay === null
              ? 'Unavailable'
              : journeyDay === 0
                ? 'Not started'
                : `Day ${journeyDay}`
          }
        />
        <StatusItem label="EXPLORER RANK" value={explorerRank.name} />
        <StatusItem label="LIFECYCLE" value={lifecycle.toUpperCase()} />
      </section>

      <section style={styles.targetSection}>
        <h2 style={styles.targetTitle}>NEXT TARGET</h2>
        <DiscoveryRadar
          discovery={nextDiscovery}
          loading={discoveryLoading}
          emptyReason={radarEmptyReason}
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
      </section>

      <section style={styles.cardGrid} aria-label="Mission control">
        <article style={styles.card}>
          <span style={styles.label}>PROGRESS</span>
          <strong style={styles.cardValue}>{safePercent}%</strong>
          <ProgressBar percent={safePercent} />
          <p style={styles.cardText}>
            {collectedCount} / {totalCount} discoveries ·{' '}
            {collectionsCompleted} / {collectionsTotal} collections
          </p>
        </article>

        <FestivalMissionCard
          collectedCount={collectedCount}
          festivalId={festivalId}
          userId={missionUserId}
          ready={missionReady}
        />

        <article style={styles.card}>
          <span style={styles.label}>CREW</span>
          <strong style={styles.cardTitle}>
            {crewName || 'Solo Explorer'}
          </strong>
          <p style={styles.cardText}>
            Your active festival crew.
          </p>
        </article>

        <article style={styles.card}>
          <span style={styles.label}>PASSPORT</span>
          <strong style={styles.cardTitle}>Your permanent record</strong>
          <button
            type="button"
            style={styles.primaryButton}
            aria-label="Open festival passport"
            onClick={onOpenPassport}
          >
            OPEN PASSPORT
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onEditPassport}
          >
            EDIT PASSPORT PROFILE
          </button>
        </article>

        <article style={styles.card}>
          <span style={styles.label}>MEMORIES</span>
          <strong style={styles.cardTitle}>
            {memoriesCount} saved
          </strong>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onOpenMemories}
          >
            VIEW MEMORIES
          </button>
        </article>

        <article style={styles.card}>
          <span style={styles.label}>CHANGE FESTIVAL</span>
          <strong style={styles.cardTitle}>Choose another journey</strong>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onChangeFestival}
          >
            CHANGE FESTIVAL
          </button>
        </article>
      </section>
    </section>
  )
}

function StatusItem({ label, value }) {
  return (
    <div style={styles.statusItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ProgressBar({ percent }) {
  return (
    <div style={styles.progressTrack} aria-label={`${percent}% complete`}>
      <div style={{ ...styles.progressFill, width: `${percent}%` }} />
    </div>
  )
}

const styles = {
  dashboard: {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    margin: '18px 0',
    padding: 16,
    borderRadius: 28,
    color: '#f7fff9',
    background:
      'radial-gradient(circle at 8% 0%, rgba(89,255,202,.1), transparent 30%), linear-gradient(180deg,#07100f,#080d12 52%,#05080c)',
    border: '1px solid rgba(120,255,214,.16)',
    boxShadow: '0 28px 80px rgba(0,0,0,.45)',
  },
  missionHeader: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    gap: 8,
    marginTop: 10,
  },
  statusItem: {
    minWidth: 0,
    display: 'grid',
    gap: 6,
    padding: 11,
    borderRadius: 13,
    background: 'rgba(255,255,255,.045)',
    border: '1px solid rgba(255,255,255,.08)',
    fontSize: 10,
    overflowWrap: 'anywhere',
  },
  targetSection: { minWidth: 0, marginTop: 18 },
  targetTitle: {
    margin: 0,
    color: '#f1bd63',
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: '.18em',
  },
  cardGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    gap: 11,
    marginTop: 18,
  },
  card: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    background: 'linear-gradient(145deg,#14211d,#090e0d)',
    border: '1px solid rgba(120,255,214,.14)',
  },
  label: {
    color: '#78ffd6',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '.16em',
  },
  cardValue: { fontSize: 32 },
  cardTitle: { fontSize: 18, overflowWrap: 'anywhere' },
  cardText: {
    margin: 0,
    color: 'rgba(255,255,255,.64)',
    fontSize: 12,
    lineHeight: 1.45,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    overflow: 'hidden',
    borderRadius: 999,
    background: 'rgba(255,255,255,.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg,#63e6be,#f1bd63)',
  },
  primaryButton: {
    minHeight: 44,
    border: 0,
    borderRadius: 12,
    color: '#151007',
    background: '#f1bd63',
    fontWeight: 950,
    cursor: 'pointer',
  },
  secondaryButton: {
    minHeight: 44,
    border: '1px solid rgba(255,255,255,.17)',
    borderRadius: 12,
    color: '#fff',
    background: 'transparent',
    fontWeight: 900,
    cursor: 'pointer',
  },
  developerButton: {
    width: '100%',
    minHeight: 42,
    marginTop: 10,
    borderRadius: 12,
    border: '1px dashed rgba(255,196,0,.65)',
    color: '#ffd666',
    background: 'rgba(255,196,0,.08)',
    fontWeight: 900,
    cursor: 'pointer',
  },
}
