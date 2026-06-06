import { getPassportImage } from '../data/passports'

export default function FlexCard({ displayName, country, stats, topStamp, crew }) {
  return (
    <div style={styles.flexCardContainer}>
      <div style={styles.flexGlow} />

      <div style={styles.flexHeader}>
        <div>
          <p style={styles.eyebrowPink}>EDM PASSPORT FLEX</p>
          <h1 style={styles.flexName}>{displayName}</h1>
          <p style={styles.tag}>{stats.level}</p>
        </div>

        <img
          src={getPassportImage(country)}
          alt="Passport"
          style={styles.flexPassport}
        />
      </div>

      <div style={styles.flexStatsGrid}>
        <div style={styles.flexStat}>
          <strong>{stats.totalXp}</strong>
          <span>XP</span>
        </div>

        <div style={styles.flexStat}>
          <strong>{stats.score}</strong>
          <span>SCORE</span>
        </div>

        <div style={styles.flexStat}>
          <strong>{stats.completion}%</strong>
          <span>COMPLETE</span>
        </div>
      </div>

      <div style={styles.flexStampShowcase}>
        <img
          src={topStamp?.image}
          alt={topStamp?.name}
          style={styles.flexStampImage}
        />

        <div>
          <p style={styles.eyebrow}>LEGENDARY SHOWCASE</p>
          <h2>{topStamp?.name || 'No Legendary Yet'}</h2>
          <p style={styles.muted}>{topStamp?.rarity || 'Collect more stamps'}</p>
          <p style={styles.muted}>Crew: {crew?.name || 'Solo Traveler'}</p>
        </div>
      </div>

      <div style={styles.flexFooter}>
        <div>
          <p style={styles.qrFake}>SCAN TO VIEW FULL PASSPORT</p>
          <small style={styles.muted}>EDC LAS VEGAS 2026</small>
        </div>

        <div style={styles.fakeQrBox}>
          ◼︎◻︎◼︎
          <br />
          ◻︎◼︎◻︎
          <br />
          ◼︎◻︎◼︎
        </div>
      </div>
    </div>
  )
}

const styles = {
  flexCardContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, rgba(255,0,200,.35), rgba(0,255,255,.22), rgba(255,140,0,.24))',
    border: '1px solid rgba(255,255,255,.22)',
    boxShadow: '0 0 80px rgba(255,0,255,.28)',
    color: 'white',
  },
  flexGlow: {
    position: 'absolute',
    inset: -100,
    background: 'radial-gradient(circle, rgba(255,255,255,.22), transparent 60%)',
  },
  flexHeader: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  eyebrowPink: {
    color: '#f9a8d4',
    fontSize: 11,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    fontWeight: 900,
    margin: 0,
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 11,
    letterSpacing: '.22em',
    textTransform: 'uppercase',
    fontWeight: 900,
    margin: 0,
  },
  flexName: {
    fontSize: 32,
    margin: '4px 0',
    fontWeight: 900,
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
  flexPassport: {
    width: 90,
    height: 120,
    objectFit: 'cover',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,.35)',
  },
  flexStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 10,
    marginTop: 20,
  },
  flexStat: {
    padding: 12,
    borderRadius: 16,
    background: 'rgba(0,0,0,.32)',
    textAlign: 'center',
    fontWeight: 900,
    display: 'flex',
    flexDirection: 'column',
  },
  flexStampShowcase: {
    marginTop: 20,
    padding: 14,
    borderRadius: 20,
    display: 'grid',
    gridTemplateColumns: '90px 1fr',
    gap: 14,
    alignItems: 'center',
    background: 'rgba(0,0,0,.28)',
  },
  flexStampImage: {
    width: 90,
    height: 90,
    borderRadius: 999,
    objectFit: 'cover',
    border: '3px solid rgba(255,255,255,.4)',
    boxShadow: '0 0 30px rgba(255,255,255,.22)',
  },
  flexFooter: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fakeQrBox: {
    width: 68,
    height: 68,
    borderRadius: 10,
    background: 'white',
    color: 'black',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 900,
  },
  qrFake: {
    fontWeight: 900,
    letterSpacing: '.12em',
    fontSize: 10,
  },
}
