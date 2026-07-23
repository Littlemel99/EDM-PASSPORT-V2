export default function ExportCenter({
  styles,
  country,
  displayName,
  stats,
  activeFestival,
  getPassportImage,
  getQrImageUrl,
  downloadPassportExport,
  printPassportExport,
}) {
  return (
    <>
      <p style={styles.pageNumber}>EXPORT</p>
      <h2 style={styles.bookTitle}>Passport Export Center</h2>
      <p style={styles.bookText}>
        Download, print, or save your EDM Passport identity. These exports use your rave name and country passport cover.
      </p>

      <div style={styles.exportGrid}>
        <div style={styles.exportCard}>
          <p style={styles.labelDark}>Wallet Card</p>
          <div style={styles.exportMiniPassport}>
            {country && (
              <img
                src={getPassportImage(country)}
                alt={country}
                style={styles.exportCover}
              />
            )}
            <strong>{displayName}</strong>
            <small>{country || 'Passport Country'}</small>
            <small>{stats.level} • {stats.totalXp} XP</small>
            <img
              src={getQrImageUrl()}
              alt="Passport QR Code"
              style={styles.qrImage}
            />
          </div>

          <small>3.375 in × 2.125 in</small>

          <button
            style={styles.mainButton}
            onClick={() => downloadPassportExport('wallet')}
          >
            DOWNLOAD WALLET PNG
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => printPassportExport('wallet')}
          >
            PRINT WALLET CARD
          </button>
        </div>

        <div style={styles.exportCard}>
          <p style={styles.labelDark}>Festival Badge</p>

          <div style={styles.exportBadgePreview}>
            <strong>{displayName}</strong>
            <small>{activeFestival?.name || 'Select Festival'}</small>
            <img
              src={getQrImageUrl()}
              alt="Passport QR Code"
              style={styles.qrImage}
            />
            <small>{country || 'Passport Country'}</small>
          </div>

          <small>4 in × 6 in</small>

          <button
            style={styles.mainButton}
            onClick={() => downloadPassportExport('badge')}
          >
            DOWNLOAD BADGE PNG
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => printPassportExport('badge')}
          >
            PRINT FESTIVAL BADGE
          </button>
        </div>

        <div style={styles.exportCard}>
          <p style={styles.labelDark}>Lanyard Insert</p>

          <div style={styles.exportBadgePreview}>
            {country && (
              <img
                src={getPassportImage(country)}
                alt={country}
                style={styles.exportCoverSmall}
              />
            )}
            <strong>{displayName}</strong>
            <small>{stats.level}</small>
            <img
              src={getQrImageUrl()}
              alt="Passport QR Code"
              style={styles.qrImage}
            />
          </div>

          <small>3 in × 4 in</small>

          <button
            style={styles.mainButton}
            onClick={() => downloadPassportExport('lanyard')}
          >
            DOWNLOAD LANYARD PNG
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => printPassportExport('lanyard')}
          >
            PRINT LANYARD INSERT
          </button>
        </div>

        <div style={styles.exportCard}>
          <p style={styles.labelDark}>Phone Lock Screen</p>

          <div style={styles.lockScreenPreview}>
            {country && (
              <img
                src={getPassportImage(country)}
                alt={country}
                style={styles.exportCoverSmall}
              />
            )}
            <strong>{displayName}</strong>
            <small>{activeFestival?.name || 'EDM Passport'}</small>
            <img
              src={getQrImageUrl()}
              alt="Passport QR Code"
              style={styles.qrImage}
            />
          </div>

          <small>1170 × 2532 px phone wallpaper</small>

          <button
            style={styles.mainButton}
            onClick={() => downloadPassportExport('lockscreen')}
          >
            DOWNLOAD LOCK SCREEN PNG
          </button>
        </div>
      </div>

      <p style={styles.successText}>
        Export Center ready. Use PNG for downloads, lock screens, and printing.
      </p>
    </>
  )
}
