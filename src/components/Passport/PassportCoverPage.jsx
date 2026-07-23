export default function PassportCoverPage({ displayName, country, festivalName, year, passportImage }) {
  return (
    <section style={styles.page}>
      <span style={styles.eyebrow}>PASSPORT COVER</span>
      {passportImage && <img src={passportImage} alt={`${country} passport cover`} style={styles.cover} />}
      <h2 style={styles.name}>{displayName}</h2>
      <p style={styles.country}>{country || 'Festival explorer'}</p>
      <div style={styles.edition}>
        <strong>{festivalName || 'Festival Passport'}</strong>
        {year && <span>{year}</span>}
      </div>
    </section>
  )
}

const styles = {
  page: { display: 'grid', justifyItems: 'center', gap: 10, textAlign: 'center' },
  eyebrow: { color: '#f1bd63', fontSize: 10, fontWeight: 900, letterSpacing: '.2em' },
  cover: { width: 'min(230px,70vw)', borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,.38)' },
  name: { margin: '8px 0 0', fontSize: 30 },
  country: { margin: 0, color: 'rgba(255,255,255,.64)' },
  edition: { display: 'flex', gap: 9, color: '#f1bd63', fontSize: 12, letterSpacing: '.08em' },
}
