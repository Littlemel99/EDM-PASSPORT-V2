export default function AdminPage({
  styles,
  stamps,
  adminTestMode,
  setAdminTestMode,
  adminStampId,
  setAdminStampId,
  dropStart,
  setDropStart,
  dropEnd,
  setDropEnd,
  dropSecret,
  setDropSecret,
  dropLegendary,
  setDropLegendary,
  dropMaxClaims,
  setDropMaxClaims,
  handleAdvancedDropSave,
  toggleLiveDrop,
  adminMessage,
  activeDrops,
  activeDropWindows,
  getClaimUrl,
  gpsLatitude,
  setGpsLatitude,
  gpsLongitude,
  setGpsLongitude,
  gpsRadiusFeet,
  setGpsRadiusFeet,
  gpsTitle,
  setGpsTitle,
  handleCreateGpsDrop,
  gpsAdminMessage,
}) {
  return (
    <>
      <p style={styles.pageNumber}>Admin Page</p>
      <h2 style={styles.bookTitle}>Event Window Controls</h2>

      <button style={adminTestMode ? styles.dangerButton : styles.mainButton} onClick={() => setAdminTestMode((value) => !value)}>
        {adminTestMode ? 'TURN TEST MODE OFF' : 'TURN TEST MODE ON'}
      </button>

      <label style={styles.labelDark}>Stamp</label>
      <select style={styles.inputLight} value={adminStampId} onChange={(event) => setAdminStampId(event.target.value)}>
        {stamps.map((stamp) => (
          <option key={stamp.id} value={stamp.id}>{stamp.name}</option>
        ))}
      </select>

      <label style={styles.labelDark}>Start Time</label>
      <input style={styles.inputLight} type="datetime-local" value={dropStart} onChange={(event) => setDropStart(event.target.value)} />

      <label style={styles.labelDark}>End Time</label>
      <input style={styles.inputLight} type="datetime-local" value={dropEnd} onChange={(event) => setDropEnd(event.target.value)} />

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={dropSecret} onChange={(event) => setDropSecret(event.target.checked)} />
        Secret Drop
      </label>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={dropLegendary} onChange={(event) => setDropLegendary(event.target.checked)} />
        Legendary Drop
      </label>

      <input style={styles.inputLight} type="number" placeholder="Max claims, optional" value={dropMaxClaims} onChange={(event) => setDropMaxClaims(event.target.value)} />

      <button style={styles.mainButton} onClick={handleAdvancedDropSave}>
        SAVE + ACTIVATE EVENT WINDOW
      </button>

      <button style={styles.dangerButton} onClick={() => toggleLiveDrop(adminStampId, false)}>
        TURN SELECTED DROP OFF
      </button>

      {adminMessage && <p style={styles.successText}>{adminMessage}</p>}

      <h2 style={styles.bookTitle}>GPS Pin Drop Creator</h2>

      <input style={styles.inputLight} placeholder="GPS drop title" value={gpsTitle} onChange={(event) => setGpsTitle(event.target.value)} />
      <input style={styles.inputLight} placeholder="Latitude" value={gpsLatitude} onChange={(event) => setGpsLatitude(event.target.value)} />
      <input style={styles.inputLight} placeholder="Longitude" value={gpsLongitude} onChange={(event) => setGpsLongitude(event.target.value)} />
      <input style={styles.inputLight} type="number" placeholder="Radius in feet, example 300" value={gpsRadiusFeet} onChange={(event) => setGpsRadiusFeet(event.target.value)} />

      <button style={styles.mainButton} onClick={handleCreateGpsDrop}>
        CREATE GPS DROP FOR SELECTED STAMP
      </button>

      {gpsAdminMessage && <p style={styles.successText}>{gpsAdminMessage}</p>}

      <h3>Current Live Drops</h3>

      <div style={styles.linkList}>
        {stamps.map((stamp) => {
          const live = activeDrops.includes(stamp.id)
          const window = activeDropWindows[stamp.id]

          return (
            <div key={stamp.id} style={styles.adminCard}>
              <strong>{stamp.name}</strong>
              <small>{live ? 'LIVE' : 'OFF'}</small>
              <small>{getClaimUrl(stamp.id, window?.token)}</small>
              {window?.startsAt && <small>Start: {new Date(window.startsAt).toLocaleString()}</small>}
              {window?.endsAt && <small>End: {new Date(window.endsAt).toLocaleString()}</small>}
              {window?.isSecret && <small>SECRET</small>}
              {window?.isLegendary && <small>LEGENDARY</small>}
              {window?.maxClaims && <small>Limit: {window.claimCount || 0}/{window.maxClaims}</small>}
            </div>
          )
        })}
      </div>
    </>
  )
}
