import DiscoveryCard from './DiscoveryCard.jsx'
import { getAchievementProgress } from './discoveryCardTheme.js'

export default function FestivalAchievementShowcase({ achievements = [], discoveries = [], collectedIds = [] }) {
  if (!achievements.length) return null

  return (
    <section style={styles.section} aria-labelledby="festival-achievements-title">
      <div>
        <span style={styles.eyebrow}>EDITION PROGRESSION</span>
        <h3 id="festival-achievements-title" style={styles.title}>Achievements</h3>
        <p style={styles.description}>Milestones unlocked by completing the festival discovery journey.</p>
      </div>
      <div style={styles.grid}>
        {achievements.map((achievement) => {
          const progress = getAchievementProgress(achievement, discoveries, collectedIds)
          return (
            <article key={achievement.id} style={styles.item}>
              <DiscoveryCard discovery={achievement} collected={progress.unlocked} variant="full" />
              <div style={styles.progressHeader}>
                <span>{progress.unlocked ? 'UNLOCKED' : 'PROGRESSION REQUIRED'}</span>
                <strong>{progress.collectedCount} / {progress.totalCount}</strong>
              </div>
              <div style={styles.track} aria-label={`${progress.percent}% achievement progress`}>
                <div style={{ ...styles.fill, width: `${progress.percent}%` }} />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

const styles = {
  section: { display: 'grid', gap: 14, marginTop: 22, paddingTop: 20, borderTop: '1px solid rgba(241,189,99,.2)' },
  eyebrow: { color: '#f1bd63', fontSize: 9, fontWeight: 900, letterSpacing: '.17em' },
  title: { margin: '6px 0 4px', fontSize: 24, color: '#fff9eb' },
  description: { margin: 0, color: 'rgba(255,255,255,.62)', fontSize: 12, lineHeight: 1.5 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 },
  item: { display: 'grid', gap: 10 },
  progressHeader: { display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,.65)', fontSize: 9, fontWeight: 900, letterSpacing: '.1em' },
  track: { height: 7, overflow: 'hidden', borderRadius: 999, background: 'rgba(255,255,255,.09)' },
  fill: { height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#9b7539,#f1bd63)', boxShadow: '0 0 14px rgba(241,189,99,.28)' },
}
