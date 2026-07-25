import { useState } from 'react'
import DiscoveryClaim from './DiscoveryClaim.jsx'
import { getDiscoveryRadarDisplay } from './DiscoveryRadarData.js'

const scanStates = [
  {
    label: 'READY TO HUNT',
    message: 'Start the radar when you are ready to explore.',
  },
  {
    label: 'SIGNAL FOUND',
    message: 'A discovery signal is active somewhere in the festival.',
  },
  {
    label: 'SIGNAL STABLE',
    message: 'Use the location hint and look for matching landmarks.',
  },
  {
    label: 'TARGET LOCKED',
    message: 'Open the passport to inspect the discovery and claim options.',
  },
]

export default function DiscoveryRadar({
  discovery,
  loading = false,
  emptyReason = null,
  onOpenDiscovery,
}) {
  const [radarOpen, setRadarOpen] = useState(false)
  const [claimOpen, setClaimOpen] = useState(false)
  const [scanStep, setScanStep] = useState(0)

  const handleOpenRadar = () => {
    setScanStep(0)
    setRadarOpen(true)
  }

  const handleCloseRadar = () => {
    setRadarOpen(false)
    setClaimOpen(false)
    setScanStep(0)
  }

  const handleTargetLocated = () => {
    setRadarOpen(false)
    setClaimOpen(true)
  }

  const handleVerifyClaim = () => {
    setClaimOpen(false)
    setScanStep(0)
    onOpenDiscovery?.(discovery)
  }

  const handleNotNow = () => {
    setClaimOpen(false)
    setScanStep(0)
  }

  const handleScan = () => {
    setScanStep((current) =>
      Math.min(current + 1, scanStates.length - 1)
    )
  }

  if (!discovery) {
    return (
      <section style={styles.emptyCard}>
        <span style={styles.label}>DISCOVERY RADAR</span>
        <strong>
          {loading
            ? 'Loading festival discoveries'
            : emptyReason || 'All current discoveries collected'}
        </strong>
        <p style={styles.text}>
          {loading
            ? 'Loading live and GPS drops for the selected festival.'
            : emptyReason === 'Waiting for configured discoveries'
              ? 'Configured discoveries are not available in the current catalog.'
              : 'New targets will appear when this edition adds more claimable discoveries.'}
        </p>
      </section>
    )
  }

  const scanState = scanStates[scanStep]
  const targetLocked = scanStep === scanStates.length - 1
  const display = getDiscoveryRadarDisplay(discovery)

  return (
    <>
      <section style={styles.launchCard}>
        <div style={styles.launchHeader}>
          <div>
            <h2 style={styles.launchTitle}>
              Signal Detected
            </h2>

            <p style={styles.text}>
              Your next discovery is waiting.
            </p>
          </div>

          <span style={styles.radarIcon}>◎</span>
        </div>

        <div style={styles.targetPreview}>
          <span style={styles.label}>CURRENT TARGET</span>
          <strong>{display.title}</strong>
          <small>{display.location}</small>
          <span style={styles.previewMetadata}>
            {display.metadata}
          </span>
        </div>

        <button
          type="button"
          style={styles.primaryButton}
          onClick={handleOpenRadar}
        >
          OPEN RADAR
        </button>
      </section>

      {radarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Discovery Radar"
          style={styles.overlay}
        >
          <section style={styles.radarPanel}>
            <div style={styles.topBar}>
              <div>
                <span style={styles.label}>
                  DISCOVERY RADAR
                </span>

                <h2 style={styles.panelTitle}>
                  {scanState.label}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close Discovery Radar"
                style={styles.closeButton}
                onClick={handleCloseRadar}
              >
                ×
              </button>
            </div>

            <div style={styles.radar}>
              <div style={styles.ringOuter}>
                <div style={styles.ringMiddle}>
                  <div style={styles.ringInner}>
                    <span
                      style={{
                        ...styles.targetDot,
                        opacity: scanStep === 0 ? 0.35 : 1,
                      }}
                    >
                      ●
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...styles.scanLine,
                  transform: `rotate(${scanStep * 75 - 35}deg)`,
                }}
              />
            </div>

            <div style={styles.targetCard}>
              <span style={styles.label}>TARGET</span>

              <strong style={styles.discoveryName}>
                {display.title}
              </strong>

              <div style={styles.metaRow}>
                <span>{display.metadata}</span>
              </div>
            </div>

            <div style={styles.hintCard}>
              <span style={styles.label}>LOCATION HINT</span>

              <strong>
                {display.location}
              </strong>

              <p style={styles.text}>
                Look for matching stage landmarks, themed
                installations, active crews, GPS drops, QR codes,
                or NFC checkpoints.
              </p>
            </div>

            <div style={styles.statusCard}>
              <span style={styles.label}>RADAR STATUS</span>

              <strong>{scanState.label}</strong>

              <p style={styles.text}>
                {scanState.message}
              </p>

              <div style={styles.stepRow}>
                {scanStates.map((state, index) => (
                  <span
                    key={state.label}
                    style={{
                      ...styles.stepDot,
                      opacity: index <= scanStep ? 1 : 0.22,
                    }}
                  />
                ))}
              </div>
            </div>

            {!targetLocked ? (
              <button
                type="button"
                style={styles.primaryButton}
                onClick={handleScan}
              >
                {scanStep === 0
                  ? 'START SCAN'
                  : 'SCAN AGAIN'}
              </button>
            ) : (
              <button
                type="button"
                style={styles.lockedButton}
                onClick={handleTargetLocated}
              >
                REVIEW TARGET
              </button>
            )}

            <p style={styles.disclaimer}>
              Beta radar does not claim live distance. Real proximity
              will require verified festival GPS coordinates.
            </p>
          </section>
        </div>
      )}

      {claimOpen && (
        <DiscoveryClaim
          discovery={
            display.restricted
              ? {
                  ...discovery,
                  name: display.title,
                  location: display.location,
                  image: null,
                  rarity: 'restricted',
                }
              : discovery
          }
          onVerifyClaim={handleVerifyClaim}
          onNotNow={handleNotNow}
        />
      )}
    </>
  )
}

