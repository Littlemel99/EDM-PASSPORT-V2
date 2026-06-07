import { useState } from 'react'

export default function FamilyPage({
  styles,
  activeFamily,
  families,
  publicFamilies,
  familyInput,
  setFamilyInput,
  joinCode,
  setJoinCode,
  handleCreateFamily,
  handleJoinFamily,
  handleLeaveFamily,
  setActiveFamilyId,
  familyMessage,
  displayName,
}) {
  const [showFamilyCard, setShowFamilyCard] = useState(false)
  const activeMembers = activeFamily?.members || []

  const familyJoinUrl = activeFamily?.code
    ? `https://edm-passport-v2.vercel.app?joincrew=${encodeURIComponent(activeFamily.code)}`
    : ''

  const qrImageUrl = familyJoinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(familyJoinUrl)}`
    : ''

  return (
    <>
      {showFamilyCard && activeFamily && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            padding: '18px',
            background:
              'radial-gradient(circle at top, rgba(255,0,230,0.45), rgba(0,0,0,0.96) 45%, #000 100%)',
            color: 'white',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              minHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '24px',
                borderRadius: '28px',
                background: 'rgba(0,0,0,0.82)',
                border: '2px solid rgba(255,255,255,0.35)',
                boxShadow: '0 0 40px rgba(0,255,255,0.35)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                }}
              >
                EDM Passport Family
              </p>

              <h1
                style={{
                  margin: '12px 0 6px',
                  fontSize: '36px',
                  lineHeight: 1.05,
                }}
              >
                {activeFamily.name}
              </h1>

              <p style={{ margin: '0 0 18px', opacity: 0.85 }}>
                Scan or tap to join this rave family.
              </p>

              {qrImageUrl && (
                <div
                  style={{
                    margin: '0 auto 18px',
                    padding: '14px',
                    borderRadius: '22px',
                    background: 'white',
                    display: 'inline-block',
                  }}
                >
                  <img
                    src={qrImageUrl}
                    alt="Family join QR code"
                    style={{
                      width: '320px',
                      maxWidth: '78vw',
                      display: 'block',
                      borderRadius: '12px',
                    }}
                  />
                </div>
              )}

              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                }}
              >
                Family Code
              </p>

              <h2
                style={{
                  margin: '6px 0 16px',
                  fontSize: '46px',
                  letterSpacing: '5px',
                  wordBreak: 'break-word',
                }}
              >
                {activeFamily.code}
              </h2>

              <p style={{ margin: '0 0 18px', fontSize: '14px', opacity: 0.9 }}>
                After scanning, login if needed. The code will stay filled in,
                then tap JOIN FAMILY.
              </p>

              <button
                style={{
                  ...styles.mainButton,
                  width: '100%',
                  marginBottom: '10px',
                }}
                onClick={() => setShowFamilyCard(false)}
              >
                BACK TO FAMILY PAGE
              </button>

              <small style={{ wordBreak: 'break-word', opacity: 0.72 }}>
                NFC: {familyJoinUrl}
              </small>
            </div>
          </div>
        </div>
      )}

      <p style={styles.pageNumber}>Passport Page 6</p>
      <h2 style={styles.bookTitle}>My Family</h2>

      <div style={styles.crewHero}>
        <p style={styles.labelDark}>Rave Identity</p>
        <h1 style={styles.rankTitle}>{displayName || 'Rave Traveler'}</h1>
        <p>{families.length} families joined</p>
      </div>

      {activeFamily ? (
        <div style={styles.crewHero}>
          <p style={styles.labelDark}>Active Family</p>
          <h1 style={styles.rankTitle}>{activeFamily.name}</h1>

          <div
            style={{
              margin: '20px 0',
              padding: '20px',
              borderRadius: '18px',
              background: 'rgba(0,0,0,0.75)',
              border: '2px solid rgba(255,255,255,0.35)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', letterSpacing: '2px' }}>
              FAMILY CODE
            </p>

            <h1
              style={{
                margin: '10px 0',
                fontSize: '42px',
                letterSpacing: '4px',
                wordBreak: 'break-word',
              }}
            >
              {activeFamily.code}
            </h1>

            <p style={{ margin: 0 }}>
              Friends can type this code to join your family.
            </p>
          </div>

          <button
            style={styles.mainButton}
            onClick={() => setShowFamilyCard(true)}
          >
            SHOW FULL-SCREEN FAMILY QR CARD
          </button>

          {qrImageUrl && (
            <div
              style={{
                margin: '20px 0',
                padding: '20px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.95)',
                color: '#111',
                textAlign: 'center',
              }}
            >
              <h3 style={{ marginTop: 0 }}>Scan to Join</h3>

              <img
                src={qrImageUrl}
                alt="Family join QR code"
                style={{
                  width: '260px',
                  maxWidth: '100%',
                  borderRadius: '12px',
                }}
              />

              <p style={{ fontSize: '13px' }}>
                New users scan this QR code, login, then tap JOIN FAMILY.
              </p>
            </div>
          )}

          {familyJoinUrl && (
            <div style={styles.linkCard}>
              <strong>NFC Tap Link</strong>
              <small style={{ wordBreak: 'break-word' }}>{familyJoinUrl}</small>
              <small>
                Program this link onto an NFC tag. When someone taps it, the app
                opens with your family code ready.
              </small>
            </div>
          )}

          <p>Your Role: {activeFamily.role}</p>
          <p>{activeMembers.length} members</p>
        </div>
      ) : (
        <div style={styles.linkCard}>
          <strong>No active family yet.</strong>
          <small>Create a family or join one with a family code.</small>
        </div>
      )}

      <h3>My Families</h3>

      <div style={styles.linkList}>
        {families.length ? (
          families.map((family) => (
            <button
              key={family.id}
              style={
                family.id === activeFamily?.id
                  ? styles.familyActive
                  : styles.familyCard
              }
              onClick={() => setActiveFamilyId(family.id)}
            >
              <strong>{family.name}</strong>
              <small>Code: {family.code}</small>
              <small>Role: {family.role}</small>
              <small>{family.members?.length || 0} members</small>
            </button>
          ))
        ) : (
          <div style={styles.linkCard}>No families joined yet.</div>
        )}
      </div>

      {activeFamily && (
        <>
          <h3>Family Members</h3>

          <div style={styles.linkList}>
            {activeMembers.length ? (
              activeMembers.map((member) => (
                <div key={member.user_id} style={styles.linkCard}>
                  <strong>{member.rave_name || 'Rave Traveler'}</strong>
                  <small>{member.role || 'Member'}</small>
                  <small>
                    Joined:{' '}
                    {member.joined_at
                      ? new Date(member.joined_at).toLocaleDateString()
                      : 'Festival family'}
                  </small>
                </div>
              ))
            ) : (
              <div style={styles.linkCard}>No visible members yet.</div>
            )}
          </div>

          <button
            style={styles.dangerButton}
            onClick={() => handleLeaveFamily(activeFamily.id)}
          >
            LEAVE ACTIVE FAMILY
          </button>
        </>
      )}

      <h3>Create Family</h3>

      <input
        style={styles.inputLight}
        placeholder="New family name"
        value={familyInput}
        onChange={(event) => setFamilyInput(event.target.value)}
      />

      <button style={styles.mainButton} onClick={handleCreateFamily}>
        CREATE FAMILY
      </button>

      <h3>Join Family</h3>

      <input
        style={styles.inputLight}
        placeholder="Enter family code"
        value={joinCode}
        onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
      />

      <button style={styles.secondaryButton} onClick={() => handleJoinFamily()}>
        JOIN FAMILY
      </button>

      <h3>Official / Public Families</h3>

      <div style={styles.linkList}>
        {publicFamilies.length ? (
          publicFamilies.map((family) => (
            <div key={family.id} style={styles.linkCard}>
              <strong>{family.name}</strong>
              <small>{family.code}</small>
              <small>{family.member_count || 0} members</small>

              <button
                style={styles.secondaryButton}
                onClick={() => handleJoinFamily(family.code)}
              >
                JOIN THIS FAMILY
              </button>
            </div>
          ))
        ) : (
          <div style={styles.linkCard}>No public families found yet.</div>
        )}
      </div>

      {familyMessage && <p style={styles.successText}>{familyMessage}</p>}
    </>
  )
}
