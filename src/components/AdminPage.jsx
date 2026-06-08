import { useEffect, useRef, useState } from 'react'

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

let leafletLoadPromise = null

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L)

  if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = LEAFLET_CSS_URL
    document.head.appendChild(link)
  }

  if (!leafletLoadPromise) {
    leafletLoadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${LEAFLET_JS_URL}"]`)

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.L))
        existingScript.addEventListener('error', reject)
        return
      }

      const script = document.createElement('script')
      script.src = LEAFLET_JS_URL
      script.async = true
      script.onload = () => resolve(window.L)
      script.onerror = reject
      document.body.appendChild(script)
    })
  }

  return leafletLoadPromise
}

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
  gpsDrops = [],
  refreshGpsDrops,
  managedFestivals = [],
  adminFestivalId,
  setAdminFestivalId,
  adminFestival,
  festivalName,
  setFestivalName,
  festivalLocation,
  setFestivalLocation,
  festivalStatus,
  setFestivalStatus,
  festivalStartDate,
  setFestivalStartDate,
  festivalEndDate,
  setFestivalEndDate,
  festivalBannerUrl,
  setFestivalBannerUrl,
  festivalMapUrl,
  setFestivalMapUrl,
  handleCreateFestival,
  festivalAdminMessage,
  adminCreatedStamps = [],
  adminStampNameInput,
  setAdminStampNameInput,
  adminStampImageUrlInput,
  setAdminStampImageUrlInput,
  adminStampRarityInput,
  setAdminStampRarityInput,
  adminStampLocationInput,
  setAdminStampLocationInput,
  adminStampXpInput,
  setAdminStampXpInput,
  adminStampCreatorMessage,
  handleCreateAdminStamp,
}) {
  const mapRef = useRef(null)
  const leafletMapRef = useRef(null)
  const tileLayerRef = useRef(null)
  const dropLayerRef = useRef(null)
  const selectedLayerRef = useRef(null)
  const [mapMode, setMapMode] = useState('satellite')
  const [mapExpanded, setMapExpanded] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState('')

  function getStampName(stampId) {
    return stamps.find((stamp) => stamp.id === stampId)?.name || stampId
  }

  function getTileConfig(mode = mapMode) {
    if (mode === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
      }
    }

    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
    }
  }

  function loadDropIntoForm(drop) {
    setAdminStampId(drop.stamp_id)
    setGpsTitle(drop.title || getStampName(drop.stamp_id))
    setGpsLatitude(String(drop.latitude))
    setGpsLongitude(String(drop.longitude))
    setGpsRadiusFeet(String(drop.radius_feet || 300))

    const map = leafletMapRef.current

    if (map && window.L) {
      map.setView([Number(drop.latitude), Number(drop.longitude)], Math.max(map.getZoom(), 16))
    }
  }

  function setSelectedPin(latitude, longitude) {
    const L = window.L
    const map = leafletMapRef.current

    if (!L || !map) return

    if (selectedLayerRef.current) {
      map.removeLayer(selectedLayerRef.current)
    }

    selectedLayerRef.current = L.marker([Number(latitude), Number(longitude)], {
      icon: L.divIcon({
        className: '',
        html: '<div style="font-size:34px; filter: drop-shadow(0 0 10px rgba(0,255,255,.95));">✨</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      }),
    }).addTo(map)
  }

  useEffect(() => {
    let cancelled = false

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current || leafletMapRef.current) return

        const map = L.map(mapRef.current, {
          center: [36.1699, -115.1398],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          tap: true,
        })

        const tileConfig = getTileConfig(mapMode)
        tileLayerRef.current = L.tileLayer(tileConfig.url, {
          attribution: tileConfig.attribution,
          maxZoom: 20,
        }).addTo(map)

        dropLayerRef.current = L.layerGroup().addTo(map)

        map.on('click', (event) => {
          const latitude = event.latlng.lat.toFixed(6)
          const longitude = event.latlng.lng.toFixed(6)

          setGpsLatitude(latitude)
          setGpsLongitude(longitude)

          if (!gpsTitle) {
            setGpsTitle(`${getStampName(adminStampId)} Map Drop`)
          }

          setSelectedPin(latitude, longitude)
        })

        leafletMapRef.current = map
        setMapReady(true)

        setTimeout(() => {
          map.invalidateSize()
        }, 250)
      })
      .catch(() => {
        if (!cancelled) setMapError('Map failed to load. Check internet connection and try again.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const L = window.L
    const map = leafletMapRef.current

    if (!L || !map || !dropLayerRef.current) return

    dropLayerRef.current.clearLayers()

    gpsDrops.forEach((drop) => {
      const latitude = Number(drop.latitude)
      const longitude = Number(drop.longitude)
      const radiusFeet = Number(drop.radius_feet || 300)

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

      const marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: '',
          html: '<div style="font-size:30px; filter: drop-shadow(0 0 10px rgba(255,0,200,.95));">📍</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      })

      marker.bindPopup(`
        <strong>${drop.title || getStampName(drop.stamp_id)}</strong><br/>
        ${getStampName(drop.stamp_id)}<br/>
        Radius: ${radiusFeet} feet
      `)

      marker.on('click', () => loadDropIntoForm(drop))

      const circle = L.circle([latitude, longitude], {
        radius: radiusFeet * 0.3048,
        color: '#22d3ee',
        weight: 2,
        fillColor: '#ff4fd8',
        fillOpacity: 0.16,
      })

      dropLayerRef.current.addLayer(circle)
      dropLayerRef.current.addLayer(marker)
    })
  }, [gpsDrops, stamps])

  useEffect(() => {
    const L = window.L
    const map = leafletMapRef.current

    if (!L || !map) return

    const tileConfig = getTileConfig(mapMode)

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 20,
    }).addTo(map)

    setTimeout(() => {
      map.invalidateSize()
    }, 150)
  }, [mapMode])

  useEffect(() => {
    const map = leafletMapRef.current

    if (!map) return

    setTimeout(() => {
      map.invalidateSize()
    }, 250)
  }, [mapExpanded])

  useEffect(() => {
    if (gpsLatitude && gpsLongitude) {
      setSelectedPin(gpsLatitude, gpsLongitude)
    }
  }, [gpsLatitude, gpsLongitude])

  const selectedClaimStamp = stamps.find((stamp) => stamp.id === adminStampId) || stamps[0]
  const stampClaimUrl = selectedClaimStamp
    ? `${window.location.origin}?claim=${encodeURIComponent(selectedClaimStamp.id)}`
    : ''
  const stampClaimQrUrl = stampClaimUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(stampClaimUrl)}`
    : ''

  async function copyAdminClaimUrl() {
    if (!stampClaimUrl) return

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(stampClaimUrl)
        alert('Stamp claim link copied.')
        return
      }
    } catch (error) {
      console.warn('Clipboard copy failed', error)
    }

    window.prompt('Copy this stamp claim link:', stampClaimUrl)
  }

  const mapShellStyle = mapExpanded
    ? {
        position: 'fixed',
        inset: 12,
        zIndex: 9999,
        background: '#050510',
        borderRadius: 22,
        padding: 12,
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: 10,
      }
    : {
        marginTop: 12,
      }

  const mapStyle = {
    height: mapExpanded ? '100%' : 460,
    minHeight: mapExpanded ? 500 : 460,
    borderRadius: 20,
    overflow: 'hidden',
    border: '2px solid rgba(0,255,255,.45)',
    boxShadow: '0 0 25px rgba(0,255,255,.18)',
    background: '#111827',
  }

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

      <h2 style={styles.bookTitle}>Admin Stamp QR / NFC Claim Generator</h2>

      <div style={styles.adminCard}>
        <strong>Generate claim links for existing stamps</strong>
        <small>Pick a stamp above. Use this QR code or NFC URL to let users unlock that stamp.</small>
        <small>This does not create new stamp art. It uses the existing stamp image already in the app.</small>
      </div>

      {selectedClaimStamp && (
        <div
          style={{
            ...styles.adminCard,
            alignItems: 'center',
            textAlign: 'center',
            gap: 12,
          }}
        >
          <strong>{selectedClaimStamp.name}</strong>

          {selectedClaimStamp.image && (
            <img
              src={selectedClaimStamp.image}
              alt={selectedClaimStamp.name}
              style={{
                width: 130,
                height: 130,
                objectFit: 'cover',
                borderRadius: 999,
                border: '3px solid rgba(255,255,255,.55)',
              }}
            />
          )}

          {stampClaimQrUrl && (
            <div
              style={{
                background: 'white',
                color: '#111',
                padding: 16,
                borderRadius: 18,
                display: 'grid',
                gap: 8,
                justifyItems: 'center',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <strong>QR CLAIM CODE</strong>
              <img
                src={stampClaimQrUrl}
                alt={`${selectedClaimStamp.name} claim QR`}
                style={{ width: 240, maxWidth: '100%', borderRadius: 12 }}
              />
              <small>Scan this to unlock the selected stamp.</small>
            </div>
          )}

          <div style={styles.linkCard}>
            <strong>QR / NFC Claim URL</strong>
            <small style={{ wordBreak: 'break-word' }}>{stampClaimUrl}</small>
            <small>Program this same URL onto an NFC tag.</small>
          </div>

          <button type="button" style={styles.secondaryButton} onClick={copyAdminClaimUrl}>
            COPY CLAIM LINK
          </button>
        </div>
      )}

      <h2 style={styles.bookTitle}>Festival Manager</h2>

      <div style={styles.adminCard}>
        <strong>Create / Manage Festivals</strong>
        <small>Create each festival first. Then select it below before dropping pins. GPS drops are saved only to the selected festival.</small>
      </div>

      <input style={styles.inputLight} placeholder="Festival name" value={festivalName || ''} onChange={(event) => setFestivalName?.(event.target.value)} />
      <input style={styles.inputLight} placeholder="Festival location" value={festivalLocation || ''} onChange={(event) => setFestivalLocation?.(event.target.value)} />

      <select style={styles.inputLight} value={festivalStatus || 'upcoming'} onChange={(event) => setFestivalStatus?.(event.target.value)}>
        <option value="upcoming">Upcoming</option>
        <option value="attended">Attended</option>
      </select>

      <label style={styles.labelDark}>Start Date</label>
      <input style={styles.inputLight} type="date" value={festivalStartDate || ''} onChange={(event) => setFestivalStartDate?.(event.target.value)} />

      <label style={styles.labelDark}>End Date</label>
      <input style={styles.inputLight} type="date" value={festivalEndDate || ''} onChange={(event) => setFestivalEndDate?.(event.target.value)} />

      <input style={styles.inputLight} placeholder="Festival banner image URL" value={festivalBannerUrl || ''} onChange={(event) => setFestivalBannerUrl?.(event.target.value)} />
      <input style={styles.inputLight} placeholder="Festival map image URL / official map URL" value={festivalMapUrl || ''} onChange={(event) => setFestivalMapUrl?.(event.target.value)} />

      <button style={styles.mainButton} onClick={handleCreateFestival}>
        CREATE FESTIVAL
      </button>

      {festivalAdminMessage && <p style={styles.successText}>{festivalAdminMessage}</p>}

      <h2 style={styles.bookTitle}>Festival-Specific GPS Map</h2>

      <label style={styles.labelDark}>Selected Festival For Drops</label>
      <select
        style={styles.inputLight}
        value={adminFestivalId || ''}
        onChange={(event) => setAdminFestivalId?.(event.target.value)}
      >
        {managedFestivals.map((festival) => (
          <option key={festival.id} value={festival.id}>
            {festival.name}
          </option>
        ))}
      </select>

      <div style={styles.adminCard}>
        <strong>{adminFestival?.name || 'Select a festival'}</strong>
        <small>{adminFestival?.location || 'GPS drops created below will belong only to this festival.'}</small>
        {adminFestival?.map_url && <small>Map: {adminFestival.map_url}</small>}
        {adminFestival?.mapUrl && <small>Map: {adminFestival.mapUrl}</small>}
      </div>

      <h2 style={styles.bookTitle}>GPS Pin Drop Creator</h2>

      <div style={styles.adminMapHeader}>
        <strong>Live Admin GPS Map</strong>
        <small>Use satellite mode to zoom into the selected festival. Tap the map to fill latitude and longitude for this festival only.</small>
      </div>

      <div style={mapShellStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={mapMode === 'street' ? styles.mainButton : styles.secondaryButton} onClick={() => setMapMode('street')}>
              STREET
            </button>
            <button type="button" style={mapMode === 'satellite' ? styles.mainButton : styles.secondaryButton} onClick={() => setMapMode('satellite')}>
              SATELLITE
            </button>
          </div>

          <button type="button" style={styles.secondaryButton} onClick={() => setMapExpanded((value) => !value)}>
            {mapExpanded ? 'CLOSE FULL MAP' : 'FULL MAP'}
          </button>
        </div>

        <div ref={mapRef} style={mapStyle} />

        {!mapReady && !mapError && (
          <p style={styles.successText}>Loading map...</p>
        )}

        {mapError && (
          <p style={styles.errorText}>{mapError}</p>
        )}
      </div>

      <button style={styles.secondaryButton} onClick={refreshGpsDrops}>
        REFRESH LIVE GPS MAP
      </button>

      <input style={styles.inputLight} placeholder="GPS drop title" value={gpsTitle} onChange={(event) => setGpsTitle(event.target.value)} />
      <input style={styles.inputLight} placeholder="Latitude" value={gpsLatitude} onChange={(event) => setGpsLatitude(event.target.value)} />
      <input style={styles.inputLight} placeholder="Longitude" value={gpsLongitude} onChange={(event) => setGpsLongitude(event.target.value)} />
      <input style={styles.inputLight} type="number" placeholder="Radius in feet, example 300" value={gpsRadiusFeet} onChange={(event) => setGpsRadiusFeet(event.target.value)} />

      <button style={styles.mainButton} onClick={handleCreateGpsDrop}>
        CREATE GPS DROP FOR SELECTED STAMP
      </button>

      {gpsAdminMessage && <p style={styles.successText}>{gpsAdminMessage}</p>}

      <h3>Current GPS Drops For Selected Festival</h3>

      <div style={styles.linkList}>
        {gpsDrops.length ? (
          gpsDrops.map((drop) => (
            <button key={drop.id} type="button" style={styles.adminCard} onClick={() => loadDropIntoForm(drop)}>
              <strong>{drop.title || getStampName(drop.stamp_id)}</strong>
              <small>{getStampName(drop.stamp_id)}</small>
              <small>Lat: {Number(drop.latitude).toFixed(6)}</small>
              <small>Lng: {Number(drop.longitude).toFixed(6)}</small>
              <small>Radius: {drop.radius_feet || 300} feet</small>
            </button>
          ))
        ) : (
          <div style={styles.linkCard}>No active GPS drops yet.</div>
        )}
      </div>
      <h3>Admin Stamp Creator</h3>

      <div style={styles.adminCard}>
        <strong>Create New Stamp from Image URL</strong>
        <small>
          Build 13A creates new admin stamps using an existing image URL. Build 13B will add direct image upload.
        </small>

        <input
          style={styles.inputLight}
          placeholder="Stamp name"
          value={adminStampNameInput}
          onChange={(event) => setAdminStampNameInput(event.target.value)}
        />

        <input
          style={styles.inputLight}
          placeholder="Stamp image URL"
          value={adminStampImageUrlInput}
          onChange={(event) => setAdminStampImageUrlInput(event.target.value)}
        />

        <input
          style={styles.inputLight}
          placeholder="Location / event name"
          value={adminStampLocationInput}
          onChange={(event) => setAdminStampLocationInput(event.target.value)}
        />

        <input
          style={styles.inputLight}
          placeholder="XP value"
          value={adminStampXpInput}
          onChange={(event) => setAdminStampXpInput(event.target.value)}
        />

        <select
          style={styles.inputLight}
          value={adminStampRarityInput}
          onChange={(event) => setAdminStampRarityInput(event.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="secret">Secret</option>
          <option value="legendary">Legendary</option>
        </select>

        <button style={styles.mainButton} onClick={handleCreateAdminStamp}>
          CREATE ADMIN STAMP
        </button>

        {adminStampCreatorMessage && <p style={styles.successText}>{adminStampCreatorMessage}</p>}
      </div>

      <h3>Admin-Created Stamps</h3>

      <div style={styles.linkList}>
        {adminCreatedStamps.length ? (
          adminCreatedStamps.map((stamp) => (
            <div key={`admin-created-${stamp.id}`} style={styles.adminCard}>
              <strong>{stamp.name}</strong>
              <small>{stamp.rarity || 'normal'} • {stamp.location}</small>
              <img
                src={stamp.image}
                alt={stamp.name}
                style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 18 }}
              />
              <input
                style={styles.inputLight}
                readOnly
                value={getClaimUrl(stamp.id)}
                onClick={(event) => event.target.select()}
              />
            </div>
          ))
        ) : (
          <div style={styles.linkCard}>No admin-created stamps yet.</div>
        )}
      </div>

<<div style={styles.linkList}>
  {stamps.map((stamp) => {
    const claimUrl = getClaimUrl(stamp.id)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(claimUrl)}`

    return (
      <div key={`generator-${stamp.id}`} style={styles.adminCard}>
        <strong>{stamp.name}</strong>

        <img
          src={qrUrl}
          alt={`${stamp.name} claim QR code`}
          style={{
            width: '220px',
            maxWidth: '100%',
            borderRadius: '14px',
            background: 'white',
            padding: '10px',
            margin: '12px 0',
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
          COPY CLAIM URL
        </button>
      </div>
    )
  })}
</div>