import {
  getExplorerRank,
  getFestivalCountdown,
} from './FestivalDashboardData.js'
import { resolveAttendeeContentStateFromCounts } from '../../attendee/attendeeContentState.js'
import { PageIdentity } from '../Festival/index.js'
import { formatFestivalDates } from '../../festivals/index.js'

export default function FestivalLifecycleDashboard({
  lifecycle,
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
  collectedCount,
  totalCount,
  collectionsCompleted,
  collectionsTotal,
  achievementsEarned,
  totalXp,
  memories,
  crewName,
  onOpenPassport,
  onOpenMemories,
  onReturnToFestivals,
  onChangeFestival,
  contentState,
}) {
  const rank = getExplorerRank(collectedCount)
  const resolvedContentState =
    contentState ||
    resolveAttendeeContentStateFromCounts({
    completedDiscoveries: collectedCount,
    totalDiscoveries: totalCount,
    completedCollections: collectionsCompleted,
    totalCollections: collectionsTotal,
  })
  const empty = resolvedContentState.isEmpty
  const upcoming = !empty && lifecycle === 'upcoming'
  const completed =
    lifecycle === 'completed' && resolvedContentState.isComplete
  const inProgress =
    lifecycle === 'completed' && resolvedContentState.isInProgress
  const unavailable =
    !empty && !upcoming && !completed && !inProgress
  const countdown = getFestivalCountdown(
    activeFestivalDisplay?.startDate
  )
  const festivalName =
    activeFestivalDisplay?.brandName ||
    activeFestivalProfile?.name ||
    'Festival journey'

  return (
    <section style={styles.page}>
      <PageIdentity
        pageName="MISSION CONTROL"
        activeFestival={activeFestival}
        activeFestivalProfile={activeFestivalProfile}
        activeFestivalBrand={activeFestivalBrand}
        activeFestivalDisplay={activeFestivalDisplay}
        variant="dashboard"
      />

      {empty && (
        <section style={styles.hero}>
          <span style={styles.eyebrow}>EDITION INFORMATION</span>
          <h2 style={styles.title}>FESTIVAL GUIDE COMING SOON</h2>
          <strong style={styles.festivalName}>{festivalName}</strong>
          <p style={styles.statusCopy}>
            No discoveries or collections are available for this festival yet.
          </p>
          <button type="button" style={styles.primary} onClick={onReturnToFestivals}>
            CONTINUE TO FESTIVALS
          </button>
        </section>
      )}

      {upcoming && (
        <section style={styles.hero}>
          <span style={styles.eyebrow}>UPCOMING</span>
          <h2 style={styles.title}>YOUR JOURNEY IS READY</h2>
          <strong style={styles.festivalName}>{festivalName}</strong>
          <p style={styles.metadata}>
            {activeFestivalDisplay?.location || 'Location unavailable'}
          </p>
          {activeFestivalDisplay?.startDate && (
            <p style={styles.metadata}>
              {formatFestivalDates(
                activeFestivalDisplay.startDate,
                activeFestivalDisplay.endDate
              )}
            </p>
          )}
          <p style={styles.statusCopy}>
            {countdown
              ? `This festival begins in ${countdown}.`
              : 'Festival details are still being prepared.'}
          </p>
          <div style={styles.metrics}>
            <Metric label="Discoveries Available" value={totalCount} />
            <Metric label="Collections Available" value={collectionsTotal} />
          </div>
          <button type="button" style={styles.primary} onClick={onOpenPassport}>
            VIEW PASSPORT
          </button>
          <button type="button" style={styles.secondary} onClick={onChangeFestival}>
            CHANGE FESTIVAL
          </button>
        </section>
      )}

      {inProgress && (
        <>
          <section style={styles.hero}>
            <span style={styles.eyebrow}>ATTENDED</span>
            <h2 style={styles.title}>FESTIVAL JOURNEY</h2>
            <strong style={styles.festivalName}>{festivalName}</strong>
            <p style={styles.statusCopy}>
              Your festival record remains available in your passport.
            </p>
            <div style={styles.metrics}>
              <Metric label="Discoveries Found" value={`${collectedCount} / ${totalCount}`} />
              <Metric label="Collections Completed" value={`${collectionsCompleted} / ${collectionsTotal}`} />
            </div>
          </section>
          <div style={styles.actions}>
            <button type="button" style={styles.primary} onClick={onOpenPassport}>VIEW PASSPORT</button>
            <button type="button" style={styles.secondary} onClick={onReturnToFestivals}>RETURN TO FESTIVALS</button>
          </div>
        </>
      )}

      {completed && (
        <>
          <section style={styles.hero}>
            <span style={styles.eyebrow}>ATTENDED</span>
            <h2 style={styles.title}>JOURNEY COMPLETE</h2>
            <strong style={styles.festivalName}>{festivalName}</strong>
            <div style={styles.metrics}>
              <Metric label="Discoveries Found" value={`${collectedCount} / ${totalCount}`} />
              <Metric label="Collections Completed" value={`${collectionsCompleted} / ${collectionsTotal}`} />
              <Metric label="Achievements Earned" value={achievementsEarned} />
              <Metric label="Explorer Rank" value={rank.name} />
              <Metric label="XP" value={totalXp} />
              <Metric label="Memories Saved" value={memories.length} />
            </div>
            <p style={styles.metadata}>
              Crew: {crewName || 'Solo Explorer'}
            </p>
            <p style={styles.metadata}>
              {memories[0]
                ? `Latest memory: ${memories[0].note || (memories[0].created_at ? new Date(memories[0].created_at).toLocaleDateString() : 'Saved festival memory')}`
                : 'No memories saved for this edition.'}
            </p>
          </section>
          <div style={styles.actions}>
            <button type="button" style={styles.primary} onClick={onOpenPassport}>VIEW PASSPORT</button>
            <button type="button" style={styles.secondary} onClick={onOpenMemories}>VIEW MEMORIES</button>
            <button type="button" style={styles.secondary} onClick={onReturnToFestivals}>RETURN TO FESTIVALS</button>
          </div>
        </>
      )}

      {unavailable && (
        <section style={styles.hero}>
          <span style={styles.eyebrow}>EDITION INFORMATION</span>
          <h2 style={styles.title}>FESTIVAL DETAILS COMING SOON</h2>
          <strong style={styles.festivalName}>{festivalName}</strong>
          {activeFestivalDisplay?.location && (
            <p style={styles.metadata}>
              {activeFestivalDisplay.location}
            </p>
          )}
          {activeFestivalDisplay?.startDate && (
            <p style={styles.metadata}>
              {formatFestivalDates(
                activeFestivalDisplay.startDate,
                activeFestivalDisplay.endDate
              )}
            </p>
          )}
          <div style={styles.metrics}>
            <Metric label="Discoveries Available" value={totalCount} />
            <Metric label="Collections Available" value={collectionsTotal} />
          </div>
          <button type="button" style={styles.primary} onClick={onOpenPassport}>
            VIEW PASSPORT
          </button>
          <button type="button" style={styles.secondary} onClick={onReturnToFestivals}>
            RETURN TO FESTIVALS
          </button>
          <button type="button" style={styles.secondary} onClick={onChangeFestival}>
            CHANGE FESTIVAL
          </button>
        </section>
      )}
    </section>
  )
}

