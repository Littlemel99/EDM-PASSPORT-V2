import AdminPage from './components/AdminPage.jsx'
import FamilyPage from './components/FamilyPage'
import TimelinePage from './components/TimelinePage'
import RecapPage from './components/RecapPage'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import { stamps } from './data/stamps'
import { countries, getPassportImage } from './data/passports'
import { getGpsStatus } from './lib/gps'
import { getStats, getAchievements } from './lib/stats'
import Stamp from './components/Stamp'
import StampModal from './components/StampModal'
import {
  loadCollectedIds,
  saveStamp,
  loadLiveDrops,
  setLiveDrop,
  setAdvancedLiveDrop,
  getClaimUrl,
} from './services/stampService'
import {
  loadMemories,
  saveMemory,
  uploadMemoryImage,
} from './services/memoryService'
import {
  loadFamilies,
  loadPublicFamilies,
  createFamily,
  joinFamily,
} from './services/crewService'

const APP_URL = 'https://edm-passport-v2.vercel.app'
const ADMIN_EMAIL = 'fdruth@gmail.com'

function getActiveStamp(id) {
  return stamps.find((stamp) => stamp.id === id) || stamps[0]
}

export default function App() {
  const [user, setUser] = useState(null)
  const [country, setCountry] = useState(localStorage.getItem('edm-country') || '')
  const [activeId, setActiveId] = useState('world-party-parade')
  const [bookOpen, setBookOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedStamp, setSelectedStamp] = useState(null)

  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  const [collectedIds, setCollectedIds] = useState(['world-party-parade'])
  const [activeDrops, setActiveDrops] = useState(['world-party-parade'])
  const [activeDropWindows, setActiveDropWindows] = useState({})

  const [location, setLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [claimMessage, setClaimMessage] = useState('')
  const [adminTestMode, setAdminTestMode] = useState(false)

  const [families, setFamilies] = useState([])
  const [publicFamilies, setPublicFamilies] = useState([])
  const [activeFamilyId, setActiveFamilyId] = useState('')
  const [familyInput, setFamilyInput] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [familyMessage, setFamilyMessage] = useState('')

  const [memoryNote, setMemoryNote] = useState('')
  const [memoryPhotoFile, setMemoryPhotoFile] = useState(null)
  const [memories, setMemories] = useState([])
  const [memoryMessage, setMemoryMessage] = useState('')
  const [memorySaving, setMemorySaving] = useState(false)

  const [adminStampId, setAdminStampId] = useState('world-party-parade')
  const [dropStart, setDropStart] = useState('')
  const [dropEnd, setDropEnd] = useState('')
  const [dropSecret, setDropSecret] = useState(false)
  const [dropLegendary, setDropLegendary] = useState(false)
  const [dropMaxClaims, setDropMaxClaims] = useState('')
  const [adminMessage, setAdminMessage] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL
  const maxPage = isAdmin ? 10 : 9
  const activeStamp = useMemo(() => getActiveStamp(activeId), [activeId])
  const gpsStatus = useMemo(() => getGpsStatus(activeId, location), [activeId, location])
  const collectedStamps = stamps.filter((stamp) => collectedIds.includes(stamp.id))
  const stats = getStats(collectedStamps, stamps.length)
  const achievements = getAchievements(collectedStamps)
  const activeFamily = families.find((family) => family.id === activeFamilyId) || families[0] || null
  const activeFamilyUrl = activeFamily?.code ? `${APP_URL}?joincrew=${encodeURIComponent(activeFamily.code)}` : ''

  useEffect(() => {
    localStorage.setItem('edm-country', country)
  }, [country])

  useEffect(() => {
    refreshLiveDrops()
    refreshPublicFamilies()

    const params = new URLSearchParams(window.location.search)
    const claimId = params.get('claim')
    const joinCrewCode = params.get('joincrew')

    if (claimId && stamps.some((stamp) => stamp.id === claimId)) {
      setActiveId(claimId)
      setBookOpen(true)
      setPageIndex(2)
      setClaimMessage('QR/NFC claim detected.')
    }

    if (joinCrewCode) {
      setJoinCode(joinCrewCode.toUpperCase())
      setBookOpen(true)
      setPageIndex(5)
      setFamilyMessage('Family invite detected. Login, then tap JOIN FAMILY.')
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null
      setUser(currentUser)
      if (currentUser) await refreshUserData(currentUser)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) await refreshUserData(currentUser)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function refreshUserData(currentUser = user) {
    if (!currentUser) return

    setCollectedIds(await loadCollectedIds(currentUser))
    setMemories(await loadMemories(currentUser))

    const savedFamilies = await loadFamilies(currentUser)
    setFamilies(savedFamilies)

    if (savedFamilies.length && !activeFamilyId) {
      setActiveFamilyId(savedFamilies[0].id)
    }
  }

  async function refreshPublicFamilies() {
    setPublicFamilies(await loadPublicFamilies())
  }

  async function refreshLiveDrops() {
    const drops = await loadLiveDrops()
    const liveIds = drops.map((drop) => drop.stamp_id)

    setActiveDrops(Array.from(new Set(['world-party-parade', ...liveIds])))

    const windows = {}

    drops.forEach((drop) => {
      windows[drop.stamp_id] = {
        token: drop.claim_code,
        label: drop.ends_at ? new Date(drop.ends_at).toLocaleString() : 'Live now',
        startsAt: drop.starts_at,
        endsAt: drop.ends_at,
        isSecret: drop.is_secret,
        isLegendary: drop.is_legendary,
        maxClaims: drop.max_claims,
        claimCount: drop.claim_count,
      }
    })

    setActiveDropWindows(windows)
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: APP_URL },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  function requestLocation() {
    setLocationError('')
    setLocationLoading(true)

    if (!navigator.geolocation) {
      setLocationError('GPS is not available on this device.')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationLoading(false)
      },
      () => {
        setLocationError('Could not get location.')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    )
  }

  async function collectActiveStamp(method = 'manual') {
    const status = adminTestMode
      ? { required: false, unlocked: true }
      : getGpsStatus(activeStamp.id, location)

    if (status.required && !status.unlocked) {
      setClaimMessage('This stamp requires GPS unlock first.')
      return
    }

    setCollectedIds((current) => Array.from(new Set([...current, activeStamp.id, 'world-party-parade'])))

    if (user) await saveStamp(user, activeStamp.id, method)

    setClaimMessage(`${activeStamp.name} collected and saved.`)
  }

  async function handleCreateFamily() {
    if (!user) {
      setFamilyMessage('Login first to create a family.')
      return
    }

    try {
      setFamilyMessage('Creating family...')
      await createFamily(user, familyInput)
      setFamilyInput('')
      await refreshUserData(user)
      await refreshPublicFamilies()
      setFamilyMessage('Family created.')
    } catch (error) {
      setFamilyMessage(error.message)
    }
  }

  async function handleJoinFamily(codeOverride = '') {
    if (!user) {
      setFamilyMessage('Login first to join a family.')
      return
    }

    try {
      const code = codeOverride || joinCode
      setFamilyMessage('Joining family...')
      await joinFamily(user, code)
      setJoinCode('')
      await refreshUserData(user)
      setFamilyMessage('Family joined.')
    } catch (error) {
      setFamilyMessage(error.message)
    }
  }

  async function handleSaveMemory() {
    if (!user) {
      setMemoryMessage('Login first to save memories.')
      return
    }

    if (!memoryNote.trim() && !memoryPhotoFile) {
      setMemoryMessage('Add a note or photo first.')
      return
    }

    try {
      setMemorySaving(true)
      setMemoryMessage('Saving memory...')

      let imageUrl = null

      if (memoryPhotoFile) {
        imageUrl = await uploadMemoryImage(user, memoryPhotoFile)
      }

      await saveMemory(user, memoryNote, activeStamp.id, imageUrl)
      setMemories(await loadMemories(user))
      setMemoryNote('')
      setMemoryPhotoFile(null)
      setMemoryMessage('Memory saved.')
    } catch (error) {
      setMemoryMessage(error.message || 'Memory save failed.')
    } finally {
      setMemorySaving(false)
    }
  }

  async function toggleLiveDrop(stampId, isActive) {
    await setLiveDrop(stampId, isActive)
    await refreshLiveDrops()
  }

  async function handleAdvancedDropSave() {
    try {
      setAdminMessage('Saving event window...')

      await setAdvancedLiveDrop(adminStampId, {
        isActive: true,
        startsAt: dropStart ? new Date(dropStart).toISOString() : null,
        endsAt: dropEnd ? new Date(dropEnd).toISOString() : null,
        isSecret: dropSecret,
        isLegendary: dropLegendary,
        maxClaims: dropMaxClaims ? Number(dropMaxClaims) : null,
      })

      await refreshLiveDrops()
      setAdminMessage('Event window saved and activated.')
    } catch (error) {
      setAdminMessage(error.message || 'Event window save failed.')
    }
  }

  function chooseStamp(stamp) {
    setActiveId(stamp.id)
    setSelectedStamp(null)
    setPageIndex(6)
    setMemoryMessage(`Adding memory to ${stamp.name}.`)
  }

  function nextPage() {
    setPageIndex((current) => Math.min(current + 1, maxPage))
  }

  function previousPage() {
    setPageIndex((current) => Math.max(current - 1, 0))
  }

  function handleTouchStart(event) {
    setTouchStartX(event.touches[0].clientX)
    setTouchEndX(0)
  }

  function handleTouchMove(event) {
    setTouchEndX(event.touches[0].clientX)
  }

  function handleTouchEnd() {
    if (!touchStartX || !touchEndX) return

    const swipeDistance = touchStartX - touchEndX
    const minimumSwipeDistance = 50

    if (swipeDistance > minimumSwipeDistance) {
      nextPage()
    }

    if (swipeDistance < -minimumSwipeDistance) {
      previousPage()
    }

    setTouchStartX(0)
    setTouchEndX(0)
  }

  return (
    <main style={styles.screen}>
      <section style={styles.card}>
        {!bookOpen ? (
          <>
            <img src="/edm-passport-logo.png" alt="EDM Passport" style={styles.logo} />
            <h1 style={styles.title}>EDM Passport</h1>
            <p style={styles.tag}>TAP YOUR PASSPORT TO OPEN</p>

            <button style={styles.passportButton} onClick={() => setBookOpen(true)} disabled={!country}>
              {country ? (
                <img src={getPassportImage(country)} alt={country} style={styles.passportCover} />
              ) : (
                <div style={styles.emptyPassport}>Select a country first</div>
              )}
            </button>

            <label style={styles.label}>Passport Country</label>
            <select value={country} onChange={(event) => setCountry(event.target.value)} style={styles.input}>
              <option value="">Select Country</option>
              {countries.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            {!user ? (
              <button style={styles.mainButton} onClick={signInWithGoogle}>LOGIN WITH GOOGLE</button>
            ) : (
              <div style={styles.loginBox}>
                <p>Logged in as:</p>
                <strong>{user.email}</strong>
                <button style={styles.secondaryButton} onClick={signOut}>SIGN OUT</button>
              </div>
            )}
          </>
        ) : (
          <>
            <div
              style={styles.bookPage}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {pageIndex === 0 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 1</p>
                  <h2 style={styles.bookTitle}>{country} Passport</h2>
                  <p style={styles.bookText}>Your EDC identity is active.</p>
                  <div style={styles.statsMiniGrid}>
                    <div style={styles.statBox}><strong>{stats.totalXp}</strong><span>XP</span></div>
                    <div style={styles.statBox}><strong>{stats.level}</strong><span>Rank</span></div>
                  </div>
                </>
              )}

              {pageIndex === 1 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 2</p>
                  <h2 style={styles.bookTitle}>EDC Las Vegas 2026</h2>
                  <p style={styles.bookText}>Under the Electric Sky</p>

                  <div style={styles.stampGrid}>
                    {stamps.map((stamp) => {
                      const collected = collectedIds.includes(stamp.id)
                      const live = activeDrops.includes(stamp.id)
                      const memoryCount = memories.filter((memory) => memory.stamp_id === stamp.id).length

                      return (
                        <button key={stamp.id} style={styles.stampButton} onClick={() => chooseStamp(stamp)}>
                          <Stamp stamp={stamp} collected={collected || live} />
                          <small>{stamp.name}</small>
                          <small>{collected ? 'COLLECTED' : live ? 'LIVE' : 'LOCKED'}</small>
                          <small>{memoryCount} memories</small>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {pageIndex === 2 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 3</p>
                  <h2 style={styles.bookTitle}>GPS / QR / NFC Claim</h2>

                  <div style={styles.claimBox}>
                    <p style={styles.labelDark}>Selected Stamp</p>
                    <h3>{activeStamp.name}</h3>
                    <p>{activeStamp.location}</p>
                    <Stamp stamp={activeStamp} collected />

                    <div style={gpsStatus.unlocked || adminTestMode ? styles.successBox : styles.warningBox}>
                      <strong>{gpsStatus.unlocked || adminTestMode ? 'GPS READY' : 'GPS NEEDED'}</strong>
                      <p>{adminTestMode ? 'Admin test mode bypass is active.' : gpsStatus.message}</p>
                    </div>

                    <button style={styles.secondaryButton} onClick={requestLocation}>
                      {locationLoading ? 'CHECKING GPS...' : 'CHECK MY LOCATION'}
                    </button>

                    <button style={styles.mainButton} onClick={() => collectActiveStamp('qr-nfc-gps')}>COLLECT STAMP</button>

                    {locationError && <p style={styles.errorText}>{locationError}</p>}
                    {claimMessage && <p style={styles.successText}>{claimMessage}</p>}
                  </div>
                </>
              )}

              {pageIndex === 3 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 4</p>
                  <h2 style={styles.bookTitle}>Live Claim Links</h2>

                  <div style={styles.linkList}>
                    {stamps.map((stamp) => {
                      const window = activeDropWindows[stamp.id]

                      return (
                        <div key={stamp.id} style={styles.linkCard}>
                          <strong>{stamp.name}</strong>
                          <small>{getClaimUrl(stamp.id, window?.token)}</small>
                          <small>{activeDrops.includes(stamp.id) ? 'LIVE' : 'OFF'}</small>
                          {window?.isSecret && <small>SECRET DROP</small>}
                          {window?.isLegendary && <small>LEGENDARY DROP</small>}
                          {window?.maxClaims && (
                            <small>Limit: {window.claimCount || 0}/{window.maxClaims}</small>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {pageIndex === 4 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 5</p>
                  <h2 style={styles.bookTitle}>XP + Rank</h2>

                  <div style={styles.rankCard}>
                    <p style={styles.labelDark}>Current Rank</p>
                    <h1 style={styles.rankTitle}>{stats.level}</h1>
                    <p>{stats.totalXp} XP</p>
                  </div>

                  <div style={styles.statsGrid}>
                    <div style={styles.statBox}><strong>{stats.completion}%</strong><span>Complete</span></div>
                    <div style={styles.statBox}><strong>{stats.score}</strong><span>Score</span></div>
                    <div style={styles.statBox}><strong>{stats.legendary}</strong><span>Legendary</span></div>
                    <div style={styles.statBox}><strong>{stats.secret}</strong><span>Secret</span></div>
                  </div>

                  <div style={styles.linkList}>
                    {achievements.map((achievement) => (
                      <div key={achievement.name} style={achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked}>
                        <strong>{achievement.icon} {achievement.name}</strong>
                        <small>{achievement.unlocked ? 'Unlocked' : 'Locked'}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {pageIndex === 5 && (
                <FamilyPage
                  styles={styles}
                  activeFamily={activeFamily}
                  activeFamilyUrl={activeFamilyUrl}
                  families={families}
                  publicFamilies={publicFamilies}
                  familyInput={familyInput}
                  setFamilyInput={setFamilyInput}
                  joinCode={joinCode}
                  setJoinCode={setJoinCode}
                  handleCreateFamily={handleCreateFamily}
                  handleJoinFamily={handleJoinFamily}
                  setActiveFamilyId={setActiveFamilyId}
                  familyMessage={familyMessage}
                />
              )}

              {pageIndex === 6 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 7</p>
                  <h2 style={styles.bookTitle}>Sticker Story</h2>

                  <div style={styles.storyHero}>
                    <p style={styles.labelDark}>Selected Sticker</p>
                    <h1 style={styles.rankTitle}>{activeStamp.name}</h1>
                    <p>{activeStamp.location}</p>
                    <Stamp stamp={activeStamp} collected />
                    <p>{memories.filter((memory) => memory.stamp_id === activeStamp.id).length} memories saved</p>
                  </div>

                  <textarea
                    style={styles.memoryBox}
                    placeholder="Write your EDC memory..."
                    value={memoryNote}
                    onChange={(event) => setMemoryNote(event.target.value)}
                  />

                  <label style={styles.uploadButton}>
                    {memoryPhotoFile ? memoryPhotoFile.name : 'UPLOAD PHOTO'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(event) => setMemoryPhotoFile(event.target.files?.[0] || null)}
                    />
                  </label>

                  <button style={styles.mainButton} onClick={handleSaveMemory} disabled={memorySaving}>
                    {memorySaving ? 'SAVING...' : 'SAVE MEMORY'}
                  </button>

                  {memoryMessage && <p style={styles.successText}>{memoryMessage}</p>}

                  <div style={styles.linkList}>
                    {memories
                      .filter((memory) => memory.stamp_id === activeStamp.id)
                      .map((memory) => (
                        <div key={memory.id} style={styles.linkCard}>
                          <strong>{memory.stamp_id || 'Festival Memory'}</strong>
                          <p>{memory.note}</p>
                          {memory.image_url && (
                            <img src={memory.image_url} alt="Memory" style={styles.memoryImage} />
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}

              {pageIndex === 7 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 8</p>
                  <h2 style={styles.bookTitle}>Family Quests</h2>

                  <div style={styles.linkList}>
                    <div style={bookOpen ? styles.achievementUnlocked : styles.achievementLocked}>
                      <strong>✅ Open Passport</strong>
                      <small>Passport opened.</small>
                    </div>

                    <div style={collectedIds.length >= 3 ? styles.achievementUnlocked : styles.achievementLocked}>
                      <strong>Collect 3 Stamps</strong>
                      <small>{collectedIds.length}/3 collected</small>
                    </div>

                    <div style={families.length ? styles.achievementUnlocked : styles.achievementLocked}>
                      <strong>Join A Family</strong>
                      <small>Build your rave family.</small>
                    </div>

                    <div style={collectedIds.includes('basspod') ? styles.achievementUnlocked : styles.achievementLocked}>
                      <strong>Find Basspod</strong>
                      <small>Unlock the Basspod stamp.</small>
                    </div>
                  </div>
                </>
              )}

              {pageIndex === 8 && (
                <TimelinePage styles={styles} memories={memories} />
              )}

              {pageIndex === 9 && (
                <RecapPage
                  styles={styles}
                  collectedIds={collectedIds}
                  memories={memories}
                  families={families}
                  activeStamp={activeStamp}
                />
              )}

              {pageIndex === 10 && isAdmin && (
                <AdminPage
                  styles={styles}
                  stamps={stamps}
                  adminTestMode={adminTestMode}
                  setAdminTestMode={setAdminTestMode}
                  adminStampId={adminStampId}
                  setAdminStampId={setAdminStampId}
                  dropStart={dropStart}
                  setDropStart={setDropStart}
                  dropEnd={dropEnd}
                  setDropEnd={setDropEnd}
                  dropSecret={dropSecret}
                  setDropSecret={setDropSecret}
                  dropLegendary={dropLegendary}
                  setDropLegendary={setDropLegendary}
                  dropMaxClaims={dropMaxClaims}
                  setDropMaxClaims={setDropMaxClaims}
                  handleAdvancedDropSave={handleAdvancedDropSave}
                  toggleLiveDrop={toggleLiveDrop}
                  adminMessage={adminMessage}
                  activeDrops={activeDrops}
                  activeDropWindows={activeDropWindows}
                  getClaimUrl={getClaimUrl}
                />
              )}
            </div>

            <div style={styles.pageControls}>
              <button style={styles.secondaryButton} onClick={previousPage} disabled={pageIndex === 0}>← Previous</button>
              <p style={styles.pageCounter}>{pageIndex + 1} / {maxPage + 1}</p>
              <button style={styles.secondaryButton} onClick={nextPage} disabled={pageIndex === maxPage}>Next →</button>
            </div>

            <button style={styles.secondaryButton} onClick={() => setBookOpen(false)}>CLOSE PASSPORT</button>
          </>
        )}
      </section>

      {selectedStamp && <StampModal stamp={selectedStamp} onClose={() => setSelectedStamp(null)} />}
    </main>
  )
}

const styles = {
  screen: { minHeight: '100vh', padding: 16, background: 'radial-gradient(circle at top, rgba(255,0,200,.28), transparent 40%), radial-gradient(circle at bottom, rgba(0,255,255,.20), transparent 45%), #050510', color: 'white', fontFamily: 'Arial, Helvetica, sans-serif', boxSizing: 'border-box' },
  card: { width: '100%', maxWidth: 430, margin: '0 auto', padding: 18, borderRadius: 24, background: 'rgba(0,0,0,.72)', border: '1px solid rgba(0,255,255,.25)', boxSizing: 'border-box' },
  logo: { width: 120, height: 120, borderRadius: 999, objectFit: 'cover', display: 'block', margin: '0 auto 16px' },
  title: { textAlign: 'center', fontSize: 34, margin: '8px 0', fontWeight: 900 },
  tag: { textAlign: 'center', color: '#67e8f9', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 900 },
  passportButton: { width: '100%', marginTop: 18, padding: 0, border: 0, borderRadius: 24, background: 'transparent' },
  passportCover: { width: '100%', maxHeight: 440, objectFit: 'cover', borderRadius: 24, border: '1px solid rgba(0,255,255,.35)' },
  emptyPassport: { padding: 60, borderRadius: 24, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontWeight: 900 },
  label: { display: 'block', marginTop: 18, color: '#67e8f9', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 900 },
  input: { width: '100%', marginTop: 8, padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(0,0,0,.65)', color: 'white', boxSizing: 'border-box' },
  inputLight: { width: '100%', marginTop: 12, padding: 14, borderRadius: 14, border: '1px solid rgba(42,22,8,.18)', background: 'rgba(255,255,255,.55)', color: '#2a1608', boxSizing: 'border-box', fontWeight: 900 },
  uploadButton: { width: '100%', marginTop: 12, padding: 18, borderRadius: 16, border: '2px solid rgba(42,22,8,.24)', background: 'linear-gradient(90deg, #f9a8d4, #fde68a, #67e8f9)', color: '#2a1608', boxSizing: 'border-box', fontWeight: 900, display: 'block', textAlign: 'center', fontSize: 15 },
  mainButton: { width: '100%', marginTop: 16, padding: 14, borderRadius: 16, border: 0, fontWeight: 900, background: 'linear-gradient(90deg, #ff4fd8, #fb923c, #22d3ee)', color: 'black' },
  secondaryButton: { width: '100%', marginTop: 12, padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.08)', color: 'white', fontWeight: 900 },
  dangerButton: { width: '100%', marginTop: 12, padding: 12, borderRadius: 14, border: 0, background: 'linear-gradient(90deg, #fb7185, #f97316)', color: 'black', fontWeight: 900 },
  loginBox: { marginTop: 16, padding: 14, borderRadius: 16, background: 'rgba(255,255,255,.08)' },
  bookPage: { minHeight: '70vh', padding: 18, borderRadius: 22, background: 'linear-gradient(135deg, #fff6d7, #e8cf96)', color: '#2a1608', boxSizing: 'border-box', touchAction: 'pan-y' },
  pageNumber: { color: '#7c4a14', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 900 },
  bookTitle: { fontSize: 30, margin: '8px 0', fontWeight: 900 },
  bookText: { color: '#7c4a14', fontWeight: 700 },
  claimBox: { marginTop: 16, padding: 16, borderRadius: 18, background: 'rgba(255,255,255,.45)', textAlign: 'center' },
  labelDark: { marginTop: 14, color: '#7c4a14', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 900, display: 'block' },
  checkboxRow: { marginTop: 12, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.45)', display: 'flex', gap: 10, alignItems: 'center', fontWeight: 900 },
  stampGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 18 },
  stampButton: { border: 0, background: 'rgba(42,22,8,.08)', color: '#2a1608', borderRadius: 16, padding: 10, display: 'grid', justifyItems: 'center', gap: 8, fontWeight: 900 },
  pageControls: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginTop: 12 },
  pageCounter: { margin: 0, color: '#67e8f9', fontSize: 12, fontWeight: 900 },
  successBox: { marginTop: 14, padding: 12, borderRadius: 14, background: 'rgba(34,197,94,.18)', border: '1px solid rgba(34,197,94,.35)' },
  warningBox: { marginTop: 14, padding: 12, borderRadius: 14, background: 'rgba(251,146,60,.18)', border: '1px solid rgba(251,146,60,.35)' },
  errorText: { marginTop: 12, padding: 10, borderRadius: 12, background: 'rgba(127,29,29,.45)', color: '#fecaca', fontWeight: 900 },
  successText: { marginTop: 12, padding: 10, borderRadius: 12, background: 'rgba(22,101,52,.30)', color: '#bbf7d0', fontWeight: 900 },
  linkList: { display: 'grid', gap: 10, marginTop: 16 },
  linkCard: { padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.45)', display: 'grid', gap: 6, overflowWrap: 'anywhere', fontSize: 11 },
  adminCard: { padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.45)', display: 'grid', gap: 8, overflowWrap: 'anywhere', fontSize: 11 },
  crewHero: { marginTop: 16, padding: 18, borderRadius: 22, background: 'linear-gradient(135deg, rgba(255,0,200,.22), rgba(0,255,255,.20), rgba(251,146,60,.20))', textAlign: 'center', border: '1px solid rgba(42,22,8,.18)' },
  familyCard: { padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.45)', display: 'grid', gap: 4, textAlign: 'left', border: 0, color: '#2a1608', fontWeight: 900 },
  familyActive: { padding: 12, borderRadius: 14, background: 'linear-gradient(90deg, rgba(255,0,200,.25), rgba(0,255,255,.25))', display: 'grid', gap: 4, textAlign: 'left', border: '2px solid rgba(42,22,8,.35)', color: '#2a1608', fontWeight: 900 },
  rankCard: { marginTop: 16, padding: 18, borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,0,200,.18), rgba(0,255,255,.16))', textAlign: 'center' },
  rankTitle: { margin: '8px 0', fontSize: 32, fontWeight: 900 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 16 },
  statsMiniGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 16 },
  statBox: { padding: 12, borderRadius: 16, background: 'rgba(255,255,255,.45)', display: 'grid', gap: 4, textAlign: 'center', fontWeight: 900 },
  achievementUnlocked: { padding: 12, borderRadius: 14, background: 'rgba(253,224,71,.35)', display: 'grid', gap: 4 },
  achievementLocked: { padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.22)', opacity: 0.45, display: 'grid', gap: 4 },
  flexCard: { marginTop: 16, padding: 18, borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,0,200,.35), rgba(0,255,255,.24), rgba(251,146,60,.28))', color: 'white', textAlign: 'center', boxShadow: '0 0 45px rgba(255,0,255,.22)' },
  memoryBox: { width: '100%', minHeight: 180, marginTop: 16, padding: 14, borderRadius: 16, border: '1px solid rgba(42,22,8,.18)', background: 'rgba(255,255,255,.55)', color: '#2a1608', boxSizing: 'border-box', fontWeight: 800 },
  storyHero: { marginTop: 16, padding: 18, borderRadius: 22, background: 'linear-gradient(135deg, rgba(255,0,200,.22), rgba(0,255,255,.20), rgba(251,146,60,.20))', textAlign: 'center' },
  timelineCard: { padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.45)', display: 'grid', gap: 8 },
  memoryImage: { width: '100%', borderRadius: 14, marginTop: 8 },
}
