import { useState } from 'react'

async function copyTextToClipboard(text) {
  if (!text) return false

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (error) {
    console.warn('Clipboard API failed, trying fallback copy.', error)
  }

  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.top = '-9999px'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, text.length)

    const copied = document.execCommand('copy')
    document.body.removeChild(textArea)
    return copied
  } catch (error) {
    console.error('Fallback copy failed:', error)
    return false
  }
}

export default function FamilyPage({
  styles,
  activeFamily,
  activeFamilyUrl,
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
  const [copyMessage, setCopyMessage] = useState('')
  const activeMembers = activeFamily?.members || []
  const totalFamilyMembers = families.reduce(
    (total, family) => total + (family.members?.length || 0),
    0
  )

  async function handleCopy(label, value) {
    const copied = await copyTextToClipboard(value)

    if (copied) {
      setCopyMessage(`${label} copied.`)
      return
    }

    setCopyMessage(`Could not copy automatically. Tap and hold this ${label.toLowerCase()} to copy it manually.`)
  }

  return (
    <>
      <p style={styles.pageNumber}>Passport Page 6</p>
      <h2 style={styles.bookTitle}>My Family</h2>

      <div style={styles.crewHero}>
        <p style={styles.labelDark}>Rave Identity</p>
        <h1 style={styles.rankTitle}>{displayName || 'Rave Traveler'}</h1>
        <p>{families.length} families joined</p>
        <p>{totalFamilyMembers} total family members visible</p>
      </div>

      {activeFamily ? (
        <div style={styles.crewHero}>
          <p style={styles.labelDark}>Active Family</p>
          <h1 style={styles.rankTitle}>{activeFamily.name}</h1>
          <p>Invite Code: {activeFamily.code}</p>
          <p>Your Role: {activeFamily.role}</p>
          <p>{activeMembers.length} members</p>
        </div>
      ) : (
        <div style={styles.linkCard}>
          <strong>No active family yet.</strong>
          <small>Create a family or join one with an invite code.</small>
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
                  <small>Joined: {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Festival family'}</small>
                </div>
              ))
            ) : (
              <div style={styles.linkCard}>No visible members yet.</div>
            )}
          </div>

          <h3>Invite Family</h3>

          <div style={styles.linkCard}>
            <strong>Family Invite Code</strong>
            <small>{activeFamily.code}</small>
          </div>

          <div style={styles.linkCard}>
            <strong>Family Invite Link</strong>
            <small>{activeFamilyUrl}</small>
          </div>

          <button
            style={styles.mainButton}
            onClick={() => handleCopy('Family code', activeFamily.code)}
          >
            COPY FAMILY CODE
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => handleCopy('Family invite link', activeFamilyUrl)}
          >
            COPY QR / NFC FAMILY LINK
          </button>

          {copyMessage && <p style={styles.successText}>{copyMessage}</p>}

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
