import { DiscoveryCard } from '../DiscoveryCards/index.js'

export default function RecentDiscoveryCard({ discovery, onOpen }) {
  if (!discovery) {
    return (
      <section style={styles.emptyCard}>
        <span style={styles.label}>RECENT DISCOVERY</span>
        <strong style={styles.emptyTitle}>
          Your next discovery is waiting.
        </strong>
      </section>
    )
  }

  return (
    <section style={styles.recent}>
      <span style={styles.label}>RECENT DISCOVERY</span>
      <DiscoveryCard discovery={discovery} collected variant="compact" onOpen={onOpen} />
    </section>
  )
}

const styles = {
  recent: { display: 'grid', gap: 10 },
  emptyCard: {
    minHeight: 150,
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 24,
    border: '1px solid rgba(120,255,214,0.18)',
    background: 'rgba(8,18,20,0.88)',
  },
  label: {
    color: '#78ffd6',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.18em',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 22,
  },
}
