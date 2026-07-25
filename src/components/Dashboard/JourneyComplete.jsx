import { PageIdentity } from '../Festival/index.js'

export default function JourneyComplete({
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
  collectedCount,
  totalCount,
  collectionsCompleted,
  collectionsTotal,
  onViewRecap,
  onContinueToFestivals,
}) {
  return (
    <section style={styles.page}>
      <PageIdentity
        pageName="JOURNEY COMPLETE"
        activeFestival={activeFestival}
        activeFestivalProfile={activeFestivalProfile}
        activeFestivalBrand={activeFestivalBrand}
        activeFestivalDisplay={activeFestivalDisplay}
        variant="dashboard"
      />
      <section style={styles.summary}>
        <span style={styles.eyebrow}>JOURNEY COMPLETE</span>
        <h1 style={styles.title}>
          {activeFestivalDisplay?.brandName || 'Festival journey'}
        </h1>
        {activeFestivalDisplay?.year && (
          <strong style={styles.year}>
            {activeFestivalDisplay.year}
          </strong>
        )}
        <div style={styles.metrics}>
          <span>
            Discoveries
            <strong>{collectedCount} / {totalCount}</strong>
          </span>
          <span>
            Collections
            <strong>
              {collectionsCompleted} / {collectionsTotal}
            </strong>
          </span>
        </div>
        <button type="button" style={styles.primary} onClick={onViewRecap}>
          VIEW RECAP
        </button>
        <button
          type="button"
          style={styles.secondary}
          onClick={onContinueToFestivals}
        >
          CONTINUE TO FESTIVALS
        </button>
      </section>
    </section>
  )
}

const styles = {
  page: { width: '100%', minWidth: 0, display: 'grid', gap: 14, margin: '18px 0' },
  summary: { minWidth: 0, display: 'grid', gap: 12, padding: 22, borderRadius: 22, color: '#fff', background: 'linear-gradient(145deg,#18231e,#080d0b)', border: '1px solid rgba(241,189,99,.25)' },
  eyebrow: { color: '#f1bd63', fontSize: 10, fontWeight: 950, letterSpacing: '.18em' },
  title: { margin: 0, fontSize: 'clamp(30px,9vw,48px)', overflowWrap: 'anywhere' },
  year: { color: '#78ffd6', fontSize: 18 },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 9 },
  primary: { minHeight: 46, border: 0, borderRadius: 12, color: '#171109', background: '#f1bd63', fontWeight: 950, cursor: 'pointer' },
  secondary: { minHeight: 46, border: '1px solid rgba(255,255,255,.18)', borderRadius: 12, color: '#fff', background: 'transparent', fontWeight: 900, cursor: 'pointer' },
}
