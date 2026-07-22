export default function RecentDiscoveryCard({ discovery }) {
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
    <section style={styles.card}>
      <div style={styles.artwork}>
        {discovery.image ? (
          <img
            src={discovery.image}
            alt={discovery.name}
            style={styles.image}
          />
        ) : (
          <span style={styles.artworkLabel}>DISCOVERY</span>
        )}
      </div>

      <div style={styles.content}>
        <span style={styles.label}>RECENT DISCOVERY</span>
        <h3 style={styles.title}>{discovery.name}</h3>
        <div style={styles.metadata}>
          <span>{discovery.category || 'Festival Discovery'}</span>
          <span>{String(discovery.rarity || 'common').toUpperCase()}</span>
        </div>
        <p style={styles.story}>
          {discovery.description ||
            'A new chapter has been added to your festival journey.'}
        </p>
      </div>
    </section>
  )
}

const styles = {
  card: {
    display: 'grid',
    gridTemplateColumns: 'minmax(110px, 0.72fr) minmax(0, 1.4fr)',
    gap: 18,
    padding: 18,
    borderRadius: 24,
    border: '1px solid rgba(120,255,214,0.2)',
    background:
      'linear-gradient(145deg, rgba(17,36,34,0.94), rgba(8,13,18,0.98))',
    boxShadow: '0 20px 46px rgba(0,0,0,0.3)',
  },
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
  artwork: {
    minHeight: 150,
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    borderRadius: 18,
    background:
      'radial-gradient(circle at 28% 20%, rgba(120,255,214,0.2), transparent 34%), linear-gradient(145deg, #172c27, #080d11)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  artworkLabel: {
    color: 'rgba(225,255,242,0.48)',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.22em',
  },
  content: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  label: {
    color: '#78ffd6',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.18em',
  },
  title: {
    margin: '8px 0 10px',
    fontSize: 24,
    letterSpacing: '-0.035em',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 22,
  },
  metadata: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    color: 'rgba(235,255,247,0.62)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  story: {
    margin: '14px 0 0',
    color: 'rgba(240,255,248,0.72)',
    fontSize: 13,
    lineHeight: 1.55,
  },
}
