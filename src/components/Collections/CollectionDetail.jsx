import { DiscoveryCardGrid } from '../DiscoveryCards/index.js'
import {
  calculateCollectionProgress,
  getCollectionDiscoveryRecords,
} from '../../collections/CollectionEngine.js'

export default function CollectionDetail({
  collection,
  discoveries,
  collectedIds,
  onBack,
}) {
  const progress = calculateCollectionProgress(collection, collectedIds)
  const records = getCollectionDiscoveryRecords(collection, discoveries)

  return (
    <section style={styles.screen}>
      <button type="button" style={styles.backButton} onClick={onBack}>
        BACK TO COLLECTIONS
      </button>

      <header style={styles.header}>
        <span style={styles.eyebrow}>COLLECTION</span>
        <h2 style={styles.title}>{collection.name}</h2>
        <p style={styles.description}>{collection.description}</p>
        <div style={styles.progressHeader}>
          <span>
            {progress.collectedCount} / {progress.totalCount} discovered
          </span>
          <strong>{progress.percent}%</strong>
        </div>
        <ProgressBar percent={progress.percent} />
      </header>

      <DiscoveryCardGrid discoveries={records} collectedIds={collectedIds} />
    </section>
  )
}

function ProgressBar({ percent }) {
  return (
    <div style={styles.progressTrack}>
      <div style={{ ...styles.progressFill, width: `${percent}%` }} />
    </div>
  )
}

const styles = {
  screen: {
    display: 'grid',
    gap: 18,
  },
  backButton: {
    justifySelf: 'start',
    padding: '9px 12px',
    borderRadius: 999,
    border: '1px solid rgba(120,255,214,0.24)',
    color: '#baffea',
    background: 'rgba(120,255,214,0.06)',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.12em',
    cursor: 'pointer',
  },
  header: {
    padding: 20,
    borderRadius: 24,
    color: '#f7fff9',
    background: 'linear-gradient(145deg, #142c26, #080e12)',
    border: '1px solid rgba(120,255,214,0.2)',
  },
  eyebrow: {
    color: '#78ffd6',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.2em',
  },
  title: {
    margin: '8px 0 6px',
    fontSize: 32,
    letterSpacing: '-0.045em',
  },
  description: {
    margin: 0,
    color: 'rgba(240,255,248,0.68)',
    lineHeight: 1.5,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 0 8px',
    color: 'rgba(240,255,248,0.72)',
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.09)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #63e6be, #b4ffdf)',
    boxShadow: '0 0 18px rgba(120,255,214,0.4)',
  },
}
