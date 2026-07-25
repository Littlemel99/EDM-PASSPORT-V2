import FestivalMissionCard from './FestivalMissionCard.jsx'
import DiscoveryRadar from './DiscoveryRadar.jsx'
import JourneyActionCard from './JourneyActionCard.jsx'
import RecentDiscoveryCard from './RecentDiscoveryCard.jsx'
import PassportPrimaryActions from './PassportPrimaryActions.jsx'
import { getExplorerRank } from './FestivalDashboardData.js'
import { formatFestivalDates } from '../../festivals/index.js'
import { FestivalContextBar } from '../Festival/index.js'

export default function FestivalDashboard({
  displayName,
  country,
  collectedCount,
  totalCount,
  collectionPercent,
  collectionsCompleted = 0,
  collectionsTotal = 0,
  recentDiscovery,
  festivalName,
  festivalYear,
  festivalThemeName,
  festivalVenue,
  festivalStartDate,
  festivalEndDate,
  festivalId,
  nextDiscovery,
  discoveryLoading,
  developerMode = false,
  previousDiscovery,
  onRepeatPreviousDiscovery,
  onOpenPassport,
  onOpenCollections,
  onOpenMemories,
  onOpenRecentDiscovery,
  onOpenDiscovery,
  onEditPassport,
  onSignOut,
  missionReady,
  missionUserId,
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
}) {
  const explorerRank = getExplorerRank(collectedCount)
  const safePercent = Math.min(
    Math.max(collectionPercent || 0, 0),
    100
  )
  const editionLine = [festivalYear, festivalVenue]
    .filter(Boolean)
    .join(' • ')

  return (
    <section style={styles.dashboard}>
      <FestivalContextBar
        activeFestival={activeFestival}
        activeFestivalProfile={activeFestivalProfile}
        activeFestivalBrand={activeFestivalBrand}
        activeFestivalDisplay={activeFestivalDisplay}
        variant="dashboard"
      />

      <PassportPrimaryActions
        onOpenPassport={onOpenPassport}
        onEditPassport={onEditPassport}
      />

      <section style={styles.section}>
        <SectionHeading
          eyebrow="DISCOVERY RADAR"
          title="Continue into the festival."
        />
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
      </section>

      <FestivalMissionCard
        collectedCount={collectedCount}
        festivalId={festivalId}
        userId={missionUserId}
        ready={missionReady}
      />

      <header style={styles.welcomeBar}>
        <div>
          <span style={styles.overline}>FESTIVAL PASSPORT</span>
          <strong style={styles.explorerName}>{displayName}</strong>
        </div>
        <span style={styles.countryLabel}>
          {country || 'Passport holder'}
        </span>
      </header>

      <section style={styles.festivalCard}>
        <div style={styles.festivalGlow} />
        <div style={styles.festivalContent}>
          <span style={styles.sectionLabel}>CURRENT FESTIVAL</span>
          <h1 style={styles.festivalName}>
            {festivalName || 'Choose your next festival'}
          </h1>
          {editionLine && (
            <strong style={styles.editionLine}>{editionLine}</strong>
          )}
          {festivalThemeName && (
            <span style={styles.themeName}>{festivalThemeName}</span>
          )}
          {festivalStartDate && (
            <span style={styles.festivalDate}>
              {formatFestivalDates(festivalStartDate, festivalEndDate)}
            </span>
          )}

          <div style={styles.festivalSummaryGrid}>
            <SummaryItem label="Explorer Rank" value={explorerRank.name} />
            <SummaryItem
              label="Discoveries"
              value={`${collectedCount} / ${totalCount}`}
            />
            <SummaryItem
              label="Collections Completed"
              value={`${collectionsCompleted} / ${collectionsTotal}`}
            />
            <SummaryItem
              label="Recent Discovery"
              value={recentDiscovery?.name || 'Awaiting discovery'}
            />
          </div>

          <div style={styles.heroProgressBlock}>
            <div style={styles.progressHeader}>
              <span>Journey Progress</span>
              <strong>{safePercent}%</strong>
            </div>
            <ProgressBar percent={safePercent} />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <SectionHeading
          eyebrow="YOUR JOURNEY"
          title="Choose your next path."
        />
        <div style={styles.journeyGrid}>
          <JourneyActionCard
            title="Continue Exploring"
            subtitle="Find your next discovery."
            onClick={() => onOpenDiscovery?.(nextDiscovery)}
            disabled={!nextDiscovery || discoveryLoading}
          />
          <JourneyActionCard
            title="Collections"
            subtitle="Track every collection."
            onClick={onOpenCollections}
          />
          <JourneyActionCard
            title="Recent Memories"
            subtitle="See your latest adventures."
            onClick={onOpenMemories}
          />
        </div>
      </section>

      <section style={styles.section}>
        <SectionHeading
          eyebrow="RECENT DISCOVERY"
          title="The latest chapter in your journey."
        />
        <RecentDiscoveryCard discovery={recentDiscovery} onOpen={onOpenRecentDiscovery} />
      </section>

      <section style={styles.detailGrid}>
        <article style={styles.rankCard}>
          <span style={styles.sectionLabel}>EXPLORER RANK</span>
          <strong style={styles.rankTitle}>{explorerRank.name}</strong>
          <p style={styles.supportingText}>
            {explorerRank.nextName
              ? `${explorerRank.nextAt - collectedCount} discoveries until ${explorerRank.nextName}.`
              : 'The highest explorer rank has been reached.'}
          </p>
          <ProgressBar percent={explorerRank.progress} subdued />
        </article>

        <article style={styles.progressCard}>
          <span style={styles.sectionLabel}>JOURNEY PROGRESS</span>
          <strong style={styles.progressTitle}>{safePercent}%</strong>
          <ProgressBar percent={safePercent} />
          <div style={styles.progressStats}>
            <span>
              <strong>{collectedCount}</strong> Discoveries
            </span>
            <span>
              <strong>{collectionsCompleted}</strong> Collections
            </span>
          </div>
        </article>
      </section>

      <div style={styles.accountActions}>
        <button
          type="button"
          style={styles.quietButton}
          onClick={onSignOut}
        >
          SIGN OUT
        </button>
      </div>
    </section>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div style={styles.summaryItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div style={styles.sectionHeading}>
      <span style={styles.sectionLabel}>{eyebrow}</span>
      <h2 style={styles.sectionTitle}>{title}</h2>
    </div>
  )
}

function ProgressBar({ percent, subdued = false }) {
  return (
    <div style={styles.progressTrack}>
      <div
        style={{
          ...styles.progressFill,
          ...(subdued ? styles.progressFillSubdued : {}),
          width: `${Math.min(Math.max(percent || 0, 0), 100)}%`,
        }}
      />
    </div>
  )
}

const styles = {
  dashboard: {
    width: '100%',
    boxSizing: 'border-box',
    margin: '18px 0',
    padding: 16,
    borderRadius: 28,
    color: '#f7fff9',
    background:
      'radial-gradient(circle at 8% 0%, rgba(89,255,202,0.1), transparent 30%), linear-gradient(180deg, #07100f 0%, #080d12 52%, #05080c 100%)',
    border: '1px solid rgba(120,255,214,0.16)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
  },
  welcomeBar: {
    padding: '4px 4px 18px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  overline: {
    display: 'block',
    color: '#78ffd6',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.2em',
  },
  explorerName: {
    display: 'block',
    marginTop: 6,
    fontSize: 20,
  },
  countryLabel: {
    color: 'rgba(235,255,247,0.55)',
    fontSize: 11,
  },
  festivalCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 26,
    background:
      'linear-gradient(145deg, rgba(20,54,45,0.98), rgba(8,18,19,0.98) 58%, rgba(12,13,19,0.98))',
    border: '1px solid rgba(120,255,214,0.28)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.38)',
  },
  festivalGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    top: -130,
    right: -100,
    borderRadius: '50%',
    background: 'rgba(120,255,214,0.12)',
    filter: 'blur(14px)',
  },
  festivalContent: {
    position: 'relative',
    padding: '26px 22px 22px',
  },
  sectionLabel: {
    display: 'block',
    color: '#78ffd6',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.2em',
  },
  festivalName: {
    margin: '10px 0 4px',
    fontSize: 'clamp(34px, 9vw, 54px)',
    lineHeight: 0.95,
    letterSpacing: '-0.055em',
    textTransform: 'uppercase',
  },
  editionLine: {
    display: 'block',
    marginTop: 12,
    fontSize: 15,
    letterSpacing: '0.02em',
  },
  themeName: {
    display: 'block',
    marginTop: 7,
    color: '#b5ffe9',
    fontSize: 13,
  },
  festivalDate: {
    display: 'block',
    marginTop: 7,
    color: 'rgba(240,255,248,0.68)',
    fontSize: 13,
  },
  festivalSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginTop: 24,
  },
  summaryItem: {
    minHeight: 66,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 15,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  heroProgressBlock: {
    marginTop: 18,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 9,
    color: 'rgba(241,255,248,0.75)',
    fontSize: 12,
  },
  progressTrack: {
    width: '100%',
    height: 11,
    overflow: 'hidden',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.09)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #63e6be, #b4ffdf)',
    boxShadow: '0 0 20px rgba(120,255,214,0.42)',
    transition: 'width 250ms ease',
  },
  progressFillSubdued: {
    background: 'linear-gradient(90deg, #557b70, #78ffd6)',
  },
  section: {
    marginTop: 34,
  },
  sectionHeading: {
    marginBottom: 15,
  },
  sectionTitle: {
    margin: '7px 0 0',
    fontSize: 24,
    lineHeight: 1.05,
    letterSpacing: '-0.035em',
  },
  journeyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginTop: 34,
  },
  rankCard: {
    minHeight: 190,
    padding: 19,
    borderRadius: 22,
    background: 'linear-gradient(145deg, #14221f, #090f12)',
    border: '1px solid rgba(120,255,214,0.18)',
  },
  progressCard: {
    minHeight: 190,
    padding: 19,
    borderRadius: 22,
    background: 'linear-gradient(145deg, #171c25, #090d12)',
    border: '1px solid rgba(156,181,255,0.16)',
  },
  rankTitle: {
    display: 'block',
    marginTop: 17,
    fontSize: 25,
  },
  progressTitle: {
    display: 'block',
    margin: '14px 0 16px',
    fontSize: 36,
    letterSpacing: '-0.05em',
  },
  supportingText: {
    minHeight: 40,
    margin: '8px 0 16px',
    color: 'rgba(240,255,248,0.62)',
    fontSize: 12,
    lineHeight: 1.45,
  },
  progressStats: {
    marginTop: 18,
    display: 'grid',
    gap: 7,
    color: 'rgba(240,255,248,0.62)',
    fontSize: 12,
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
  accountActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 22,
  },
  quietButton: {
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(244,255,248,0.62)',
    background: 'transparent',
    fontWeight: 800,
    cursor: 'pointer',
  },
}
