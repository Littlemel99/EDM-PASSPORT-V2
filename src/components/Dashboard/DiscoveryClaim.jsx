export default function DiscoveryClaim({
  discovery,
  onVerifyClaim,
  onNotNow,
}) {
  if (!discovery) return null

  const rarity = String(discovery.rarity || 'common').toUpperCase()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Verify claim for ${discovery.name}`}
      style={styles.overlay}
    >
      <section style={styles.card}>
        <span style={styles.status}>TARGET LOCATED</span>

        <div style={styles.imageWrap}>
          {discovery.image ? (
            <img
              src={discovery.image}
              alt={discovery.name}
              style={styles.image}
            />
          ) : (
            <span style={styles.fallback} aria-hidden="true">
              {discovery.fallback || '✨'}
            </span>
          )}
        </div>

        <h2 style={styles.title}>{discovery.name}</h2>
        <span style={styles.rarity}>{rarity}</span>

        <div style={styles.hintCard}>
          <span style={styles.label}>LOCATION HINT</span>
          <strong>
            {discovery.location || 'Explore the active festival area.'}
          </strong>
        </div>

        <div style={styles.verificationCard}>
          <span style={styles.verificationTitle}>
            VERIFICATION REQUIRED
          </span>
          <p style={styles.explanation}>
            Radar locating a target is not proof of collection. Verify the
            discovery through the existing QR, NFC, GPS, live-drop, or
            authorized admin-test claim flow before it can be collected.
          </p>
        </div>

        <button
          type="button"
          style={styles.verifyButton}
          onClick={() => onVerifyClaim?.(discovery)}
        >
          VERIFY CLAIM
        </button>

        <button
          type="button"
          style={styles.notNowButton}
          onClick={onNotNow}
        >
          NOT NOW
        </button>
      </section>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: 16,
    overflowY: 'auto',
    background: 'rgba(0,0,0,.94)',
    backdropFilter: 'blur(10px)',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    boxSizing: 'border-box',
    padding: 20,
    borderRadius: 24,
    color: '#ffffff',
    textAlign: 'center',
    background: 'linear-gradient(180deg, #08051c, #160525)',
    border: '1px solid rgba(114,255,143,.55)',
    boxShadow: '0 25px 80px rgba(0,0,0,.65)',
  },

  status: {
    display: 'inline-block',
    padding: '7px 11px',
    borderRadius: 999,
    color: '#061008',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.5,
    background: '#72ff8f',
  },

  imageWrap: {
    width: 190,
    height: 190,
    margin: '18px auto 14px',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    background: 'rgba(255,255,255,.07)',
    border: '1px solid rgba(255,255,255,.16)',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  fallback: {
    fontSize: 80,
  },

  title: {
    margin: 0,
    fontSize: 25,
  },

  rarity: {
    display: 'inline-block',
    marginTop: 8,
    color: '#00f5ff',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.5,
  },

  hintCard: {
    marginTop: 16,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    borderRadius: 15,
    textAlign: 'left',
    background: 'rgba(0,245,255,.07)',
    border: '1px solid rgba(0,245,255,.25)',
  },

  label: {
    fontSize: 10,
    letterSpacing: 1.6,
    opacity: 0.68,
  },

  verificationCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 15,
    textAlign: 'left',
    background: 'rgba(255,79,216,.08)',
    border: '1px solid rgba(255,79,216,.3)',
  },

  verificationTitle: {
    display: 'block',
    color: '#ff8be5',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.5,
  },

  explanation: {
    margin: '8px 0 0',
    lineHeight: 1.5,
    opacity: 0.84,
  },

  verifyButton: {
    width: '100%',
    marginTop: 16,
    padding: '14px 16px',
    border: 0,
    borderRadius: 14,
    cursor: 'pointer',
    fontWeight: 900,
    color: '#061008',
    background: 'linear-gradient(90deg, #72ff8f, #00f5ff)',
  },

  notNowButton: {
    width: '100%',
    marginTop: 10,
    padding: '12px 16px',
    borderRadius: 14,
    cursor: 'pointer',
    color: '#ffffff',
    fontWeight: 800,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,.2)',
  },
}
