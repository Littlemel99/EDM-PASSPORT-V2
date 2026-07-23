import { getExplorerRank } from '../Dashboard/FestivalDashboardData.js'
import { DiscoveryCard } from '../DiscoveryCards/index.js'

export default function PassportJourneyPage({ festivalName, editionName, collectedCount, totalCount, collectionPercent, collectionsCompleted, collectionsTotal, achievementProgress, crewName, recentDiscovery }) {
  const rank = getExplorerRank(collectedCount)
  const percent = Math.min(Math.max(Number(collectionPercent) || 0, 0), 100)
  return (
    <section style={styles.page}>
      <header>
        <span style={styles.eyebrow}>JOURNEY</span>
        <h2 style={styles.title}>{festivalName}</h2>
        <p style={styles.subtitle}>{editionName}</p>
      </header>
      <div style={styles.summary}>
        <Summary label="Explorer Rank" value={rank.name} />
        <Summary label="Discoveries" value={`${collectedCount} / ${totalCount}`} />
        <Summary label="Collections" value={`${collectionsCompleted} / ${collectionsTotal}`} />
        <Summary label="Achievement" value={achievementProgress.achievementId ? `${achievementProgress.collectedCount} / ${achievementProgress.totalCount}` : 'Not configured'} />
        <Summary label="Crew" value={crewName || 'Solo Explorer'} />
      </div>
      <div style={styles.progress}>
        <div style={styles.progressHeader}><span>OVERALL JOURNEY PROGRESS</span><strong>{percent}%</strong></div>
        <div style={styles.track}><div style={{ ...styles.fill, width: `${percent}%` }} /></div>
      </div>
      <div style={styles.recent}>
        <span style={styles.eyebrow}>RECENT DISCOVERY</span>
        {recentDiscovery ? <DiscoveryCard discovery={recentDiscovery} collected variant="compact" /> : <p>Your next discovery is waiting.</p>}
      </div>
    </section>
  )
}

function Summary({ label, value }) { return <article style={styles.item}><span>{label}</span><strong>{value}</strong></article> }
const styles = {
  page: { display: 'grid', gap: 18 }, eyebrow: { color: '#f1bd63', fontSize: 9, fontWeight: 900, letterSpacing: '.18em' },
  title: { margin: '7px 0 2px', fontSize: 32 }, subtitle: { margin: 0, color: 'rgba(255,255,255,.62)' },
  summary: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 },
  item: { display: 'grid', gap: 6, padding: 14, borderRadius: 16, background: '#101716', border: '1px solid rgba(241,189,99,.14)' },
  progress: { padding: 16, borderRadius: 18, background: '#101413' }, progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 9, fontSize: 10, color: 'rgba(255,255,255,.68)' },
  track: { height: 9, borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,.08)' }, fill: { height: '100%', background: 'linear-gradient(90deg,#708765,#f1bd63)' },
  recent: { display: 'grid', gap: 9 },
}
