import FestivalMissionCard from './FestivalMissionCard.jsx'
import DiscoveryRadar from './DiscoveryRadar.jsx'
import { useEffect, useState } from 'react'
import {
  formatMissionControlTime,
  getExplorerRank,
  getJourneyDay,
  getMissionControlLocation,
} from './FestivalDashboardData.js'
import { PageIdentity } from '../Festival/index.js'

export default function FestivalDashboard({
  raveName,
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
  onOpenDiscoveries,
  onOpenMap,
  onOpenSchedule,
  onOpenCrew,
  onOpenCollections,
  onOpenMemories,
  onOpenAchievements,
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
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const explorerRank = getExplorerRank(collectedCount)
  const journeyDay = getJourneyDay(
    festivalStartDate,
    currentTime,
    activeFestivalDisplay?.timezone ||
      activeFestival?.timezone ||
      activeFestivalProfile?.timezone
  )
  const missionControlLocation = getMissionControlLocation({
    discovery: nextDiscovery,
    venue: activeFestivalDisplay?.venue,
    location: activeFestivalDisplay?.location,
  })
  const safePercent = Math.min(
    Math.max(collectionPercent || 0, 0),
    100
  )

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setCurrentTime(new Date()),
      30000
    )
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <section style={styles.dashboard}>
      <PageIdentity
        pageName="MISSION CONTROL"
        activeFestival={activeFestival}
        activeFestivalProfile={activeFestivalProfile}
        activeFestivalBrand={activeFestivalBrand}
        activeFestivalDisplay={activeFestivalDisplay}
        variant="dashboard"
      />

      <header style={styles.welcome}>
        <div>
          <span>Welcome back,</span>
          <strong>{raveName || 'Explorer'}</strong>
        </div>
        <div style={styles.liveContext}>
          <span>{missionControlLocation}</span>
          <time dateTime={currentTime.toISOString()}>
            {formatMissionControlTime(currentTime)}
          </time>
        </div>
      </header>

      <h2 style={styles.liveTitle}>
        YOU’RE LIVE AT{' '}
        {activeFestivalDisplay?.brandName ||
          activeFestivalProfile?.name ||
          'YOUR FESTIVAL'}
      </h2>

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
        <StatusItem label="CURRENT LOCATION" value={missionControlLocation} />
        <StatusItem label="EXPLORER RANK" value={explorerRank.name} />
        <StatusItem
          label="LIFECYCLE"
          value={lifecycle === 'live' ? 'LIVE NOW' : lifecycle.toUpperCase()}
        />
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

      <nav style={styles.primaryActions} aria-label="Festival actions">
        <MissionAction label="DISCOVER" onClick={onOpenDiscoveries} />
        {nextDiscovery ? (
          <MissionAction
            label="RADAR"
            onClick={() => onOpenDiscovery?.(nextDiscovery)}
            primary
          />
        ) : (
          <MissionAction
            label="VIEW FESTIVAL GUIDE"
            onClick={onOpenMap}
            primary
          />
        )}
        <MissionAction label="MAP" onClick={onOpenMap} />
        <MissionAction label="SCHEDULE" onClick={onOpenSchedule} />
        <MissionAction label="CREW" onClick={onOpenCrew} />
        <button
          type="button"
          style={styles.missionAction}
          aria-label="Open festival passport"
          onClick={onOpenPassport}
        >
          OPEN PASSPORT
        </button>
      </nav>

      <section style={styles.cardGrid} aria-label="Mission control">
        <article style={styles.card}>
          <span style={styles.label}>PROGRESS</span>
          <strong style={styles.cardValue}>{safePercent}%</strong>
          <ProgressBar percent={safePercent} />
          <div style={styles.progressSummary}>
            <span>
              Discoveries Found
              <strong>{collectedCount} / {totalCount}</strong>
            </span>
            <span>
              Collections Completed
              <strong>
                {collectionsCompleted} / {collectionsTotal}
              </strong>
            </span>
          </div>
        </article>

        {totalCount > 0 && (
          <FestivalMissionCard
            collectedCount={collectedCount}
            festivalId={festivalId}
            userId={missionUserId}
            ready={missionReady}
          />
        )}

      </section>

      <nav style={styles.secondaryActions} aria-label="Passport actions">
        <MissionAction label="COLLECTIONS" onClick={onOpenCollections} />
        <MissionAction
          label={`MEMORIES · ${memoriesCount}`}
          onClick={onOpenMemories}
        />
        <MissionAction label="ACHIEVEMENTS" onClick={onOpenAchievements} />
        <button
          type="button"
          style={styles.missionAction}
          aria-label="EDIT PASSPORT PROFILE"
          onClick={onEditPassport}
        >
          SETTINGS
        </button>
      </nav>

      <footer style={styles.changeFestival}>
        <span>
          {crewName || 'Solo Explorer'} · {lifecycle.toUpperCase()}
        </span>
        <button
          type="button"
          style={styles.changeFestivalButton}
          onClick={onChangeFestival}
        >
          CHANGE FESTIVAL
        </button>
      </footer>
    </section>
  )
}

function MissionAction({ label, onClick, primary = false }) {
  return (
    <button
      type="button"
      style={
        primary
          ? styles.missionActionPrimary
          : styles.missionAction
      }
      onClick={onClick}
    >
      {label}
    </button>
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
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    gap: 8,
    marginTop: 10,
  },
  welcome: {
    minWidth: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 10,
    padding: '0 3px',
    color: 'rgba(255,255,255,.68)',
    fontSize: 12,
  },
  liveContext: {
    display: 'grid',
    gap: 2,
    textAlign: 'right',
    color: '#f1bd63',
    fontWeight: 850,
  },
  liveTitle: {
    margin: '14px 2px 0',
    color: '#fff',
    fontSize: 'clamp(20px,6vw,30px)',
    lineHeight: 1.08,
    overflowWrap: 'anywhere',
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
  primaryActions: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    gap: 8,
    marginTop: 14,
  },
  missionAction: {
    minWidth: 0,
    minHeight: 50,
    padding: '8px 5px',
    border: '1px solid rgba(255,255,255,.16)',
    borderRadius: 13,
    color: '#fff',
    background: 'rgba(255,255,255,.045)',
    fontSize: 10,
    fontWeight: 950,
    cursor: 'pointer',
  },
  missionActionPrimary: {
    minWidth: 0,
    minHeight: 50,
    padding: '8px 5px',
    border: '1px solid #f1bd63',
    borderRadius: 13,
    color: '#171109',
    background: '#f1bd63',
    fontSize: 10,
    fontWeight: 950,
    cursor: 'pointer',
  },
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
  secondaryActions: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    gap: 8,
    marginTop: 14,
  },
  changeFestival: {
    minWidth: 0,
    display: 'grid',
    gap: 8,
    marginTop: 22,
    paddingTop: 15,
    borderTop: '1px solid rgba(255,255,255,.1)',
    color: 'rgba(255,255,255,.58)',
    fontSize: 10,
    fontWeight: 850,
  },
  changeFestivalButton: {
    minHeight: 44,
    border: '1px solid rgba(241,189,99,.42)',
    borderRadius: 12,
    color: '#f1bd63',
    background: 'transparent',
    fontWeight: 950,
    cursor: 'pointer',
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
  progressSummary: {
    display: 'grid',
    gap: 8,
    color: 'rgba(255,255,255,.68)',
    fontSize: 11,
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
