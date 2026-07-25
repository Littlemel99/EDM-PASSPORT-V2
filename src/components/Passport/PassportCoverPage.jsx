import './passportIdentity.css'
import { getPassportEditionTheme } from './passportEditionTheme.js'

export default function PassportCoverPage({ displayName, country, edition, brand, display, collectedCount = 0, totalCount = 0 }) {
  const identity = getPassportEditionTheme({ edition, brand, display })
  const percent = totalCount ? Math.round((collectedCount / totalCount) * 100) : 0

  return (
    <section className="passport-identity" style={{ ...styles.cover, background: identity.surface, borderColor: identity.border, boxShadow: `0 28px 70px rgba(0,0,0,.42),0 0 28px ${identity.glow}` }}>
      <div className="passport-identity__texture" aria-hidden="true" style={{ background: identity.texture }} />
      <header style={styles.header}>
        <span style={{ ...styles.eyebrow, color: identity.accent }}>EDM PASSPORT</span>
        <span style={styles.mark}>{identity.editionMark}</span>
      </header>

      <div className="passport-identity__cover-grid" style={styles.heroGrid}>
        <div>
          <span style={styles.archive}>{identity.eyebrow}</span>
          <h1 style={styles.brand}>{identity.brandName.toUpperCase()}</h1>
          {identity.year && <strong style={{ ...styles.year, color: identity.accent }}>{identity.year}</strong>}
          <p style={styles.product}>EXPLORER PASSPORT</p>
        </div>
        <div className="passport-identity__seal" aria-hidden="true" style={{ color: identity.accent }} />
      </div>

      <div style={styles.rule} />
      <div className="passport-identity__identity-grid" style={styles.identityGrid}>
        <Identity label="Rave Name" value={displayName || 'Passport Holder'} />
        <Identity label="Passport Country" value={country || 'Not configured'} />
        <Identity label="Venue" value={identity.venue || 'Venue unavailable'} />
        <Identity label="Location" value={identity.cityRegion || identity.location || 'Location unavailable'} />
      </div>

      {identity.dateLabel && <p style={styles.dates}>{identity.dateLabel}</p>}
      <div style={styles.progressHeader}><span>DISCOVERIES ARCHIVED</span><strong>{collectedCount} / {totalCount}</strong></div>
      <div style={styles.track} aria-label={`${percent}% discovery completion`}><div className="passport-identity__progress-fill" style={{ ...styles.fill, width: `${percent}%`, background: identity.accent }} /></div>
      <footer style={styles.footer}><span>{identity.atmosphere}</span><span>{identity.editionName}</span></footer>
    </section>
  )
}

function Identity({ label, value }) { return <div style={styles.identity}><span>{label}</span><strong>{value}</strong></div> }

const styles = {
  cover: { position: 'relative', display: 'grid', gap: 18, padding: 'clamp(20px,5vw,34px)', border: '1px solid', borderRadius: 28 },
  header: { position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 12 }, eyebrow: { fontSize: 11, fontWeight: 950, letterSpacing: '.23em' }, mark: { color: 'rgba(255,255,255,.5)', fontSize: 9, fontWeight: 900, letterSpacing: '.14em' },
  heroGrid: { position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: 20 }, archive: { color: 'rgba(255,255,255,.48)', fontSize: 8, fontWeight: 900, letterSpacing: '.16em' }, brand: { margin: '9px 0 0', fontSize: 'clamp(34px,10vw,58px)', lineHeight: .88, letterSpacing: '-.055em' }, year: { display: 'block', marginTop: 10, fontSize: 25, letterSpacing: '.12em' }, product: { margin: '12px 0 0', fontSize: 10, fontWeight: 900, letterSpacing: '.2em' },
  rule: { height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)' }, identityGrid: { position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 11 }, identity: { minWidth: 0, display: 'grid', gap: 5, padding: 12, borderRadius: 13, background: 'rgba(0,0,0,.2)', border: '1px solid rgba(255,255,255,.07)' },
  dates: { position: 'relative', margin: 0, textAlign: 'center', fontSize: 16, fontWeight: 850 }, progressHeader: { position: 'relative', display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,.62)', fontSize: 9, fontWeight: 900, letterSpacing: '.11em' }, track: { position: 'relative', height: 7, overflow: 'hidden', borderRadius: 999, background: 'rgba(255,255,255,.08)' }, fill: { height: '100%', borderRadius: 999 }, footer: { position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 12, color: 'rgba(255,255,255,.38)', fontSize: 8, fontWeight: 900, letterSpacing: '.13em' },
}
