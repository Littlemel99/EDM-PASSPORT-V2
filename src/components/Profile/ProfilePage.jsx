export default function ProfilePage({
  styles,
  displayName,
  country,
  collectedStamps,
}) {
  return (
    <>
      <p style={styles.pageNumber}>Passport Page 12</p>
      <h2 style={styles.bookTitle}>My Passport Profile</h2>
      <p style={styles.bookText}>
        Your basic EDM Passport profile foundation.
      </p>

      <div style={styles.profileFoundationCard}>
        <p style={styles.tag}>PASSPORT PROFILE</p>
        <h2>{displayName}</h2>
        <small>{country || 'Global Passport'}</small>

        <div style={styles.profileFoundationGrid}>
          <div>
            <strong>{collectedStamps.length}</strong>
            <small>Stamps</small>
          </div>
        </div>
      </div>
    </>
  )
}
