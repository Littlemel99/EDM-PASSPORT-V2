export default function JourneyActionCard({
  title,
  subtitle,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      style={{
        ...styles.card,
        ...(disabled ? styles.disabled : {}),
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <span style={styles.line} />
      <strong style={styles.title}>{title}</strong>
      <span style={styles.subtitle}>{subtitle}</span>
      <span style={styles.action}>OPEN</span>
    </button>
  )
}

const styles = {
  card: {
    minHeight: 154,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    borderRadius: 20,
    border: '1px solid rgba(120,255,214,0.2)',
    color: '#f7fff9',
    background:
      'linear-gradient(155deg, rgba(18,45,38,0.92), rgba(7,15,18,0.96))',
    boxShadow: '0 16px 34px rgba(0,0,0,0.25)',
    cursor: 'pointer',
  },
  disabled: {
    cursor: 'default',
    opacity: 0.48,
  },
  line: {
    width: 34,
    height: 2,
    marginBottom: 18,
    background: '#78ffd6',
    boxShadow: '0 0 14px rgba(120,255,214,0.75)',
  },
  title: {
    fontSize: 18,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    marginTop: 8,
    color: 'rgba(235,255,247,0.65)',
    fontSize: 13,
    lineHeight: 1.45,
  },
  action: {
    marginTop: 'auto',
    paddingTop: 18,
    color: '#78ffd6',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.18em',
  },
}
