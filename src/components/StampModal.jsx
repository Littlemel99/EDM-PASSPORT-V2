export default function StampModal({ stamp, onClose }) {
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>×</button>
        <h2>{stamp.name}</h2>
        <img src={stamp.image} alt={stamp.name} style={styles.largeStamp} />
        <p style={styles.tag}>{stamp.rarity}</p>
        <p style={styles.muted}>{stamp.location}</p>
        <p style={styles.muted}>{stamp.collectedAt || 'Collected Tonight'}</p>
      </div>
    </div>
  )
}

const styles = {
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,.82)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 18,
    borderRadius: 24,
    background: 'rgba(0,0,0,.95)',
    textAlign: 'center',
    border: '1px solid rgba(103,232,249,.32)',
    color: 'white',
  },
  closeButton: {
    float: 'right',
    width: 36,
    height: 36,
    borderRadius: 999,
    background: 'rgba(255,255,255,.1)',
    color: 'white',
    border: 0,
    fontSize: 24,
  },
  largeStamp: {
    width: 'min(72vw, 280px)',
    height: 'min(72vw, 280px)',
    objectFit: 'cover',
    borderRadius: 999,
    border: '4px solid rgba(255,255,255,.55)',
  },
  tag: {
    color: '#67e8f9',
    fontSize: 11,
    letterSpacing: '.22em',
    textTransform: 'uppercase',
    fontWeight: 900,
  },
  muted: {
    color: 'rgba(255,255,255,.68)',
  },
}
