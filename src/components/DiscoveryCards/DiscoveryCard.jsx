import './discoveryCards.css'
import { getDiscoveryCardPresentation } from './discoveryCardTheme.js'

export default function DiscoveryCard({ discovery, collected = false, variant = 'grid', onOpen }) {
  const view = getDiscoveryCardPresentation(discovery, { collected, variant })
  const interactive =
    Boolean(onOpen) &&
    !view.achievement &&
    !view.restricted &&
    !view.locked
  const Element = interactive ? 'button' : 'article'

  return (
    <Element
      type={interactive ? 'button' : undefined}
      className={`discovery-card discovery-card--${view.variant}`}
      style={getCardStyle(view)}
      onClick={interactive ? () => onOpen(discovery) : undefined}
      aria-label={interactive ? `Open ${view.title}` : undefined}
      data-discovery-id={view.discoveryId}
    >
      <Artwork view={view} />
      <div style={styles.content}>
        <div style={styles.topline}>
          <span style={{ ...styles.rarity, color: view.rarity.accent }}>{view.rarity.label}</span>
          <span style={styles.state}>{view.stateLabel}</span>
        </div>
        <h3 style={styles.title}>{view.title}</h3>
        <span style={styles.category}>{view.categoryLabel}</span>
        {view.location && <span style={styles.location}>{view.location}</span>}
        <p style={styles.story}>{view.description}</p>
        <div style={styles.footer}>
          <span>{view.editionLabel}</span>
          {view.xp > 0 && <strong>{view.xp} XP</strong>}
        </div>
        {view.achievement && <p style={styles.achievement}>PROGRESSION UNLOCK</p>}
      </div>
    </Element>
  )
}

function Artwork({ view }) {
  return (
    <div style={{ ...styles.artwork, background: view.artwork.background }} className="discovery-card__art">
      {view.image ? (
        <img src={view.image} alt={`${view.title} discovery artwork`} style={styles.image} />
      ) : (
        <>
          <div className={`discovery-card__shape discovery-card__shape--${view.artwork.motif}`} style={{ color: view.artwork.accent }} />
          <span style={styles.mysteryLabel}>{view.restricted ? 'IDENTITY CONCEALED' : view.categoryLabel}</span>
        </>
      )}
      {view.editionYear && <span style={styles.editionMark}>{view.editionYear}</span>}
    </div>
  )
}

function getCardStyle(view) {
  const compact = view.variant === 'compact'
  const detail = view.variant === 'detail'
  return {
    display: compact ? 'grid' : 'block',
    gridTemplateColumns: compact ? 'minmax(110px,.7fr) minmax(0,1.4fr)' : undefined,
    borderRadius: detail ? 26 : 20,
    border: `1px solid ${view.rarity.border}`,
    color: view.rarity.text,
    background: `linear-gradient(155deg, ${view.rarity.surface}, #080b0b)`,
    boxShadow: `0 18px 40px rgba(0,0,0,.3), 0 0 22px ${view.rarity.glow}`,
    transition: view.motion,
    padding: 0,
  }
}

const styles = {
  artwork: { minHeight: 170, display: 'grid', placeItems: 'center' },
  image: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  mysteryLabel: { position: 'absolute', left: 14, bottom: 12, zIndex: 2, color: 'rgba(255,255,255,.55)', fontSize: 8, fontWeight: 900, letterSpacing: '.16em' },
  editionMark: { position: 'absolute', right: 13, top: 12, zIndex: 2, color: 'rgba(255,255,255,.48)', fontSize: 10, fontWeight: 900, letterSpacing: '.12em' },
  content: { minWidth: 0, padding: 15 },
  topline: { display: 'flex', justifyContent: 'space-between', gap: 8 },
  rarity: { fontSize: 8, fontWeight: 900, letterSpacing: '.15em' },
  state: { color: 'rgba(255,255,255,.58)', fontSize: 8, fontWeight: 900, letterSpacing: '.12em' },
  title: { margin: '9px 0 5px', fontSize: 19, lineHeight: 1.05, letterSpacing: '-.03em' },
  category: { color: 'rgba(255,255,255,.55)', fontSize: 9, fontWeight: 800, letterSpacing: '.1em' },
  location: { display: 'block', marginTop: 8, color: 'rgba(255,255,255,.72)', fontSize: 11 },
  story: { margin: '10px 0 13px', color: 'rgba(255,255,255,.67)', fontSize: 11, lineHeight: 1.45 },
  footer: { display: 'flex', justifyContent: 'space-between', gap: 8, color: 'rgba(255,255,255,.48)', fontSize: 8, letterSpacing: '.09em', textTransform: 'uppercase' },
  achievement: { margin: '12px 0 0', color: '#f1bd63', fontSize: 8, fontWeight: 900, letterSpacing: '.14em' },
}
