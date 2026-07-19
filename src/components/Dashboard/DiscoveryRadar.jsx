import { useState } from 'react'

export default function DiscoveryRadar() {
  const [radarOpen, setRadarOpen] = useState(false)

  return (
    <>
      <section
        style={{
          marginTop: 16,
          padding: 18,
          borderRadius: 18,
          background:
            'linear-gradient(135deg, rgba(0,245,255,.12), rgba(168,85,247,.12))',
          border: '1px solid rgba(0,245,255,.35)',
          color: '#fff',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 2,
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          DISCOVERY RADAR
        </div>

        <h2 style={{ margin: 0 }}>
          Signal Detected
        </h2>

        <p style={{ opacity: 0.8 }}>
          Your next adventure is waiting.
        </p>

        <div
          style={{
            margin: '24px auto',
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: '2px solid #00f5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 42,
          }}
        >
          ◎
        </div>

        <button
          type="button"
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: 0,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={() => setRadarOpen(true)}
        >
          OPEN RADAR
        </button>
      </section>

      {radarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Discovery Radar"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <section
            style={{
              width: '100%',
              maxWidth: 440,
              boxSizing: 'border-box',
              padding: 20,
              borderRadius: 24,
              color: '#fff',
              background:
                'linear-gradient(180deg, #08051c, #100323)',
              border: '1px solid rgba(0,245,255,0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    opacity: 0.7,
                    marginBottom: 6,
                  }}
                >
                  DISCOVERY RADAR
                </div>

                <h2 style={{ margin: 0 }}>
                  Signal Detected
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close Discovery Radar"
                onClick={() => setRadarOpen(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 24,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                width: 230,
                height: 230,
                margin: '24px auto',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background:
                  'radial-gradient(circle, rgba(0,245,255,0.2), rgba(0,0,0,0.75) 68%)',
                border: '1px solid rgba(0,245,255,0.5)',
                boxShadow:
                  'inset 0 0 45px rgba(0,245,255,0.12), 0 0 35px rgba(0,245,255,0.18)',
              }}
            >
              <div
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid rgba(0,245,255,0.35)',
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid rgba(0,245,255,0.4)',
                  }}
                >
                  <span
                    style={{
                      color: '#ff4fd8',
                      fontSize: 24,
                      textShadow: '0 0 15px #ff4fd8',
                    }}
                  >
                    ●
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              <small style={{ opacity: 0.65 }}>
                RADAR STATUS
              </small>

              <strong
                style={{
                  display: 'block',
                  marginTop: 6,
                  fontSize: 18,
                }}
              >
                Ready to begin the hunt
              </strong>
            </div>

            <button
              type="button"
              disabled
              style={{
                width: '100%',
                marginTop: 14,
                padding: 14,
                borderRadius: 14,
                border: 0,
                fontWeight: 900,
                opacity: 0.45,
                cursor: 'not-allowed',
              }}
            >
              START SCAN
            </button>
          </section>
        </div>
      )}
    </>
  )
}