function Metric({ label, value }) {
  return <div style={styles.metric}><span>{label}</span><strong>{value}</strong></div>
}

const styles = {
  page: { width: '100%', minWidth: 0, boxSizing: 'border-box', display: 'grid', gap: 14, margin: '18px 0', padding: 16, borderRadius: 24, color: '#fff', background: '#07100f', border: '1px solid rgba(120,255,214,.16)' },
  hero: { minWidth: 0, display: 'grid', gap: 10, padding: 20, borderRadius: 20, background: 'linear-gradient(145deg,#15241e,#090d0c)', border: '1px solid rgba(241,189,99,.2)' },
  eyebrow: { color: '#f1bd63', fontSize: 10, fontWeight: 950, letterSpacing: '.18em' },
  title: { margin: 0, fontSize: 'clamp(27px,8vw,40px)', overflowWrap: 'anywhere' },
  festivalName: { color: '#fff', fontSize: 18, overflowWrap: 'anywhere' },
  statusCopy: { margin: '4px 0', color: '#f1bd63', fontSize: 15, fontWeight: 850, lineHeight: 1.45 },
  metadata: { margin: 0, color: 'rgba(255,255,255,.68)', lineHeight: 1.5 },
  metrics: { minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 9, marginTop: 8 },
  metric: { minWidth: 0, display: 'grid', gap: 5, padding: 12, borderRadius: 13, background: 'rgba(255,255,255,.05)' },
  actions: { display: 'grid', gap: 8 },
  primary: { minHeight: 46, padding: 11, border: 0, borderRadius: 12, color: '#171109', background: '#f1bd63', fontWeight: 900, cursor: 'pointer' },
  secondary: { minHeight: 46, padding: 11, border: '1px solid rgba(255,255,255,.17)', borderRadius: 12, color: '#fff', background: 'transparent', fontWeight: 900, cursor: 'pointer' },
  changeFestival: { minHeight: 42, padding: 10, border: '1px solid rgba(255,255,255,.15)', borderRadius: 11, color: '#fff', background: 'rgba(255,255,255,.035)', fontWeight: 900, cursor: 'pointer' },
}
