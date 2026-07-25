import {
  formatFestivalDates,
  getFestivalBrandForEdition,
  getFestivalEditionDisplayMetadata,
  getFestivalProfile,
} from '../../festivals/index.js'
import {
  getFestivalLifecycleAction,
  groupFestivalsByLifecycle,
} from '../../festivals/festivalLifecycle.js'

const DIRECTORY_GROUPS = [
  ['live', 'LIVE NOW'],
  ['upcoming', 'UPCOMING'],
  ['completed', 'ATTENDED'],
  ['unavailable', 'UNAVAILABLE'],
]

export default function FestivalDirectory({
  festivals,
  now,
  selectedFestivalId,
  progressByFestival = {},
  expandedSections = {},
  onToggleSection,
  onSelectFestival,
}) {
  const groups = groupFestivalsByLifecycle(festivals, now)

  return (
    <section style={styles.directory}>
      <header style={styles.header}>
        <span style={styles.eyebrow}>EDM PASSPORT</span>
        <h1 style={styles.title}>FESTIVAL DIRECTORY</h1>
        <p style={styles.supporting}>
          Choose an edition to enter its Dashboard and Passport.
        </p>
      </header>

      {DIRECTORY_GROUPS.map(([lifecycle, label]) => {
        const editions = groups[lifecycle]
        if (!editions.length) return null
        const collapsible =
          lifecycle === 'upcoming' || lifecycle === 'completed'
        const expanded = !collapsible || Boolean(expandedSections[lifecycle])

        return (
          <section key={lifecycle} style={styles.group}>
            {collapsible ? (
              <button
                type="button"
                style={styles.groupToggle}
                aria-expanded={expanded}
                onClick={() => onToggleSection?.(lifecycle)}
              >
                <span>{label}</span>
                <span>{expanded ? 'HIDE' : `SHOW ${editions.length}`}</span>
              </button>
            ) : (
              <h2 style={styles.groupTitle}>{label}</h2>
            )}
            {expanded && <div style={styles.grid}>
              {editions.map((festival) => {
                const profile = getFestivalProfile(festival.id)
                const brand = getFestivalBrandForEdition(festival.id)
                const display = getFestivalEditionDisplayMetadata({
                  edition: festival,
                  profile,
                  brand,
                })
                const progress = progressByFestival[festival.id]

                return (
                  <article
                    key={festival.id}
                    style={{
                      ...styles.card,
                      ...(festival.id === selectedFestivalId
                        ? styles.cardSelected
                        : {}),
                    }}
                  >
                    <span style={styles.status}>{label}</span>
                    <h3 style={styles.name}>
                      {display.brandName || festival.name}
                    </h3>
                    {display.year && (
                      <strong style={styles.year}>{display.year}</strong>
                    )}
                    {display.location && (
                      <span style={styles.metadata}>{display.location}</span>
                    )}
                    {display.startDate && (
                      <span style={styles.metadata}>
                        {formatFestivalDates(
                          display.startDate,
                          display.endDate
                        )}
                      </span>
                    )}
                    {progress && (
                      <span style={styles.progress}>
                        {progress.collected} / {progress.total} discoveries
                      </span>
                    )}
                    <button
                      type="button"
                      style={styles.action}
                      onClick={() => onSelectFestival?.(festival.id)}
                    >
                      {getFestivalLifecycleAction(lifecycle)}
                    </button>
                  </article>
                )
              })}
            </div>}
          </section>
        )
      })}
    </section>
  )
}

const styles = {
  directory: { minWidth: 0, display: 'grid', gap: 20, padding: '4px 0 14px' },
  header: { minWidth: 0, padding: '18px 4px 4px' },
  eyebrow: { color: '#f1bd63', fontSize: 9, fontWeight: 950, letterSpacing: '.2em' },
  title: { margin: '6px 0', fontSize: 'clamp(28px,8vw,42px)', overflowWrap: 'anywhere' },
  supporting: { margin: 0, color: 'rgba(255,255,255,.64)', lineHeight: 1.5 },
  group: { minWidth: 0, display: 'grid', gap: 10 },
  groupTitle: { margin: 0, color: '#78ffd6', fontSize: 11, letterSpacing: '.17em' },
  groupToggle: { minHeight: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 11, border: '1px solid rgba(255,255,255,.12)', color: '#78ffd6', background: 'rgba(255,255,255,.035)', fontSize: 11, fontWeight: 900, letterSpacing: '.12em', cursor: 'pointer' },
  grid: { minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 11 },
  card: { minWidth: 0, display: 'grid', gap: 7, padding: 16, borderRadius: 18, color: '#fff', background: 'linear-gradient(145deg,#111915,#080c0b)', border: '1px solid rgba(255,255,255,.1)' },
  cardSelected: { borderColor: 'rgba(241,189,99,.5)' },
  status: { color: '#78ffd6', fontSize: 9, fontWeight: 900, letterSpacing: '.14em' },
  name: { margin: '4px 0 0', fontSize: 24, overflowWrap: 'anywhere' },
  year: { color: '#f1bd63' },
  metadata: { color: 'rgba(255,255,255,.64)', fontSize: 12, lineHeight: 1.4, overflowWrap: 'anywhere' },
  progress: { marginTop: 5, fontSize: 11, fontWeight: 800 },
  action: { minHeight: 44, marginTop: 7, padding: '11px 13px', border: 0, borderRadius: 12, color: '#171109', background: '#f1bd63', fontWeight: 900, cursor: 'pointer' },
}
