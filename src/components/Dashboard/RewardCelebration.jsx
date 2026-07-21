export default function RewardCelebration({
  result,
  developerMode = false,
  onContinue,
  onRepeatLastClaim,
  onViewInPassport,
}) {
  if (!result?.discovery) return null

  const { discovery, missionProgress } = result
  const rarity = String(discovery.rarity || 'common').toUpperCase()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Reward celebration for ${discovery.name}`}
      style={styles.overlay}
    >
      <section style={styles.card}>
        <span style={styles.eyebrow}>DISCOVERY VERIFIED</span>

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

        <div style={styles.statGrid}>
          <div style={styles.statCard}>
            <strong>+{result.xpEarned}</strong>
            <span>XP EARNED</span>
          </div>

          <div style={styles.statCard}>
            <strong>{result.collectionCount}</strong>
            <span>COLLECTED</span>
          </div>

          <div style={styles.statCard}>
            <strong>{result.collectionPercent}%</strong>
            <span>COMPLETE</span>
          </div>
        </div>

        {!result.isNew && (
          <p style={styles.ownedMessage}>
            Already in your passport. No duplicate XP or mission progress was
            awarded.
          </p>
        )}

        {missionProgress && (
          <div style={styles.missionCard}>
            <span style={styles.label}>DAILY MISSION</span>
            <strong>
              {missionProgress.progress} / {missionProgress.target}
            </strong>
          </div>
        )}

        {missionProgress?.rewardUnlocked && (
          <div style={styles.rewardCard}>
            <span style={styles.label}>BADGE UNLOCKED</span>
            <strong>{missionProgress.rewardUnlocked}</strong>
          </div>
        )}

        <button
          type="button"
          style={styles.primaryButton}
          onClick={onContinue}
        >
          CONTINUE
        </button>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => onViewInPassport?.(discovery)}
        >
          VIEW IN PASSPORT
        </button>

        {developerMode && (
          <button
            type="button"
            style={styles.developerButton}
            onClick={() => onRepeatLastClaim?.(discovery)}
          >
            REPEAT PREVIOUS DISCOVERY
          </button>
        )}
      </section>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 10001,
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
    background: 'linear-gradient(180deg, #100326, #07192a)',
    border: '1px solid rgba(250,204,21,.58)',
    boxShadow: '0 25px 90px rgba(0,0,0,.7)',
  },

  eyebrow: {
    display: 'inline-block',
    padding: '7px 11px',
    borderRadius: 999,
    color: '#110b00',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.5,
    background: '#facc15',
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
    fontSize: 26,
  },

  rarity: {
    display: 'inline-block',
    marginTop: 8,
    color: '#00f5ff',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.5,
  },

  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
    marginTop: 18,
  },

  statCard: {
    minHeight: 72,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
    background: 'rgba(255,255,255,.07)',
    fontSize: 11,
  },

  ownedMessage: {
    margin: '14px 0 0',
    padding: 12,
    borderRadius: 13,
    lineHeight: 1.45,
    background: 'rgba(255,255,255,.06)',
  },

  missionCard: {
    marginTop: 12,
    padding: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 14,
    background: 'rgba(0,245,255,.07)',
    border: '1px solid rgba(0,245,255,.25)',
  },

  rewardCard: {
    marginTop: 12,
    padding: 13,
    borderRadius: 14,
    textAlign: 'left',
    background: 'rgba(114,255,143,.09)',
    border: '1px solid rgba(114,255,143,.3)',
  },

  label: {
    display: 'block',
    fontSize: 10,
    letterSpacing: 1.5,
    opacity: 0.7,
  },

  primaryButton: {
    width: '100%',
    marginTop: 16,
    padding: '14px 16px',
    border: 0,
    borderRadius: 14,
    cursor: 'pointer',
    color: '#100b00',
    fontWeight: 900,
    background: 'linear-gradient(90deg, #facc15, #72ff8f)',
  },

  secondaryButton: {
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

  developerButton: {
    width: '100%',
    marginTop: 10,
    padding: '12px 16px',
    borderRadius: 14,
    cursor: 'pointer',
    color: '#facc15',
    fontWeight: 900,
    background: 'rgba(250,204,21,.06)',
    border: '1px dashed rgba(250,204,21,.55)',
  },
}
