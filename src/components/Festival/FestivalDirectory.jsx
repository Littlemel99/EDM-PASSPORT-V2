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
import { getFestivalDirectorySections } from './FestivalDirectoryData.js'

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
  const sections = getFestivalDirectorySections(
    groups,
    expandedSections
  )

  return (
    <section style={styles.directory}>
      <header style={styles.header}>
        <span style={styles.eyebrow}>EDM PASSPORT</span>
        <h1 style={styles.title}>FESTIVAL DIRECTORY</h1>
        <p style={styles.supporting}>
          Choose an edition to enter its Dashboard and Passport.
        </p>
      </header>

      {sections.map((section) => {
        const {
          lifecycle,
          label,
          editions,
          count,
          collapsible,
          expanded,
        } = section
        if (!editions.length) return null
        const panelId = `festival-directory-${lifecycle}`

        return (
          <section key={lifecycle} style={styles.group}>
            {collapsible ? (
              <button
                type="button"
                style={styles.groupToggle}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => onToggleSection?.(lifecycle)}
              >
                <span>{label} ({count})</span>
                <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
              </button>
            ) : (
              <h2 style={styles.groupTitle}>{label}</h2>
            )}
            {expanded && <div id={panelId} style={styles.grid}>
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
  directory: { minWidth: 0, display: 'grid', gap: 12, padding: '0 0 10px' },
  header: { minWidth: 0, padding: '4px 3px 0' },
  eyebrow: { color: '#f1bd63', fontSize: 9, fontWeight: 950, letterSpacing: '.2em' },
  title: { margin: '3px 0', fontSize: 'clamp(25px,7vw,36px)', overflowWrap: 'anywhere' },
  supporting: { margin: 0, color: 'rgba(255,255,255,.64)', fontSize: 12, lineHeight: 1.35 },
  group: { minWidth: 0, display: 'grid', gap: 7 },
  groupTitle: { margin: 0, color: '#78ffd6', fontSize: 11, letterSpacing: '.17em' },
  groupToggle: { minHeight: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 11, border: '1px solid rgba(255,255,255,.12)', color: '#78ffd6', background: 'rgba(255,255,255,.035)', fontSize: 11, fontWeight: 900, letterSpacing: '.12em', cursor: 'pointer' },
  grid: { minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 11 },
  card: { minWidth: 0, display: 'grid', gap: 5, padding: 13, borderRadius: 16, color: '#fff', background: 'linear-gradient(145deg,#111915,#080c0b)', border: '1px solid rgba(255,255,255,.1)' },
  cardSelected: { borderColor: 'rgba(241,189,99,.5)' },
  status: { color: '#78ffd6', fontSize: 9, fontWeight: 900, letterSpacing: '.14em' },
  name: { margin: '2px 0 0', fontSize: 22, overflowWrap: 'anywhere' },
  year: { color: '#f1bd63' },
  metadata: { color: 'rgba(255,255,255,.64)', fontSize: 12, lineHeight: 1.4, overflowWrap: 'anywhere' },
  progress: { marginTop: 5, fontSize: 11, fontWeight: 800 },
  action: { minHeight: 44, marginTop: 4, padding: '9px 12px', border: 0, borderRadius: 12, color: '#171109', background: '#f1bd63', fontWeight: 900, cursor: 'pointer' },
}
