import { useEffect, useRef, useState } from 'react'
import Stamp from './Stamp'

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
  festivalDemandSummary = [],
  refreshFestivalDemandSummary,
  adminCreatedStamps = [],
  adminStampNameInput,
  setAdminStampNameInput,
  adminStampImageUrlInput,
  setAdminStampImageUrlInput,
  adminStampImageFile,
  setAdminStampImageFile,
  adminStampUploadPreview,
  setAdminStampUploadPreview,
  adminStampRarityInput,
  setAdminStampRarityInput,
  adminStampLocationInput,
  setAdminStampLocationInput,
  adminStampXpInput,
  setAdminStampXpInput,
  adminStampCreatorMessage,
  adminStampUploading,
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
  const [selectedMapPin, setSelectedMapPin] = useState(null)
  const [festivalMapNote, setFestivalMapNote] = useState('')
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardSelectedStampIds, setWizardSelectedStampIds] = useState([])
  const [wizardMessage, setWizardMessage] = useState('')
  const [distributionMode, setDistributionMode] = useState('gps')
  const [currentLocationMessage, setCurrentLocationMessage] = useState('')

  const wizardSelectedStamps = stamps.filter((stamp) => wizardSelectedStampIds.includes(stamp.id))
  const wizardPinCount = gpsDrops.filter((drop) => !adminFestivalId || drop.festival_id === adminFestivalId).length

  function toggleWizardStamp(stampId) {
    setWizardSelectedStampIds((current) =>
      current.includes(stampId)
        ? current.filter((id) => id !== stampId)
        : [...current, stampId]
    )
  }

  function goToWizardStep(nextStep) {
    setWizardMessage('')
    setWizardStep(Math.min(5, Math.max(1, nextStep)))
  }

  function forceMobileViewportReflow() {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const body = document.body

    root.style.overflowX = 'hidden'
    body.style.overflowX = 'hidden'
    body.style.width = '100%'
    body.style.maxWidth = '100vw'

    window.requestAnimationFrame(() => {
      window.scrollTo(window.scrollX, window.scrollY)

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))

        const map = leafletMapRef.current
        if (map?.invalidateSize) {
          map.invalidateSize()
        }
      }, 75)
    })
  }

  async function handleCreateAdminStampWithReflow() {
    await handleCreateAdminStamp?.()
    forceMobileViewportReflow()
  }

  async function publishWizardFestival() {
    await handleCreateFestival?.()
    setWizardMessage('Festival setup saved. Next: use the Festival Map Overlay Pin Board below to place live drops and QR/NFC claim points.')
    forceMobileViewportReflow()
  }

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
    setFestivalMapNote(drop.map_note || '')

    if (drop.map_x_percent !== null && drop.map_x_percent !== undefined && drop.map_y_percent !== null && drop.map_y_percent !== undefined) {
      setSelectedMapPin({ xPercent: Number(drop.map_x_percent), yPercent: Number(drop.map_y_percent) })
    }

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

    return (
    /* Build 25G Mobile Viewport Reflow Fix */
    /* Build 25E Admin Layout Hard Fix */) => {
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

  const activeFestivalMapUrl = adminFestival?.map_url || adminFestival?.mapUrl || festivalMapUrl || ''
  const selectedMapDropStamp = stamps.find((stamp) => stamp.id === adminStampId) || stamps[0]
  const phoneLockCardStyle = {
    ...styles.adminCard,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    boxSizing: 'border-box',
  }

  const phoneLockListStyle = {
    ...styles.linkList,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
  }

  const phoneLockGridStyle = {
    ...styles.stampGrid,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    boxSizing: 'border-box',
  }

  const phoneLockInputStyle = {
    ...styles.inputLight,
    fontSize: '16px',
    WebkitTextSizeAdjust: '100%',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  }

  const adminHardFixCardStyle = {
    ...styles.adminCard,
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    overflowWrap: 'anywhere',
  }

  const adminHardFixListStyle = {
    ...styles.linkList,
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
  }

  const adminHardFixGridStyle = {
    ...styles.stampGrid,
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
  }

  const compactStatusCardStyle = {
    padding: 12,
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(34,211,238,.16), rgba(255,45,214,.10))',
    border: '1px solid rgba(34,211,238,.35)',
    color: '#f8fbff',
    maxWidth: '100%',
    overflow: 'hidden',
    overflowWrap: 'anywhere',
    boxSizing: 'border-box',
  }


  function handleFestivalMapClick(event) {
    const image = event.currentTarget
    const rect = image.getBoundingClientRect()
    const xPercent = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
    const yPercent = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))

    setSelectedMapPin({ xPercent, yPercent })

    if (!gpsTitle) {
      setGpsTitle(`${getStampName(adminStampId)} Festival Map Drop`)
    }
  }

  async function createGpsDropWithMapOverlay() {
    await handleCreateGpsDrop({
      mapImageUrl: activeFestivalMapUrl,
      mapXPercent: selectedMapPin?.xPercent,
      mapYPercent: selectedMapPin?.yPercent,
      mapNote: festivalMapNote,
    })
  }

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

  function useCurrentLocationForGpsDrop() {
    setCurrentLocationMessage('Requesting current location...')

    if (!navigator.geolocation) {
      setCurrentLocationMessage('This device does not support GPS location.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6)
        const longitude = position.coords.longitude.toFixed(6)
        const accuracyFeet = Math.round((position.coords.accuracy || 0) * 3.28084)

        setGpsLatitude(latitude)
        setGpsLongitude(longitude)

        if (!gpsRadiusFeet || Number(gpsRadiusFeet) < accuracyFeet) {
          setGpsRadiusFeet(String(Math.max(300, accuracyFeet)))
        }

        setCurrentLocationMessage(`Current location added. Accuracy: about ${accuracyFeet} feet.`)
      },
      (error) => {
        setCurrentLocationMessage(error.message || 'Could not get current location.')
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    )
  }

  function saveDistributionGpsDrop() {
    const selectedDistributionStamp = stamps.find((stamp) => stamp.id === adminStampId) || stamps[0]

    if (!selectedDistributionStamp?.id) {
      setCurrentLocationMessage('Select a stamp first.')
      return
    }

    if (!adminFestivalId) {
      setCurrentLocationMessage('Select a festival first.')
      return
    }

    if (!gpsLatitude || !gpsLongitude) {
      setCurrentLocationMessage('Use Current Location or enter latitude and longitude first.')
      return
    }

    if (!gpsRadiusFeet || Number(gpsRadiusFeet) <= 0) {
      setCurrentLocationMessage('Enter a valid radius in feet.')
      return
    }

    setCurrentLocationMessage('Saving GPS pin drop...')
    createGpsDropWithMapOverlay()
  }

  const selectedDistributionStamp = stamps.find((stamp) => stamp.id === adminStampId) || stamps[0]
  const distributionClaimUrl = selectedDistributionStamp ? getClaimUrl(selectedDistributionStamp.id, activeDropWindows?.[selectedDistributionStamp.id]?.token) : ''
  const distributionQrUrl = distributionClaimUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(distributionClaimUrl)}`
    : ''

  const mapShellStyle = mapExpanded
    ? {
        position: 'fixed', maxWidth: 'calc(100vw - 24px)', overflow: 'hidden',
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
      <p style={styles.pageNumber}>ADMIN</p>
      <h2 style={styles.bookTitle}>Event Window Controls</h2>

      <button style={adminTestMode ? styles.dangerButton : styles.mainButton} onClick={() => setAdminTestMode((value) => !value)}>
        {adminTestMode ? 'TURN TEST MODE OFF' : 'TURN TEST MODE ON'}
      </button>

      <label style={styles.labelDark}>Stamp</label>
      <select style={phoneLockInputStyle} value={adminStampId} onChange={(event) => setAdminStampId(event.target.value)}>
        {stamps.map((stamp) => (
          <option key={stamp.id} value={stamp.id}>{stamp.name}</option>
        ))}
      </select>

      <label style={styles.labelDark}>Start Time</label>
      <input style={phoneLockInputStyle} type="datetime-local" value={dropStart} onChange={(event) => setDropStart(event.target.value)} />

      <label style={styles.labelDark}>End Time</label>
      <input style={phoneLockInputStyle} type="datetime-local" value={dropEnd} onChange={(event) => setDropEnd(event.target.value)} />

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={dropSecret} onChange={(event) => setDropSecret(event.target.checked)} />
        Secret Drop
      </label>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={dropLegendary} onChange={(event) => setDropLegendary(event.target.checked)} />
        Legendary Drop
      </label>

      <input style={phoneLockInputStyle} type="number" placeholder="Max claims, optional" value={dropMaxClaims} onChange={(event) => setDropMaxClaims(event.target.value)} />

      <button style={styles.mainButton} onClick={handleAdvancedDropSave}>
        SAVE + ACTIVATE EVENT WINDOW
      </button>

      <button style={styles.dangerButton} onClick={() => toggleLiveDrop(adminStampId, false)}>
        TURN SELECTED DROP OFF
      </button>

      {adminMessage && <p style={styles.successText}>{adminMessage}</p>}

      <h2 style={styles.bookTitle}>Admin Stamp QR / NFC Claim Generator</h2>

      <div style={adminHardFixCardStyle}>
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
                style={{ width: 240, maxWidth: '100%', maxWidth: '100%', borderRadius: 12 }}
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

      <h2 style={styles.bookTitle}>Stamp Distribution Center</h2>

      <div style={adminHardFixCardStyle}>
        <strong>Select the reward first, then choose how people unlock it.</strong>
        <small>This is the main workflow for GPS drops, QR stickers, NFC tags, timed drops, and admin giveaways.</small>
      </div>

      <label style={styles.labelDark}>Distribution Stamp</label>
      <select style={phoneLockInputStyle} value={adminStampId} onChange={(event) => setAdminStampId(event.target.value)}>
        {stamps.map((stamp) => (
          <option key={`distribution-${stamp.id}`} value={stamp.id}>{stamp.name}</option>
        ))}
      </select>

      {selectedDistributionStamp && (
        <div style={{ ...styles.adminCard, gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {selectedDistributionStamp.image && (
              <img
                src={selectedDistributionStamp.image}
                alt={selectedDistributionStamp.name}
                style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 22, border: '1px solid rgba(34,211,238,.35)' }}
              />
            )}
            <div>
              <strong>{selectedDistributionStamp.name}</strong>
              <small>{selectedDistributionStamp.location || 'No location assigned'} • {selectedDistributionStamp.rarity || 'normal'}</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 8 }}>
            {[
              ['gps', 'GPS DROP'],
              ['qr', 'QR STICKER'],
              ['nfc', 'NFC TAG'],
              ['timed', 'TIMED DROP'],
              ['giveaway', 'ADMIN GIVEAWAY'],
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                style={distributionMode === mode ? styles.mainButton : styles.secondaryButton}
                onClick={() => setDistributionMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>

          {distributionMode === 'gps' && (
            <div style={adminHardFixCardStyle}>
              <strong>GPS Drop</strong>
              <small>Stand where the stamp should unlock, tap Use Current Location, then save the GPS pin drop.</small>

              <button type="button" style={styles.mainButton} onClick={useCurrentLocationForGpsDrop}>
                📍 USE CURRENT LOCATION
              </button>

              {currentLocationMessage && <small>{currentLocationMessage}</small>}

              <input style={phoneLockInputStyle} placeholder="Latitude" value={gpsLatitude} onChange={(event) => setGpsLatitude(event.target.value)} />
              <input style={phoneLockInputStyle} placeholder="Longitude" value={gpsLongitude} onChange={(event) => setGpsLongitude(event.target.value)} />
              <input style={phoneLockInputStyle} placeholder="Radius feet, example 300" value={gpsRadiusFeet} onChange={(event) => setGpsRadiusFeet(event.target.value)} />
              <input style={phoneLockInputStyle} placeholder="Drop title" value={gpsTitle} onChange={(event) => setGpsTitle(event.target.value)} />

              <button type="button" style={styles.mainButton} onClick={saveDistributionGpsDrop}>
                SAVE GPS PIN DROP
              </button>

              {gpsAdminMessage && <p style={styles.successText}>{gpsAdminMessage}</p>}
            </div>
          )}

          {distributionMode === 'qr' && (
            <div style={adminHardFixCardStyle}>
              <strong>QR Sticker</strong>
              <small>Use this for printed stickers, posters, poker chips, flyers, or stage handouts.</small>
              {distributionQrUrl && (
                <div style={{ background: 'white', color: '#111', padding: 16, borderRadius: 18, display: 'grid', gap: 8, justifyItems: 'center' }}>
                  <strong>QR CLAIM CODE</strong>
                  <img src={distributionQrUrl} alt="QR claim code" style={{ width: 220, maxWidth: '100%', maxWidth: '100%', borderRadius: 12 }} />
                </div>
              )}
              <input style={phoneLockInputStyle} readOnly value={distributionClaimUrl} onClick={(event) => event.target.select()} />
              <button type="button" style={styles.secondaryButton} onClick={copyAdminClaimUrl}>
                COPY QR CLAIM LINK
              </button>
            </div>
          )}

          {distributionMode === 'nfc' && (
            <div style={adminHardFixCardStyle}>
              <strong>NFC Tag</strong>
              <small>Program this exact URL onto an NFC tag. Tapping the tag opens the claim flow.</small>
              <input style={phoneLockInputStyle} readOnly value={distributionClaimUrl} onClick={(event) => event.target.select()} />
              <button type="button" style={styles.secondaryButton} onClick={copyAdminClaimUrl}>
                COPY NFC URL
              </button>
            </div>
          )}

          {distributionMode === 'timed' && (
            <div style={adminHardFixCardStyle}>
              <strong>Timed Drop</strong>
              <small>Use this for opening ceremonies, sunrise sets, parade windows, and limited drops.</small>
              <label style={styles.labelDark}>Start Time</label>
              <input style={phoneLockInputStyle} type="datetime-local" value={dropStart} onChange={(event) => setDropStart(event.target.value)} />
              <label style={styles.labelDark}>End Time</label>
              <input style={phoneLockInputStyle} type="datetime-local" value={dropEnd} onChange={(event) => setDropEnd(event.target.value)} />
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={dropSecret} onChange={(event) => setDropSecret(event.target.checked)} />
                Secret Drop
              </label>
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={dropLegendary} onChange={(event) => setDropLegendary(event.target.checked)} />
                Legendary Drop
              </label>
              <input style={phoneLockInputStyle} type="number" placeholder="Max claims, optional" value={dropMaxClaims} onChange={(event) => setDropMaxClaims(event.target.value)} />
              <button type="button" style={styles.mainButton} onClick={handleAdvancedDropSave}>
                SAVE TIMED DROP
              </button>
              {adminMessage && <p style={styles.successText}>{adminMessage}</p>}
            </div>
          )}

          {distributionMode === 'giveaway' && (
            <div style={adminHardFixCardStyle}>
              <strong>Admin Giveaway</strong>
              <small>Use this at parades, meetups, booths, or one-on-one handouts. Share the claim link by QR, NFC, AirDrop, or message.</small>
              <input style={phoneLockInputStyle} readOnly value={distributionClaimUrl} onClick={(event) => event.target.select()} />
              <button type="button" style={styles.secondaryButton} onClick={copyAdminClaimUrl}>
                COPY GIVEAWAY CLAIM LINK
              </button>
            </div>
          )}
        </div>
      )}



      <h2 style={styles.bookTitle}>Festival Operations Dashboard</h2>

      <div style={adminHardFixListStyle}>
        <div style={adminHardFixCardStyle}>
          <strong>Festival Readiness</strong>
          <small>Managed Festivals: {managedFestivals.length}</small>
          <small>GPS Drops: {gpsDrops.length}</small>
          <small>Admin Stamps: {adminCreatedStamps.length}</small>
          <small>
            Readiness Score: {Math.min(100, (managedFestivals.length * 20) + (gpsDrops.length * 5) + (adminCreatedStamps.length * 3))}%
          </small>
        </div>

        <div style={adminHardFixCardStyle}>
          <strong>Demand Snapshot</strong>
          <small>Total Festivals Tracked: {festivalDemandSummary.length}</small>
          <small>
            Total Going: {festivalDemandSummary.reduce((sum, item) => sum + (item.going_count || 0), 0)}
          </small>
          <small>
            Total Interested: {festivalDemandSummary.reduce((sum, item) => sum + (item.interested_count || 0), 0)}
          </small>
        </div>
      </div>

      <h3>Festival Demand Rankings</h3>

      <div style={adminHardFixListStyle}>
        {[...festivalDemandSummary]
          .sort((a, b) => (b.total_count || 0) - (a.total_count || 0))
          .map((festival) => (
            <div key={`ops-${festival.festival_id}`} style={adminHardFixCardStyle}>
              <strong>{festival.festival_id}</strong>
              <small>Going: {festival.going_count || 0}</small>
              <small>Interested: {festival.interested_count || 0}</small>
              <small>Total Demand: {festival.total_count || 0}</small>

              <small>
                Recommended Action:{' '}
                {(festival.total_count || 0) >= 25
                  ? 'Deploy GPS drops and exclusive stamps'
                  : (festival.total_count || 0) >= 10
                  ? 'Create festival-specific stamps'
                  : 'Monitor demand'}
              </small>
            </div>
          ))}
      </div>


      <h2 style={styles.bookTitle}>Festival Heatmap & Claim Analytics</h2>

      <div style={adminHardFixListStyle}>
        <div style={adminHardFixCardStyle}>
          <strong>Claim Statistics</strong>
          <small>Total Festivals: {festivalDemandSummary.length}</small>
          <small>Total GPS Drops: {gpsDrops.length}</small>
          <small>Total Admin Stamps: {adminCreatedStamps.length}</small>
          <small>Total Demand Signals: {festivalDemandSummary.reduce((sum, item) => sum + (item.total_count || 0), 0)}</small>
        </div>

        <div style={adminHardFixCardStyle}>
          <strong>Most Popular Stamps</strong>
          <small>#1: Kinetic Field</small>
          <small>#2: Circuit Grounds</small>
          <small>#3: Cosmic Meadow</small>
          <small>Replace with live claim data in Build 24.</small>
        </div>
      </div>

      <h3>Festival Heatmap Priorities</h3>

      <div style={adminHardFixListStyle}>
        {[...festivalDemandSummary]
          .sort((a, b) => (b.total_count || 0) - (a.total_count || 0))
          .slice(0, 5)
          .map((festival) => (
            <div key={`heat-${festival.festival_id}`} style={adminHardFixCardStyle}>
              <strong>{festival.festival_id}</strong>
              <small>Demand Score: {festival.total_count || 0}</small>
              <small>
                Priority: {(festival.total_count || 0) >= 25 ? 'HIGH' : (festival.total_count || 0) >= 10 ? 'MEDIUM' : 'LOW'}
              </small>
            </div>
          ))}
      </div>



      <h2 style={styles.bookTitle}>Festival Wizard</h2>

      <div style={adminHardFixCardStyle}>
        <strong>Build 19B Fast Setup Flow</strong>
        <small>Use this guided workflow to create a festival, add map information, choose stamps, place pins, and prepare for QR/NFC publishing.</small>
        <small>Business goal: make every new festival repeatable instead of manually hunting through admin tools.</small>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((step) => (
          <button
            key={step}
            type="button"
            style={{
              ...styles.secondaryButton,
              padding: '10px 6px',
              opacity: wizardStep === step ? 1 : 0.72,
              boxShadow: wizardStep === step ? '0 0 18px rgba(34,211,238,.35)' : styles.secondaryButton?.boxShadow,
            }}
            onClick={() => goToWizardStep(step)}
          >
            {step}
          </button>
        ))}
      </div>

      {wizardStep === 1 && (
        <div style={adminHardFixCardStyle}>
          <strong>Step 1 — Festival Basics</strong>
          <small>Name the festival and set its business status.</small>

          <input style={phoneLockInputStyle} placeholder="Festival name, example: EDC Las Vegas 2027" value={festivalName || ''} onChange={(event) => setFestivalName?.(event.target.value)} />
          <input style={phoneLockInputStyle} placeholder="Location, example: Las Vegas Motor Speedway" value={festivalLocation || ''} onChange={(event) => setFestivalLocation?.(event.target.value)} />

          <select style={phoneLockInputStyle} value={festivalStatus || 'upcoming'} onChange={(event) => setFestivalStatus?.(event.target.value)}>
            <option value="upcoming">Upcoming</option>
            <option value="attended">Attended</option>
          </select>

          <label style={styles.labelDark}>Start Date</label>
          <input style={phoneLockInputStyle} type="date" value={festivalStartDate || ''} onChange={(event) => setFestivalStartDate?.(event.target.value)} />

          <label style={styles.labelDark}>End Date</label>
          <input style={phoneLockInputStyle} type="date" value={festivalEndDate || ''} onChange={(event) => setFestivalEndDate?.(event.target.value)} />

          <button type="button" style={styles.mainButton} onClick={() => goToWizardStep(2)}>
            NEXT: MAP
          </button>
        </div>
      )}

      {wizardStep === 2 && (
        <div style={adminHardFixCardStyle}>
          <strong>Step 2 — Festival Map</strong>
          <small>Add the official or approved map URL. Build 20 will replace this with direct upload.</small>

          <input style={phoneLockInputStyle} placeholder="Festival banner image URL" value={festivalBannerUrl || ''} onChange={(event) => setFestivalBannerUrl?.(event.target.value)} />
          <input style={phoneLockInputStyle} placeholder="Festival map image URL / official map URL" value={festivalMapUrl || ''} onChange={(event) => setFestivalMapUrl?.(event.target.value)} />

          {festivalMapUrl && (
            <div style={styles.linkCard}>
              <strong>Map Preview</strong>
              <img src={festivalMapUrl} alt="Festival map preview" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 16, marginTop: 10, border: '1px solid rgba(34,211,238,.32)' }} />
            </div>
          )}

          <button type="button" style={styles.secondaryButton} onClick={() => goToWizardStep(1)}>
            BACK
          </button>
          <button type="button" style={styles.mainButton} onClick={() => goToWizardStep(3)}>
            NEXT: STAMPS
          </button>
        </div>
      )}

      {wizardStep === 3 && (
        <div style={adminHardFixCardStyle}>
          <strong>Step 3 — Choose Stamps</strong>
          <small>Select existing stamps for this festival. AI stamp generation comes later; this keeps setup fast and reliable.</small>

          <div style={adminHardFixGridStyle}>
            {stamps.map((stamp) => {
              const selected = wizardSelectedStampIds.includes(stamp.id)

              return (
                <button
                  key={`wizard-stamp-${stamp.id}`}
                  type="button"
                  style={{
                    ...styles.stampButton,
                    border: selected ? '2px solid rgba(34,211,238,.95)' : styles.stampButton?.border,
                    boxShadow: selected ? '0 0 20px rgba(34,211,238,.28)' : styles.stampButton?.boxShadow,
                  }}
                  onClick={() => toggleWizardStamp(stamp.id)}
                >
                  <Stamp stamp={stamp} collected />
                  <small>{stamp.name}</small>
                  <small>{selected ? 'SELECTED' : 'TAP TO SELECT'}</small>
                </button>
              )
            })}
          </div>

          <small>{wizardSelectedStamps.length} stamps selected.</small>

          <button type="button" style={styles.secondaryButton} onClick={() => goToWizardStep(2)}>
            BACK
          </button>
          <button type="button" style={styles.mainButton} onClick={() => goToWizardStep(4)}>
            NEXT: PLACE PINS
          </button>
        </div>
      )}

      {wizardStep === 4 && (
        <div style={adminHardFixCardStyle}>
          <strong>Step 4 — Place Pins</strong>
          <small>Use the Festival Map Overlay Pin Board below to tap the map and save pins to real GPS drops.</small>
          <small>Current selected festival pins: {wizardPinCount}</small>
          <small>Selected stamp set: {wizardSelectedStamps.length}</small>

          <button type="button" style={styles.secondaryButton} onClick={() => goToWizardStep(3)}>
            BACK
          </button>
          <button type="button" style={styles.mainButton} onClick={() => goToWizardStep(5)}>
            NEXT: REVIEW
          </button>
        </div>
      )}

      {wizardStep === 5 && (
        <div style={adminHardFixCardStyle}>
          <strong>Step 5 — Review + Publish</strong>
          <small>Festival: {festivalName || 'Not named yet'}</small>
          <small>Location: {festivalLocation || 'No location yet'}</small>
          <small>Dates: {festivalStartDate || 'No start date'} — {festivalEndDate || 'No end date'}</small>
          <small>Map: {festivalMapUrl ? 'Map URL added' : 'No map yet'}</small>
          <small>Selected stamps: {wizardSelectedStamps.length}</small>
          <small>Pins for selected festival: {wizardPinCount}</small>

          <button type="button" style={styles.secondaryButton} onClick={() => goToWizardStep(4)}>
            BACK
          </button>
          <button type="button" style={styles.mainButton} onClick={publishWizardFestival}>
            SAVE / PUBLISH FESTIVAL
          </button>

          {wizardMessage && <p style={styles.successText}>{wizardMessage}</p>}
        </div>
      )}

      <h2 style={styles.bookTitle}>Festival Manager</h2>

      <div style={adminHardFixCardStyle}>
        <strong>Create / Manage Festivals</strong>
        <small>Create each festival first. Then select it below before dropping pins. GPS drops are saved only to the selected festival.</small>
      </div>

      <input style={phoneLockInputStyle} placeholder="Festival name" value={festivalName || ''} onChange={(event) => setFestivalName?.(event.target.value)} />
      <input style={phoneLockInputStyle} placeholder="Festival location" value={festivalLocation || ''} onChange={(event) => setFestivalLocation?.(event.target.value)} />

      <select style={phoneLockInputStyle} value={festivalStatus || 'upcoming'} onChange={(event) => setFestivalStatus?.(event.target.value)}>
        <option value="upcoming">Upcoming</option>
        <option value="attended">Attended</option>
      </select>

      <label style={styles.labelDark}>Start Date</label>
      <input style={phoneLockInputStyle} type="date" value={festivalStartDate || ''} onChange={(event) => setFestivalStartDate?.(event.target.value)} />

      <label style={styles.labelDark}>End Date</label>
      <input style={phoneLockInputStyle} type="date" value={festivalEndDate || ''} onChange={(event) => setFestivalEndDate?.(event.target.value)} />

      <input style={phoneLockInputStyle} placeholder="Festival banner image URL" value={festivalBannerUrl || ''} onChange={(event) => setFestivalBannerUrl?.(event.target.value)} />
      <input style={phoneLockInputStyle} placeholder="Festival map image URL / official map URL" value={festivalMapUrl || ''} onChange={(event) => setFestivalMapUrl?.(event.target.value)} />

      <button style={styles.mainButton} onClick={async () => { await handleCreateFestival?.(); forceMobileViewportReflow() }}>
        CREATE FESTIVAL
      </button>

      {festivalAdminMessage && <div style={compactStatusCardStyle}><strong>{festivalAdminMessage}</strong></div>}

      <h2 style={styles.bookTitle}>Festival Demand Dashboard</h2>
      <div style={adminHardFixCardStyle}>
        <strong>Business Signal</strong>
        <small>Use this to decide where EDM Passport should spend time creating maps, pins, stamps, and drops.</small>
        <button type="button" style={styles.secondaryButton} onClick={refreshFestivalDemandSummary}>
          REFRESH DEMAND
        </button>
      </div>

      <div style={adminHardFixListStyle}>
        {[...festivalDemandSummary]
          .sort((a, b) => ((b.going_count || 0) + (b.interested_count || 0)) - ((a.going_count || 0) + (a.interested_count || 0)))
          .map((item, index) => {
            const festival = managedFestivals.find((record) => record.id === item.festival_id) || {}
            const going = item.going_count || 0
            const interested = item.interested_count || 0
            const totalDemand = going + interested
            const recommendation = going >= 25 ? 'HIGH PRIORITY: build drops' : totalDemand >= 10 ? 'WATCHLIST: validate demand' : 'LOW PRIORITY: wait'

            return (
              <div key={item.festival_id || index} style={adminHardFixCardStyle}>
                <strong>{index + 1}. {festival.name || item.festival_id}</strong>
                <small>{festival.location || 'Festival location not set'}</small>
                <small>{going} going • {interested} interested • {totalDemand} total signal</small>
                <small>{recommendation}</small>
              </div>
            )
          })}
        {!festivalDemandSummary.length && (
          <div style={styles.linkCard}>No festival demand data yet. Users need to mark Going or Interested first.</div>
        )}
      </div>

      <h2 style={styles.bookTitle}>Festival-Specific GPS Map</h2>

      <label style={styles.labelDark}>Selected Festival For Drops</label>
      <select
        style={phoneLockInputStyle}
        value={adminFestivalId || ''}
        onChange={(event) => setAdminFestivalId?.(event.target.value)}
      >
        {managedFestivals.map((festival) => (
          <option key={festival.id} value={festival.id}>
            {festival.name}
          </option>
        ))}
      </select>

      <div style={adminHardFixCardStyle}>
        <strong>{adminFestival?.name || 'Select a festival'}</strong>
        <small>{adminFestival?.location || 'GPS drops created below will belong only to this festival.'}</small>
        {adminFestival?.map_url && <small>Map: {adminFestival.map_url}</small>}
        {adminFestival?.mapUrl && <small>Map: {adminFestival.mapUrl}</small>}
      </div>

      <h2 style={styles.bookTitle}>Festival Map Overlay Pin Board</h2>

      <div style={adminHardFixCardStyle}>
        <strong>Stage / Festival Image Overlay</strong>
        <small>Use the festival map image to visually place the stamp pin. Then use the live GPS map below to fill the real latitude and longitude before saving.</small>
        <small>This gives you a human-friendly festival map pin plus the real GPS data needed for auto-unlock.</small>
      </div>

      {activeFestivalMapUrl ? (
        <div style={{ ...styles.adminCard, gap: 12 }}>
          <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: 22, border: '2px solid rgba(34,211,238,.45)', boxShadow: '0 0 28px rgba(255,45,214,.18)', background: '#050510' }}>
            <img
              src={activeFestivalMapUrl}
              alt={`${adminFestival?.name || 'Festival'} map overlay`}
              onClick={handleFestivalMapClick}
              style={{ width: '100%', display: 'block', cursor: 'crosshair', userSelect: 'none' }}
            />

            {gpsDrops
              .filter((drop) => drop.map_x_percent !== null && drop.map_x_percent !== undefined && drop.map_y_percent !== null && drop.map_y_percent !== undefined)
              .map((drop) => (
                <button
                  key={`map-overlay-${drop.id}`}
                  type="button"
                  title={drop.title || getStampName(drop.stamp_id)}
                  onClick={() => loadDropIntoForm(drop)}
                  style={{
                    position: 'absolute',
                    left: `${Number(drop.map_x_percent)}%`,
                    top: `${Number(drop.map_y_percent)}%`,
                    transform: 'translate(-50%, -100%)',
                    border: 0,
                    background: 'transparent',
                    fontSize: 28,
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 0 10px rgba(255,45,214,.95))',
                  }}
                >
                  📍
                </button>
              ))}

            {selectedMapPin && (
              <div
                style={{
                  position: 'absolute',
                  left: `${selectedMapPin.xPercent}%`,
                  top: `${selectedMapPin.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: 34,
                  pointerEvents: 'none',
                  filter: 'drop-shadow(0 0 12px rgba(34,211,238,.95))',
                }}
              >
                ✨
              </div>
            )}
          </div>

          <div style={styles.linkCard}>
            <strong>{selectedMapDropStamp?.name || 'Selected stamp'}</strong>
            <small>
              {selectedMapPin
                ? `Map pin: ${selectedMapPin.xPercent.toFixed(1)}% X / ${selectedMapPin.yPercent.toFixed(1)}% Y`
                : 'Tap the festival map image to place the visual pin.'}
            </small>
            <small>GPS coordinates still come from the live map or manual latitude/longitude fields.</small>
          </div>

          <input
            style={phoneLockInputStyle}
            placeholder="Map note, example: left of Kinetic Field entrance"
            value={festivalMapNote}
            onChange={(event) => setFestivalMapNote(event.target.value)}
          />
        </div>
      ) : (
        <div style={styles.warningBox}>
          <strong>No festival map image yet.</strong>
          <p>Add a festival map image URL above, save/update the festival, then this overlay becomes the visual pin board.</p>
        </div>
      )}

      <h2 style={styles.bookTitle}>Saved GPS Pin Drops</h2>

      <div style={adminHardFixCardStyle}>
        <strong>GPS creation moved to Stamp Distribution Center.</strong>
        <small>Select a stamp above, choose GPS Drop, use current location, then save the GPS pin drop.</small>
        <button style={styles.secondaryButton} onClick={refreshGpsDrops}>
          REFRESH GPS DROPS
        </button>
      </div>

      <h3>Current GPS Pin Drops For Selected Festival</h3>

      <div style={adminHardFixListStyle}>
        {gpsDrops.length ? (
          gpsDrops.map((drop) => (
            <button key={drop.id} type="button" style={adminHardFixCardStyle} onClick={() => loadDropIntoForm(drop)}>
              <strong>{drop.title || getStampName(drop.stamp_id)}</strong>
              <small>{getStampName(drop.stamp_id)}</small>
              <small>Lat: {Number(drop.latitude).toFixed(6)}</small>
              <small>Lng: {Number(drop.longitude).toFixed(6)}</small>
              <small>Radius: {drop.radius_feet || 300} feet</small>
              {drop.map_x_percent !== null && drop.map_x_percent !== undefined && (
                <small>Map Pin: {Number(drop.map_x_percent).toFixed(1)}% / {Number(drop.map_y_percent).toFixed(1)}%</small>
              )}
              {drop.map_note && <small>Note: {drop.map_note}</small>}
            </button>
          ))
        ) : (
          <div style={styles.linkCard}>No active GPS drops yet.</div>
        )}
      </div>
      <h3>Admin Stamp Creator</h3>

      <div style={adminHardFixCardStyle}>
        <strong>Create New Stamp</strong>
        <small>
          Build 20A adds direct image upload. Upload a PNG/JPG/WebP or paste a fallback image URL.
        </small>

        <input
          style={phoneLockInputStyle}
          placeholder="Stamp name"
          value={adminStampNameInput}
          onChange={(event) => setAdminStampNameInput(event.target.value)}
        />

        <label style={adminHardFixCardStyle}>
          <strong>Upload Stamp Image</strong>
          <small>Recommended: square PNG/JPG/WebP. This saves to Supabase Storage.</small>
          <input
            style={phoneLockInputStyle}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0] || null
              setAdminStampImageFile(file)
              setAdminStampUploadPreview(file ? URL.createObjectURL(file) : '')
            }}
          />
        </label>

        {adminStampUploadPreview && (
          <div style={{ ...styles.adminCard, alignItems: 'center', textAlign: 'center' }}>
            <small>Upload Preview</small>
            <img
              src={adminStampUploadPreview}
              alt="Stamp upload preview"
              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 24, border: '1px solid rgba(34,211,238,.35)', boxShadow: '0 0 22px rgba(34,211,238,.22)' }}
            />
          </div>
        )}

        <input
          style={phoneLockInputStyle}
          placeholder="Optional fallback image URL"
          value={adminStampImageUrlInput}
          onChange={(event) => setAdminStampImageUrlInput(event.target.value)}
        />

        <input
          style={phoneLockInputStyle}
          placeholder="Location / event name"
          value={adminStampLocationInput}
          onChange={(event) => setAdminStampLocationInput(event.target.value)}
        />

        <input
          style={phoneLockInputStyle}
          placeholder="XP value"
          value={adminStampXpInput}
          onChange={(event) => setAdminStampXpInput(event.target.value)}
        />

        <select
          style={phoneLockInputStyle}
          value={adminStampRarityInput}
          onChange={(event) => setAdminStampRarityInput(event.target.value)}
        >
          <option value="common">Common</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
          <option value="mythic">Mythic</option>
          <option value="hidden">Hidden</option>
          <option value="secret">Secret</option>
        </select>
        <small>Use rarity to make stamps feel collectible. Hidden, secret, and legendary stamps appear as ??? until discovered.</small>

        <button style={styles.mainButton} onClick={handleCreateAdminStampWithReflow} disabled={adminStampUploading}>
          {adminStampUploading ? 'UPLOADING...' : 'CREATE ADMIN STAMP'}
        </button>

        {adminStampCreatorMessage && <div style={compactStatusCardStyle}><strong>{adminStampCreatorMessage}</strong></div>}
      </div>

      <h3>Admin-Created Stamps</h3>

      <div style={adminHardFixListStyle}>
        {adminCreatedStamps.length ? (
          adminCreatedStamps.map((stamp) => (
            <div key={`admin-created-${stamp.id}`} style={adminHardFixCardStyle}>
              <strong>{stamp.name}</strong>
              <small>{stamp.rarity || 'normal'} • {stamp.location}</small>
              <img
                src={stamp.image}
                alt={stamp.name}
                style={{ width: 110, maxWidth: '100%', height: 110, objectFit: 'cover', borderRadius: 18 }}
              />
              <input
                style={phoneLockInputStyle}
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

<h3>Admin QR / NFC Stamp Generator</h3>

      <div style={adminHardFixListStyle}>
        {stamps.map((stamp) => {
          const claimUrl = getClaimUrl(stamp.id)
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(claimUrl)}`

          return (
            <div key={`generator-${stamp.id}`} style={adminHardFixCardStyle}>
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
                style={phoneLockInputStyle}
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

      <h3>Current Live Drops</h3>

      <div style={adminHardFixListStyle}>
        {stamps.map((stamp) => {
          const live = activeDrops.includes(stamp.id)
          const window = activeDropWindows[stamp.id]

          return (
            <div key={stamp.id} style={adminHardFixCardStyle}>
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


/* BUILD 23 placeholder:
Festival Heatmap & Claim Analytics
- Total Claims
- GPS Claims
- QR Claims
- NFC Claims
- Top Stamps
- Most Active Festivals
*/
