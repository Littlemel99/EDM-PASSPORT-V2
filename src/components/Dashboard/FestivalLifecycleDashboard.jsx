import { getExplorerRank } from './FestivalDashboardData.js'
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
}) {
  const rank = getExplorerRank(collectedCount)
  const upcoming = lifecycle === 'upcoming'
  const preview = lifecycle !== 'completed'

  return (
    <section style={styles.page}>
      <PageIdentity
        pageName={preview ? 'FESTIVAL PREVIEW' : 'FESTIVAL RECAP'}
        activeFestival={activeFestival}
        activeFestivalProfile={activeFestivalProfile}
        activeFestivalBrand={activeFestivalBrand}
        activeFestivalDisplay={activeFestivalDisplay}
        variant="dashboard"
      />
      <button
        type="button"
        style={styles.changeFestival}
        onClick={onChangeFestival}
      >
        CHANGE FESTIVAL
      </button>

      {preview ? (
        <section style={styles.hero}>
          <span style={styles.eyebrow}>
            {upcoming ? 'COMING SOON' : 'EDITION INFORMATION'}
          </span>
          <h2 style={styles.title}>
            {upcoming
              ? 'This festival has not started yet.'
              : 'Live festival activity is unavailable.'}
          </h2>
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
          <div style={styles.metrics}>
            <Metric label="Configured Discoveries" value={totalCount} />
            <Metric label="Configured Collections" value={collectionsTotal} />
          </div>
          <button type="button" style={styles.primary} onClick={onOpenPassport}>
            OPEN PASSPORT
          </button>
          <button type="button" style={styles.secondary} onClick={onReturnToFestivals}>
            RETURN TO FESTIVALS
          </button>
        </section>
      ) : (
        <>
          <section style={styles.hero}>
            <span style={styles.eyebrow}>FESTIVAL COMPLETE</span>
            <h2 style={styles.title}>Your edition recap</h2>
            <div style={styles.metrics}>
              <Metric label="Discoveries" value={`${collectedCount} / ${totalCount}`} />
              <Metric label="Collections" value={`${collectionsCompleted} / ${collectionsTotal}`} />
              <Metric label="Achievements" value={achievementsEarned} />
              <Metric label="Explorer Rank" value={rank.name} />
              <Metric label="XP" value={totalXp} />
              <Metric label="Memories" value={memories.length} />
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
  metadata: { margin: 0, color: 'rgba(255,255,255,.68)', lineHeight: 1.5 },
  metrics: { minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 9, marginTop: 8 },
  metric: { minWidth: 0, display: 'grid', gap: 5, padding: 12, borderRadius: 13, background: 'rgba(255,255,255,.05)' },
  actions: { display: 'grid', gap: 8 },
  primary: { minHeight: 46, padding: 11, border: 0, borderRadius: 12, color: '#171109', background: '#f1bd63', fontWeight: 900, cursor: 'pointer' },
  secondary: { minHeight: 46, padding: 11, border: '1px solid rgba(255,255,255,.17)', borderRadius: 12, color: '#fff', background: 'transparent', fontWeight: 900, cursor: 'pointer' },
  changeFestival: { minHeight: 42, padding: 10, border: '1px solid rgba(255,255,255,.15)', borderRadius: 11, color: '#fff', background: 'rgba(255,255,255,.035)', fontWeight: 900, cursor: 'pointer' },
}
