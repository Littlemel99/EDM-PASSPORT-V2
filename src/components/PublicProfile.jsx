import { stamps } from '../data/stamps'
import { getPassportImage } from '../data/passports'
import { getStats, getAchievements } from '../lib/stats'
import Stamp from './Stamp'
import FlexCard from './FlexCard'

const APP_URL = 'https://edm-passport-v2.vercel.app'

export default function PublicProfile({
  user,
  displayName,
  country,
  collectedIds,
  crew,
  scannerUser,
  scannerProfile,
  ownerFamily,
  smartMessage,
  joinLoading,
  onCreatePassport,
  onJoinFamily,
  onOpenOwnPassport,
}) {
  const collected = stamps.filter((stamp) => collectedIds.includes(stamp.id))
  const stats = getStats(collected, stamps.length)
  const achievements = getAchievements(collected)
  const unlockedAchievements = achievements.filter((badge) => badge.unlocked)
  const topStamp =
    collected.find((stamp) => stamp.glow === 'legendary') || collected[0]
  const profileUrl = `${APP_URL}?profile=${encodeURIComponent(user?.id || 'me')}`
  const isOwnProfile = scannerUser?.id && user?.id && scannerUser.id === user.id
  const scannerHasPassport = Boolean(scannerProfile?.rave_name && scannerProfile?.country)
  const ownerFamilyName = ownerFamily?.name || `${displayName}'s Family`

  return (
    <main style={styles.screen}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>Public Passport Profile</p>

        <div style={styles.publicProfileHero}>
          <img
            src={getPassportImage(country)}
            alt="Passport cover"
            style={styles.publicProfilePassport}
          />

          <div>
            <h1 style={styles.heroTitle}>{displayName}</h1>
            <p style={styles.tag}>{stats.level}</p>
            <p style={styles.muted}>
              {country || 'Country not selected'} Passport Holder
            </p>
            <p style={styles.muted}>Crew: {crew?.name || 'Solo Traveler'}</p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <Stat label="XP" value={stats.totalXp} />
          <Stat label="Score" value={stats.score} />
          <Stat label="Complete" value={`${stats.completion}%`} />
          <Stat label="Badges" value={unlockedAchievements.length} />
        </div>

        <p style={styles.eyebrowPink}>Badge Showcase</p>

        <div style={styles.badgeGrid}>
          {achievements.map((badge) => (
            <span
              key={badge.name}
              style={badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked}
            >
              {badge.icon} {badge.name}
            </span>
          ))}
        </div>

        <p style={styles.eyebrowPink}>Collected Showcase</p>

        <div style={styles.stampGrid}>
          {collected.map((stamp) => (
            <div key={stamp.id} style={styles.stampCell}>
              <Stamp stamp={stamp} collected />
              <small>{stamp.name}</small>
            </div>
          ))}
        </div>

        <FlexCard
          displayName={displayName}
          country={country}
          stats={stats}
          topStamp={topStamp}
          crew={crew}
        />

        <div style={styles.smartCard}>
          <p style={styles.eyebrowPink}>Scanner Flow</p>

          {isOwnProfile ? (
            <>
              <strong>This is your EDM Passport.</strong>
              <p style={styles.muted}>Open your passport to keep collecting stamps.</p>
              <button style={styles.mainButton} onClick={onOpenOwnPassport}>
                OPEN MY PASSPORT
              </button>
            </>
          ) : scannerHasPassport ? (
            <>
              <strong>Connect with {displayName}</strong>
              <p style={styles.muted}>Join {ownerFamilyName} and connect your EDM Passport journey.</p>
              <button style={styles.mainButton} onClick={onJoinFamily} disabled={joinLoading}>
                {joinLoading ? 'JOINING FAMILY...' : `JOIN ${displayName.toUpperCase()}'S FAMILY`}
              </button>
            </>
          ) : (
            <>
              <strong>Create your EDM Passport.</strong>
              <p style={styles.muted}>Make your rave name, choose your passport cover, then scan again to join this family.</p>
              <button style={styles.mainButton} onClick={onCreatePassport}>
                CREATE YOUR EDM PASSPORT
              </button>
            </>
          )}

          {smartMessage && <p style={styles.successText}>{smartMessage}</p>}
        </div>

        <button
          style={styles.mainButton}
          onClick={() =>
            navigator.share?.({
              title: 'My EDM Passport',
              text: `${displayName} is a ${stats.level} with ${stats.totalXp} XP.`,
              url: profileUrl,
            })
          }
        >
          SHARE PUBLIC PROFILE
        </button>
      </section>
    </main>
  )
}

function Stat({ label, value }) {
  return (
    <div style={styles.statPill}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

const styles = {
  screen: {
    minHeight: '100vh',
    padding: '12px',
    color: 'white',
    fontFamily: 'Arial, Helvetica, sans-serif',
    background:
      'radial-gradient(circle at top, rgba(255,0,200,.30), transparent 42%), radial-gradient(circle at bottom, rgba(0,255,255,.24), transparent 45%), #03040a',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: 430,
    margin: '0 auto 18px',
    padding: 16,
    borderRadius: 24,
    background: 'rgba(0,0,0,.72)',
    border: '1px solid rgba(0,255,255,.25)',
    boxShadow: '0 0 70px rgba(255,0,255,.18)',
    boxSizing: 'border-box',
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 11,
    letterSpacing: '.22em',
    textTransform: 'uppercase',
    fontWeight: 900,
    margin: 0,
  },
  eyebrowPink: {
    color: '#f9a8d4',
    fontSize: 11,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    fontWeight: 900,
    marginTop: 20,
  },
  heroTitle: {
    fontSize: 'clamp(30px, 8vw, 42px)',
    lineHeight: 1,
    margin: '16px 0',
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
  publicProfileHero: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  publicProfilePassport: {
    width: 120,
    height: 160,
    borderRadius: 18,
    objectFit: 'cover',
    border: '1px solid rgba(0,255,255,.35)',
    boxShadow: '0 0 35px rgba(0,255,255,.22)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
    gap: 10,
    margin: '14px 0',
  },
  statPill: {
    padding: 12,
    borderRadius: 16,
    background: 'rgba(255,255,255,.42)',
    color: '#2a1608',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 900,
  },
  badgeGrid: {
    display: 'grid',
    gap: 8,
    marginTop: 14,
  },
  badgeUnlocked: {
    padding: 10,
    borderRadius: 14,
    background: 'rgba(253,224,71,.28)',
    fontWeight: 900,
  },
  badgeLocked: {
    padding: 10,
    borderRadius: 14,
    background: 'rgba(255,255,255,.20)',
    opacity: 0.45,
    fontWeight: 900,
  },
  stampGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
    gap: 12,
    marginTop: 14,
  },
  stampCell: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 900,
  },
  smartCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    background: 'rgba(255,255,255,.10)',
    border: '1px solid rgba(0,255,255,.22)',
    display: 'grid',
    gap: 8,
  },
  successText: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    background: 'rgba(22,101,52,.30)',
    color: '#bbf7d0',
    fontWeight: 900,
  },
  mainButton: {
    width: '100%',
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    border: 0,
    fontWeight: 900,
    color: 'black',
    background: 'linear-gradient(90deg, #ff4fd8, #fb923c, #22d3ee)',
  },
}
