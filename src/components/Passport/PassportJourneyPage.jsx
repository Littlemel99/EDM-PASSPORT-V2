import './passportIdentity.css'
import { DiscoveryCard } from '../DiscoveryCards/index.js'
import { getPassportEditionTheme, getPassportJourneySummary } from './passportEditionTheme.js'

export default function PassportJourneyPage({ edition, brand, display, crewName, discoveries, collectedIds, collections, memories, achievement, achievementProgress, recentDiscovery }) {
  const identity = getPassportEditionTheme({ edition, brand, display })
  const journey = getPassportJourneySummary({ collections, discoveries, collectedIds, memories, achievement, achievementProgress })

  return (
    <section className="passport-identity" style={styles.page}>
      <header style={{ ...styles.identityHeader, background: identity.surface, borderColor: identity.border }}>
        <div className="passport-identity__texture" aria-hidden="true" style={{ background: identity.texture }} />
        <div style={styles.headerCopy}>
          <span style={{ ...styles.eyebrow, color: identity.accent }}>{identity.eyebrow}</span>
          <h1 style={styles.title}>{identity.brandName}</h1>
          <p style={styles.metadata}>{[identity.year, identity.location, identity.dateLabel].filter(Boolean).join(' • ')}</p>
        </div>
        <div className="passport-identity__identity-grid" style={styles.rankGrid}>
          <Metric label="Explorer Rank" value={journey.rank.name} />
          <Metric label="Expedition" value={crewName || 'Solo Explorer'} />
        </div>
      </header>

      <JourneySection eyebrow="JOURNEY PROGRESS" title={`${journey.percent}% complete`}>
        <div style={styles.progressHeader}><span>DISCOVERIES</span><strong>{journey.collectedCount} / {journey.totalCount}</strong></div>
        <Progress percent={journey.percent} accent={identity.accent} />
        <div style={styles.metricGrid}>
          <Metric label="Collections Completed" value={`${journey.collectionsCompleted} / ${journey.collectionsTotal}`} />
          <Metric label="Achievement Progress" value={journey.achievement ? `${journey.achievementProgress.collectedCount || 0} / ${journey.achievementProgress.totalCount || journey.totalCount}` : 'Not configured'} />
        </div>
      </JourneySection>

      <JourneySection eyebrow="RECENT DISCOVERY" title="Latest archive entry">
        {recentDiscovery ? <DiscoveryCard discovery={recentDiscovery} collected variant="compact" /> : <p style={styles.empty}>Your first {identity.brandName} discovery is waiting.</p>}
      </JourneySection>

      <JourneySection eyebrow="CURRENT COLLECTION GOAL" title={journey.currentCollection?.name || 'All collections complete'}>
        {journey.currentCollection ? <>
          <div style={styles.progressHeader}><span>COLLECTION PROGRESS</span><strong>{journey.currentCollection.collectedCount} / {journey.currentCollection.totalCount}</strong></div>
          <Progress percent={journey.currentCollection.percent} accent={identity.accent} />
          <p style={styles.supporting}>{journey.currentCollection.nextDiscovery ? `Next discovery: ${journey.currentCollection.nextDiscovery.name}` : 'Continue exploring to reveal the next discovery.'}</p>
        </> : <p style={styles.empty}>Every configured collection for this edition is complete.</p>}
      </JourneySection>

      <JourneySection eyebrow="ACHIEVEMENT" title={journey.achievement?.name || 'No edition achievement configured'}>
        {journey.achievement ? <>
          <DiscoveryCard discovery={journey.achievement} collected={Boolean(journey.achievementProgress.unlocked)} variant="compact" />
          <div style={styles.progressHeader}><span>{journey.achievementProgress.unlocked ? 'COMPLETED' : 'PROGRESSION REQUIRED'}</span><strong>{journey.achievementProgress.collectedCount || 0} / {journey.achievementProgress.totalCount || journey.totalCount}</strong></div>
          <Progress percent={journey.achievementProgress.percent || 0} accent={identity.accent} />
        </> : <p style={styles.empty}>Achievements are not configured for this edition.</p>}
      </JourneySection>

      <JourneySection eyebrow="MEMORY ARCHIVE" title={`${journey.memoryCount} ${journey.memoryCount === 1 ? 'memory' : 'memories'} saved`}>
        <p style={styles.supporting}>{journey.recentMemory ? `Latest memory: ${journey.recentMemory.note || new Date(journey.recentMemory.created_at).toLocaleDateString()}` : 'No memories saved yet.'}</p>
      </JourneySection>
    </section>
  )
}

function JourneySection({ eyebrow, title, children }) { return <section style={styles.section}><span style={styles.eyebrow}>{eyebrow}</span><h2 style={styles.sectionTitle}>{title}</h2>{children}</section> }
function Metric({ label, value }) { return <div style={styles.metric}><span>{label}</span><strong>{value}</strong></div> }
function Progress({ percent, accent }) { return <div style={styles.track} aria-label={`${percent}% complete`}><div className="passport-identity__progress-fill" style={{ ...styles.fill, width: `${percent}%`, background: accent }} /></div> }

const styles = {
  page: { display: 'grid', gap: 22 }, identityHeader: { position: 'relative', overflow: 'hidden', display: 'grid', gap: 17, padding: 'clamp(18px,5vw,28px)', border: '1px solid', borderRadius: 24 }, headerCopy: { position: 'relative' }, eyebrow: { color: '#d6a85a', fontSize: 9, fontWeight: 950, letterSpacing: '.17em' }, title: { margin: '7px 0 5px', fontSize: 'clamp(31px,8vw,45px)', letterSpacing: '-.045em' }, metadata: { margin: 0, color: 'rgba(255,255,255,.65)', fontSize: 12, lineHeight: 1.55 },
  rankGrid: { position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }, metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, marginTop: 14 }, metric: { minWidth: 0, display: 'grid', gap: 6, padding: 12, borderRadius: 13, background: 'rgba(0,0,0,.2)', border: '1px solid rgba(255,255,255,.08)' },
  section: { display: 'grid', gap: 10, padding: 'clamp(16px,4vw,22px)', borderRadius: 20, background: 'linear-gradient(150deg,#111613,#090c0b)', border: '1px solid rgba(225,173,89,.15)' }, sectionTitle: { margin: 0, fontSize: 22, letterSpacing: '-.025em' }, progressHeader: { display: 'flex', justifyContent: 'space-between', gap: 10, color: 'rgba(255,255,255,.6)', fontSize: 9, fontWeight: 900, letterSpacing: '.1em' }, track: { height: 8, overflow: 'hidden', borderRadius: 999, background: 'rgba(255,255,255,.08)' }, fill: { height: '100%', borderRadius: 999 }, supporting: { margin: 0, color: 'rgba(255,255,255,.68)', lineHeight: 1.55 }, empty: { margin: 0, padding: 16, borderRadius: 14, color: 'rgba(255,255,255,.62)', background: 'rgba(255,255,255,.035)' },
}
