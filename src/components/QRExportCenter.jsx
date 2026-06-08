export default function QRExportCenter({ styles, stamps, getClaimUrl }) {
  function getQrImageUrl(claimUrl) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(claimUrl)}`
  }

  function printQrCenter() {
    window.print()
  }

  return (
    <>
      <p style={styles.pageNumber}>Admin Page</p>
      <h2 style={styles.bookTitle}>QR Export Center</h2>
      <p style={styles.bookText}>
        Print or screen-share these QR codes for real stamp claiming. The same claim URL can be written to an NFC tag.
      </p>

      <div style={styles.linkCard}>
        <strong>How to use this page</strong>
        <small>1. Pick a stamp card below.</small>
        <small>2. Print the QR or show it on your phone.</small>
        <small>3. Program the same URL into an NFC tag for tap-to-claim.</small>
      </div>

      <button style={styles.mainButton} onClick={printQrCenter}>
        PRINT QR CENTER
      </button>

      <div style={styles.exportGrid || styles.linkList}>
        {stamps.map((stamp) => {
          const claimUrl = getClaimUrl(stamp.id)
          const qrImageUrl = getQrImageUrl(claimUrl)

          return (
            <div key={stamp.id} style={styles.exportCard || styles.adminCard}>
              <p style={styles.labelDark}>Stamp Claim QR</p>
              <h3>{stamp.name}</h3>
              <small>{stamp.location || 'EDM Passport Drop'}</small>
              <small>{stamp.rarity || 'normal'} • {stamp.xp || 100} XP</small>

              <img
                src={qrImageUrl}
                alt={`${stamp.name} QR claim code`}
                style={{
                  width: '260px',
                  maxWidth: '100%',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '12px',
                  margin: '14px auto',
                  display: 'block',
                }}
              />

              <input
                style={styles.inputLight}
                readOnly
                value={claimUrl}
                onClick={(event) => event.target.select()}
              />

              <button
                style={styles.secondaryButton}
                onClick={() => {
                  navigator.clipboard.writeText(claimUrl)
                  alert('Claim URL copied')
                }}
              >
                COPY NFC / QR CLAIM URL
              </button>
            </div>
          )
        })}
      </div>

      <p style={styles.successText}>
        QR Export Center ready. These QR codes unlock hidden stamps through the claim flow.
      </p>
    </>
  )
}