const styles = {
  launchCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 18,
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(0,245,255,.12), rgba(168,85,247,.12))',
    border: '1px solid rgba(0,245,255,.35)',
  },

  emptyCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    color: '#ffffff',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.12)',
  },

  launchHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  launchTitle: {
    margin: 0,
    fontSize: 22,
  },

  radarIcon: {
    width: 55,
    height: 55,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 999,
    color: '#00f5ff',
    fontSize: 36,
    border: '1px solid rgba(0,245,255,.5)',
    boxShadow: '0 0 24px rgba(0,245,255,.2)',
  },

  targetPreview: {
    margin: '13px 0',
    padding: 13,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    borderRadius: 14,
    background: 'rgba(255,255,255,.06)',
  },

  previewMetadata: {
    marginTop: 5,
    color: 'rgba(255,255,255,.68)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '.04em',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: 16,
    overflowY: 'auto',
    background: 'rgba(0,0,0,.92)',
    backdropFilter: 'blur(9px)',
  },

  radarPanel: {
    width: '100%',
    maxWidth: 440,
    boxSizing: 'border-box',
    padding: 20,
    borderRadius: 24,
    color: '#ffffff',
    background:
      'linear-gradient(180deg, #08051c, #100323)',
    border: '1px solid rgba(0,245,255,.5)',
    boxShadow: '0 25px 80px rgba(0,0,0,.6)',
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },

  panelTitle: {
    margin: 0,
    fontSize: 23,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    cursor: 'pointer',
    color: '#ffffff',
    fontSize: 24,
    background: 'rgba(255,255,255,.08)',
    border: '1px solid rgba(255,255,255,.2)',
  },

  radar: {
    position: 'relative',
    width: 230,
    height: 230,
    margin: '24px auto',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: 999,
    background:
      'radial-gradient(circle, rgba(0,245,255,.2), rgba(0,0,0,.75) 68%)',
    border: '1px solid rgba(0,245,255,.5)',
    boxShadow:
      'inset 0 0 45px rgba(0,245,255,.12), 0 0 35px rgba(0,245,255,.18)',
  },

  ringOuter: {
    width: 190,
    height: 190,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    border: '1px solid rgba(0,245,255,.28)',
  },

  ringMiddle: {
    width: 130,
    height: 130,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    border: '1px solid rgba(0,245,255,.34)',
  },

  ringInner: {
    width: 70,
    height: 70,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    border: '1px solid rgba(0,245,255,.42)',
  },

  targetDot: {
    color: '#ff4fd8',
    fontSize: 22,
    textShadow: '0 0 16px #ff4fd8',
    transition: 'opacity 200ms ease',
  },

  scanLine: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '45%',
    height: 2,
    transformOrigin: 'left center',
    background:
      'linear-gradient(90deg, rgba(0,245,255,.95), transparent)',
    boxShadow: '0 0 12px rgba(0,245,255,.8)',
    transition: 'transform 350ms ease',
  },

  targetCard: {
    padding: 14,
    borderRadius: 15,
    background: 'rgba(255,255,255,.07)',
  },

  discoveryName: {
    display: 'block',
    fontSize: 21,
  },

  metaRow: {
    display: 'flex',
    gap: 7,
    marginTop: 7,
    fontSize: 12,
    opacity: 0.72,
  },

  hintCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 15,
    background: 'rgba(255,79,216,.07)',
    border: '1px solid rgba(255,79,216,.28)',
  },

  statusCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 15,
    background: 'rgba(0,245,255,.06)',
    border: '1px solid rgba(0,245,255,.25)',
  },

  stepRow: {
    display: 'flex',
    gap: 7,
    marginTop: 12,
  },

  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: '#00f5ff',
    boxShadow: '0 0 10px rgba(0,245,255,.7)',
  },

  label: {
    display: 'block',
    marginBottom: 5,
    fontSize: 10,
    letterSpacing: 1.7,
    opacity: 0.68,
  },

  text: {
    margin: '7px 0 0',
    lineHeight: 1.45,
    opacity: 0.8,
  },

  primaryButton: {
    width: '100%',
    marginTop: 14,
    padding: '14px 16px',
    border: 0,
    borderRadius: 14,
    cursor: 'pointer',
    fontWeight: 900,
    color: '#070314',
    background:
      'linear-gradient(90deg, #00f5ff, #a855f7, #ff4fd8)',
  },

  lockedButton: {
    width: '100%',
    marginTop: 14,
    padding: '14px 16px',
    border: 0,
    borderRadius: 14,
    cursor: 'pointer',
    fontWeight: 900,
    color: '#061008',
    background:
      'linear-gradient(90deg, #72ff8f, #00f5ff)',
  },

  disclaimer: {
    margin: '12px 0 0',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 1.4,
    opacity: 0.55,
  },
}
