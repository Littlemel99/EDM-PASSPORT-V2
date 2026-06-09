import AdminPage from './components/AdminPage.jsx'
import FamilyPage from './components/FamilyPage'
import TimelinePage from './components/TimelinePage'
import RecapPage from './components/RecapPage'
import PublicProfile from './components/PublicProfile'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import { stamps } from './data/stamps'
import { countries, getPassportImage } from './data/passports'
import { festivals as fallbackFestivals, getFestivalById } from './data/festivals'
import { getGpsStatus } from './lib/gps'
import { getStats, getAchievements } from './lib/stats'
import Stamp from './components/Stamp'
import StampModal from './components/StampModal'
import {
  loadCollectedIds,
  loadCollectedIdsByUserId,
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
  leaveFamily,
  loadPrimaryFamilyByOwner,
} from './services/crewService'
import {
  loadGpsDrops,
  findNearbyGpsDrops,
  createGpsDrop,
} from './services/gpsDropService'
import {
  loadProfile,
  loadPublicProfile,
  saveProfile,
  getProfileDisplayName,
} from './services/profileService'

import {
  loadFestivalRecords,
  createFestivalRecord,
} from './services/festivalService'

const APP_URL = 'https://edm-passport-v2.vercel.app'
const ADMIN_EMAIL = 'fdruth@gmail.com'

function getActiveStamp(id) {
  return stamps.find((stamp) => stamp.id === id) || stamps[0]
}

export default function App() {
  const [user, setUser] = useState(null)
  const [country, setCountry] = useState(localStorage.getItem('edm-country') || '')
  const [raveName, setRaveName] = useState(localStorage.getItem('edm-rave-name') || '')
  const [profile, setProfile] = useState(null)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [publicProfileId, setPublicProfileId] = useState('')
  const [publicProfile, setPublicProfile] = useState(null)
  const [publicProfileCollectedIds, setPublicProfileCollectedIds] = useState(['world-party-parade'])
  const [publicProfileLoading, setPublicProfileLoading] = useState(false)
  const [publicProfileMessage, setPublicProfileMessage] = useState('')
  const [publicOwnerFamily, setPublicOwnerFamily] = useState(null)
  const [publicSmartMessage, setPublicSmartMessage] = useState('')
  const [publicJoinLoading, setPublicJoinLoading] = useState(false)
  const [selectedFestivalId, setSelectedFestivalId] = useState(localStorage.getItem('edm-selected-festival') || '')
  const [adminFestivalId, setAdminFestivalId] = useState(localStorage.getItem('edm-admin-festival') || localStorage.getItem('edm-selected-festival') || 'edc-las-vegas-2026')
  const [managedFestivals, setManagedFestivals] = useState(fallbackFestivals)
  const [festivalName, setFestivalName] = useState('')
  const [festivalLocation, setFestivalLocation] = useState('')
  const [festivalStatus, setFestivalStatus] = useState('upcoming')
  const [festivalStartDate, setFestivalStartDate] = useState('')
  const [festivalEndDate, setFestivalEndDate] = useState('')
  const [festivalBannerUrl, setFestivalBannerUrl] = useState('')
  const [festivalMapUrl, setFestivalMapUrl] = useState('')
  const [festivalAdminMessage, setFestivalAdminMessage] = useState('')
  const [activeId, setActiveId] = useState('world-party-parade')
  const [bookOpen, setBookOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedStamp, setSelectedStamp] = useState(null)
  const [unlockCelebration, setUnlockCelebration] = useState(null)

  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  const [collectedIds, setCollectedIds] = useState(['world-party-parade'])
  const [activeDrops, setActiveDrops] = useState(['world-party-parade'])
  const [activeDropWindows, setActiveDropWindows] = useState({})
  const [gpsDrops, setGpsDrops] = useState([])
  const [nearbyGpsDrops, setNearbyGpsDrops] = useState([])

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
  const [pendingFamilyInviteCode, setPendingFamilyInviteCode] = useState(localStorage.getItem('edm-pending-family-invite') || '')
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
  const [gpsTitle, setGpsTitle] = useState('')
  const [gpsLatitude, setGpsLatitude] = useState('')
  const [gpsLongitude, setGpsLongitude] = useState('')
  const [gpsRadiusFeet, setGpsRadiusFeet] = useState('300')
  const [gpsAdminMessage, setGpsAdminMessage] = useState('')
  const [autoCollectEnabled, setAutoCollectEnabled] = useState(
    localStorage.getItem('edm-auto-collect') === 'true'
  )
  const [autoCollectMessage, setAutoCollectMessage] = useState('')
  const autoCollectWatchId = useRef(null)
  const collectedIdsRef = useRef(collectedIds)
  const gpsDropsRef = useRef(gpsDrops)
  const autoCollectLastCheckRef = useRef(0)

  const isAdmin = user?.email === ADMIN_EMAIL
  const maxPage = isAdmin ? 11 : 10
  const activeStamp = useMemo(() => getActiveStamp(activeId), [activeId])
  const gpsStatus = useMemo(() => getGpsStatus(activeId, location), [activeId, location])
  const collectedStamps = stamps.filter((stamp) => collectedIds.includes(stamp.id))
  const stats = getStats(collectedStamps, stamps.length)
  const achievements = getAchievements(collectedStamps)
  const activeFamily = families.find((family) => family.id === activeFamilyId) || families[0] || null
  const activeFamilyUrl = activeFamily?.code ? `${APP_URL}?joincrew=${encodeURIComponent(activeFamily.code)}` : ''
  const displayName = getProfileDisplayName(profile, user, raveName)
  const activeFestival = selectedFestivalId
    ? managedFestivals.find((festival) => festival.id === selectedFestivalId) || getFestivalById(selectedFestivalId)
    : null
  const activeFestivalId = activeFestival?.id || selectedFestivalId || 'edc-las-vegas-2026'
  const adminFestival = managedFestivals.find((festival) => festival.id === adminFestivalId) || getFestivalById(adminFestivalId)
  const adminDropFestivalId = adminFestival?.id || adminFestivalId || activeFestivalId
  const upcomingFestivals = managedFestivals.filter((festival) => festival.status === 'upcoming')
  const attendedFestivals = managedFestivals.filter((festival) => festival.status === 'attended')

  function openUnlockCelebration(stamp, method = 'festival-claim') {
    if (!stamp) return

    const dropWindow = activeDropWindows[stamp.id] || {}
    const rarity = dropWindow.isLegendary
      ? 'LEGENDARY'
      : dropWindow.isSecret
        ? 'SECRET'
        : (stamp.rarity || 'FESTIVAL').toUpperCase()

    const xp = stamp.xp || (dropWindow.isLegendary ? 1000 : dropWindow.isSecret ? 750 : 500)

    setUnlockCelebration({
      stamp,
      method,
      rarity,
      xp,
      isSecret: Boolean(dropWindow.isSecret),
      isLegendary: Boolean(dropWindow.isLegendary),
      claimedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    })
  }

  useEffect(() => {
    localStorage.setItem('edm-country', country)
  }, [country])

  useEffect(() => {
    localStorage.setItem('edm-rave-name', raveName)
  }, [raveName])

  useEffect(() => {
    localStorage.setItem('edm-selected-festival', selectedFestivalId)
  }, [selectedFestivalId])

  useEffect(() => {
    localStorage.setItem('edm-admin-festival', adminFestivalId)
  }, [adminFestivalId])

  useEffect(() => {
    localStorage.setItem('edm-auto-collect', autoCollectEnabled ? 'true' : 'false')
  }, [autoCollectEnabled])

  useEffect(() => {
    collectedIdsRef.current = collectedIds
  }, [collectedIds])

  useEffect(() => {
    gpsDropsRef.current = gpsDrops
  }, [gpsDrops])

  useEffect(() => {
    refreshLiveDrops()
    refreshPublicFamilies()
    refreshGpsDrops()
    refreshFestivalRecords()

    const params = new URLSearchParams(window.location.search)
    const claimId = params.get('claim')
    const joinCrewCode = params.get('joincrew')
    const passportProfileId = params.get('passport') || params.get('profile')

    if (passportProfileId) {
      setPublicProfileId(passportProfileId)
      loadPublicPassportProfile(passportProfileId)
    }

    if (claimId && stamps.some((stamp) => stamp.id === claimId)) {
      setActiveId(claimId)
      setBookOpen(true)
      setPageIndex(2)
      setClaimMessage('QR/NFC claim detected.')
    }

    if (joinCrewCode) {
      const cleanInviteCode = joinCrewCode.toUpperCase()
      setJoinCode(cleanInviteCode)
      setPendingFamilyInviteCode(cleanInviteCode)
      localStorage.setItem('edm-pending-family-invite', cleanInviteCode)
      setBookOpen(true)
      setPageIndex(5)
      setFamilyMessage('Family invite detected. Login and EDM Passport will join it automatically.')
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



  useEffect(() => {
    if (!pendingFamilyInviteCode) return

    setJoinCode(pendingFamilyInviteCode)
    setBookOpen(true)
    setPageIndex(5)

    if (user) {
      setFamilyMessage('Family code loaded. Tap JOIN FAMILY to join.')
    } else {
      setFamilyMessage('Family code loaded. Login first, then tap JOIN FAMILY.')
    }
  }, [user, pendingFamilyInviteCode])

  useEffect(() => {
    if (!bookOpen || !autoCollectEnabled) {
      if (autoCollectWatchId.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(autoCollectWatchId.current)
        autoCollectWatchId.current = null
      }

      return
    }

    if (!navigator.geolocation) {
      setAutoCollectMessage('Auto collect needs GPS support on this device.')
      return
    }

    autoCollectLastCheckRef.current = 0
    setAutoCollectMessage('Auto collect is watching for nearby GPS drops.')

    autoCollectWatchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now()

        if (now - autoCollectLastCheckRef.current < 30000) {
          return
        }

        autoCollectLastCheckRef.current = now

        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        await collectNearbyGpsDropsAtLocation(currentLocation, {
          method: 'gps-auto-collect',
          showNoDrops: false,
          showClaimMessage: false,
          updateNearby: false,
          updateLocation: false,
          source: 'auto',
        })
      },
      () => {
        setAutoCollectMessage('Auto collect is on. Waiting for GPS signal...')
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    )

    return () => {
      if (autoCollectWatchId.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(autoCollectWatchId.current)
        autoCollectWatchId.current = null
      }
    }
  }, [bookOpen, autoCollectEnabled, user])

  async function loadPublicPassportProfile(profileId) {
    if (!profileId) return

    try {
      setPublicProfileLoading(true)
      setPublicProfileMessage('Loading EDM Passport profile...')

      const foundProfile = await loadPublicProfile(profileId)

      if (!foundProfile) {
        setPublicProfile(null)
        setPublicOwnerFamily(null)
        setPublicProfileCollectedIds(['world-party-parade'])
        setPublicProfileMessage('This EDM Passport profile was not found yet.')
        return
      }

      setPublicProfile(foundProfile)
      setPublicOwnerFamily(await loadPrimaryFamilyByOwner(profileId))
      setPublicProfileCollectedIds(await loadCollectedIdsByUserId(profileId))
      setPublicProfileMessage('')
      setPublicSmartMessage('')
    } catch (error) {
      setPublicProfile(null)
      setPublicOwnerFamily(null)
      setPublicProfileMessage(error.message || 'Could not load this EDM Passport profile.')
    } finally {
      setPublicProfileLoading(false)
    }
  }

  function closePublicProfile() {
    const cleanUrl = window.location.origin + window.location.pathname
    window.history.replaceState({}, '', cleanUrl)
    setPublicProfileId('')
    setPublicProfile(null)
    setPublicOwnerFamily(null)
    setPublicProfileMessage('')
    setPublicSmartMessage('')
  }

  function createPassportFromScannedQr() {
    const scannedName = publicProfile?.rave_name || 'this passport holder'
    closePublicProfile()
    setBookOpen(false)
    setProfileMessage(`Create your EDM Passport to connect with ${scannedName}.`)
  }

  function openOwnPassportFromQr() {
    closePublicProfile()
    setBookOpen(true)
    setPageIndex(0)
  }

  async function handleJoinPublicProfileFamily() {
    if (!user) {
      setPublicSmartMessage('Login first to join this passport family.')
      return
    }

    if (!profile?.rave_name || !profile?.country) {
      setPublicSmartMessage('Create and save your EDM Passport first, then scan again to join this family.')
      return
    }

    if (user.id === publicProfileId) {
      openOwnPassportFromQr()
      return
    }

    if (!publicOwnerFamily?.code) {
      setPublicSmartMessage(`${publicProfile?.rave_name || 'This passport holder'} has not created a family yet.`)
      return
    }

    try {
      setPublicJoinLoading(true)
      setPublicSmartMessage(`Joining ${publicOwnerFamily.name}...`)
      await joinFamily(user, publicOwnerFamily.code)
      await refreshUserData(user)
      setPublicSmartMessage(`Joined ${publicOwnerFamily.name}.`)
    } catch (error) {
      setPublicSmartMessage(error.message || 'Could not join this family.')
    } finally {
      setPublicJoinLoading(false)
    }
  }

  async function refreshUserData(currentUser = user) {
    if (!currentUser) return

    setCollectedIds(await loadCollectedIds(currentUser))
    setMemories(await loadMemories(currentUser))

    const savedProfile = await loadProfile(currentUser)
    if (savedProfile) {
      setProfile(savedProfile)
      if (savedProfile.rave_name) setRaveName(savedProfile.rave_name)
      if (savedProfile.country) setCountry(savedProfile.country)
    }

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

  async function refreshGpsDrops(festivalId = adminDropFestivalId) {
    setGpsDrops(await loadGpsDrops(festivalId || 'edc-las-vegas-2026'))
  }

  async function refreshFestivalRecords() {
    const records = await loadFestivalRecords()
    const nextFestivals = records.length ? records : fallbackFestivals
    setManagedFestivals(nextFestivals)

    if (!adminFestivalId && nextFestivals[0]?.id) {
      setAdminFestivalId(nextFestivals[0].id)
    }
  }

  async function handleCreateFestival() {
    if (!isAdmin) {
      setFestivalAdminMessage('Admin access required.')
      return
    }

    if (!festivalName.trim()) {
      setFestivalAdminMessage('Festival name required.')
      return
    }

    try {
      setFestivalAdminMessage('Creating festival...')

      await createFestivalRecord({
        name: festivalName,
        location: festivalLocation,
        status: festivalStatus,
        startDate: festivalStartDate,
        endDate: festivalEndDate,
        bannerUrl: festivalBannerUrl,
        mapUrl: festivalMapUrl,
      })

      await refreshFestivalRecords()

      setFestivalName('')
      setFestivalLocation('')
      setFestivalStatus('upcoming')
      setFestivalStartDate('')
      setFestivalEndDate('')
      setFestivalBannerUrl('')
      setFestivalMapUrl('')
      setFestivalAdminMessage('Festival created and added to the directory.')
    } catch (error) {
      setFestivalAdminMessage(error.message || 'Festival creation failed.')
    }
  }

  async function collectNearbyGpsDropsAtLocation(currentLocation, options = {}) {
    if (options.updateLocation !== false) {
      setLocation(currentLocation)
    }

    const cachedDrops = gpsDropsRef.current.length ? gpsDropsRef.current : gpsDrops
    const latestDrops = cachedDrops.length ? cachedDrops : await loadGpsDrops()

    if (!gpsDropsRef.current.length) {
      gpsDropsRef.current = latestDrops
      setGpsDrops(latestDrops)
    }

    const nearby = findNearbyGpsDrops(currentLocation, latestDrops)

    if (options.updateNearby !== false) {
      setNearbyGpsDrops(nearby)
    }

    if (!nearby.length) {
      if (options.showNoDrops) {
        setClaimMessage('No GPS drops found near you yet.')
      }

      return []
    }

    const unlockedIds = Array.from(new Set(nearby.map((drop) => drop.stamp_id)))
    const currentCollectedIds = collectedIdsRef.current
    const newUnlockedIds = unlockedIds.filter((stampId) => !currentCollectedIds.includes(stampId))

    if (!newUnlockedIds.length && options.source === 'auto') {
      return nearby
    }

    const unlockedNames = (newUnlockedIds.length ? newUnlockedIds : unlockedIds)
      .map((stampId) => stamps.find((stamp) => stamp.id === stampId)?.name || stampId)
      .join(', ')

    if (newUnlockedIds.length) {
      setActiveId(newUnlockedIds[0])
      setCollectedIds((current) => {
        const updated = Array.from(new Set([...current, ...newUnlockedIds, 'world-party-parade']))
        collectedIdsRef.current = updated
        return updated
      })

      if (user) {
        await Promise.all(
          newUnlockedIds.map((stampId) => saveStamp(user, stampId, options.method || 'gps-pin-drop'))
        )
      }

      const firstUnlockedStamp = stamps.find((stamp) => stamp.id === newUnlockedIds[0])
      if (firstUnlockedStamp) {
        openUnlockCelebration(firstUnlockedStamp, options.method || 'gps-pin-drop')
      }
    }

    const message = newUnlockedIds.length
      ? `GPS drop unlocked: ${unlockedNames}`
      : `Already collected nearby: ${unlockedNames}`

    if (options.source === 'auto' && newUnlockedIds.length) {
      setAutoCollectMessage(message)
    }

    if (options.showClaimMessage !== false) {
      setClaimMessage(message)
    }

    return nearby
  }

  async function handleCheckNearbyGpsDrops() {
    setLocationError('')
    setLocationLoading(true)
    setClaimMessage('Checking nearby GPS drops...')

    if (!navigator.geolocation) {
      setLocationError('GPS is not available on this device.')
      setClaimMessage('')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        setLocation(currentLocation)

        await collectNearbyGpsDropsAtLocation(currentLocation, {
          method: 'gps-pin-drop',
          showNoDrops: true,
          showClaimMessage: true,
          source: 'manual',
        })

        setLocationLoading(false)
      },
      () => {
        setLocationError('Could not get location for GPS drops.')
        setClaimMessage('')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    )
  }

  async function handleSaveRaveProfile() {
    if (!user) {
      setProfileMessage('Login first to save your rave name.')
      return
    }

    if (!raveName.trim()) {
      setProfileMessage('Choose your rave name first.')
      return
    }

    if (!country) {
      setProfileMessage('Choose your passport country first.')
      return
    }

    try {
      setProfileSaving(true)
      setProfileMessage('Saving rave profile...')
      const savedProfile = await saveProfile(user, {
        raveName,
        country,
      })
      setProfile(savedProfile)
      setProfileMessage('Rave profile saved.')
    } catch (error) {
      setProfileMessage(error.message || 'Rave profile save failed.')
    } finally {
      setProfileSaving(false)
    }
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

    const wasAlreadyCollected = collectedIdsRef.current.includes(activeStamp.id)

    setCollectedIds((current) => {
      const updated = Array.from(new Set([...current, activeStamp.id, 'world-party-parade']))
      collectedIdsRef.current = updated
      return updated
    })

    if (user) await saveStamp(user, activeStamp.id, method)

    setClaimMessage(`${activeStamp.name} collected and saved.`)

    if (!wasAlreadyCollected) {
      openUnlockCelebration(activeStamp, method)
    }
  }


  async function clearPendingFamilyInvite() {
    setPendingFamilyInviteCode('')
    localStorage.removeItem('edm-pending-family-invite')

    const cleanUrl = window.location.origin + window.location.pathname
    window.history.replaceState({}, '', cleanUrl)
  }

  async function autoJoinPendingFamilyInvite(currentUser, inviteCode) {
    if (!currentUser || !inviteCode) return

    try {
      setFamilyMessage(`Joining family ${inviteCode}...`)
      await joinFamily(currentUser, inviteCode)
      await clearPendingFamilyInvite()
      setJoinCode('')
      await refreshUserData(currentUser)
      await refreshPublicFamilies()
      setFamilyMessage('Family invite accepted. You joined the family.')
    } catch (error) {
      await clearPendingFamilyInvite()
      setFamilyMessage(error.message || 'Could not join this family invite.')
    }
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
      if (pendingFamilyInviteCode && code.toUpperCase() === pendingFamilyInviteCode) {
        await clearPendingFamilyInvite()
      }
      await refreshUserData(user)
      await refreshPublicFamilies()
      setFamilyMessage('Family joined.')
    } catch (error) {
      setFamilyMessage(error.message)
    }
  }

  async function handleLeaveFamily(familyId) {
    if (!user) {
      setFamilyMessage('Login first to leave a family.')
      return
    }

    if (!familyId) {
      setFamilyMessage('Select a family first.')
      return
    }

    try {
      setFamilyMessage('Leaving family...')
      await leaveFamily(user, familyId)
      setActiveFamilyId('')
      await refreshUserData(user)
      await refreshPublicFamilies()
      setFamilyMessage('Family left.')
    } catch (error) {
      setFamilyMessage(error.message || 'Could not leave family.')
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

  function getPassportShareUrl() {
    return `${APP_URL}?passport=${encodeURIComponent(user?.id || 'create')}`
  }

  function getQrImageUrl() {
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(getPassportShareUrl())}`
  }

  function loadCanvasImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = src
    })
  }

  function getExportSettings(exportType) {
    const settings = {
      wallet: {
        fileName: 'edm-passport-wallet-card.png',
        title: 'EDM PASSPORT WALLET CARD',
        width: 1013,
        height: 638,
        qrSize: 74,
      },
      badge: {
        fileName: 'edm-passport-festival-badge.png',
        title: 'EDM FESTIVAL BADGE',
        width: 1200,
        height: 1800,
        qrSize: 120,
      },
      lanyard: {
        fileName: 'edm-passport-lanyard-insert.png',
        title: 'EDM PASSPORT LANYARD',
        width: 900,
        height: 1200,
        qrSize: 100,
      },
      lockscreen: {
        fileName: 'edm-passport-lock-screen.png',
        title: 'EDM PASSPORT LOCK SCREEN',
        width: 1170,
        height: 2532,
        qrSize: 130,
      },
    }

    return settings[exportType] || settings.wallet
  }

  async function createPassportExportCanvas(exportType) {
    const settings = getExportSettings(exportType)
    const canvas = document.createElement('canvas')
    canvas.width = settings.width
    canvas.height = settings.height
    const context = canvas.getContext('2d')

    const gradient = context.createLinearGradient(0, 0, settings.width, settings.height)
    gradient.addColorStop(0, '#050510')
    gradient.addColorStop(0.45, '#241045')
    gradient.addColorStop(1, '#050510')
    context.fillStyle = gradient
    context.fillRect(0, 0, settings.width, settings.height)

    context.strokeStyle = '#facc15'
    context.lineWidth = Math.max(8, settings.width * 0.01)
    context.strokeRect(30, 30, settings.width - 60, settings.height - 60)

    context.fillStyle = '#facc15'
    context.font = `900 ${Math.round(settings.width * 0.045)}px Arial`
    context.textAlign = 'center'
    context.fillText(settings.title, settings.width / 2, settings.height * 0.09)

    const passportSrc = getPassportImage(country)
    const coverWidth = settings.width * (exportType === 'wallet' ? 0.32 : 0.46)
    const coverHeight = coverWidth * 1.35
    const coverX = settings.width / 2 - coverWidth / 2
    const coverY = settings.height * (exportType === 'lockscreen' ? 0.14 : 0.13)

    try {
      const passportImage = await loadCanvasImage(passportSrc)
      context.drawImage(passportImage, coverX, coverY, coverWidth, coverHeight)
    } catch {
      context.fillStyle = 'rgba(255,255,255,.12)'
      context.fillRect(coverX, coverY, coverWidth, coverHeight)
    }

    const qrSize = Math.round(settings.qrSize)
    const qrX = coverX + coverWidth - qrSize - 10
    const qrY = coverY + coverHeight - qrSize - 10

    context.fillStyle = '#ffffff'
    context.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16)

    try {
      const qrImage = await loadCanvasImage(getQrImageUrl())
      context.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
    } catch {
      context.fillStyle = '#000000'
      context.font = `900 ${Math.round(qrSize * 0.18)}px Arial`
      context.fillText('QR', qrX + qrSize / 2, qrY + qrSize / 2)
    }

    context.fillStyle = '#ffffff'
    context.font = `900 ${Math.round(settings.width * 0.07)}px Arial`
    context.fillText(displayName || 'Rave Name', settings.width / 2, settings.height * (exportType === 'wallet' ? 0.52 : 0.49))

    context.fillStyle = '#67e8f9'
    context.font = `800 ${Math.round(settings.width * 0.035)}px Arial`
    context.fillText(country || 'Passport Country', settings.width / 2, settings.height * (exportType === 'wallet' ? 0.59 : 0.55))

    context.fillStyle = '#ffffff'
    context.font = `800 ${Math.round(settings.width * 0.03)}px Arial`
    context.fillText(activeFestival?.name || 'EDM Passport', settings.width / 2, settings.height * (exportType === 'wallet' ? 0.66 : 0.60))
    context.fillText(`${stats.level} • ${stats.totalXp} XP`, settings.width / 2, settings.height * (exportType === 'wallet' ? 0.72 : 0.65))

    context.fillStyle = '#facc15'
    context.font = `800 ${Math.round(settings.width * 0.024)}px Arial`
    context.fillText('Scan QR to open EDM Passport profile', settings.width / 2, settings.height - 70)

    return canvas
  }

  async function downloadPassportExport(exportType) {
    try {
      const canvas = await createPassportExportCanvas(exportType)
      const link = document.createElement('a')
      link.download = getExportSettings(exportType).fileName
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      setProfileMessage(error.message || 'Could not create export image.')
    }
  }

  async function printPassportExport(exportType) {
    try {
      const canvas = await createPassportExportCanvas(exportType)
      const imageUrl = canvas.toDataURL('image/png')
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setProfileMessage('Pop-up blocked. Allow pop-ups to print this passport export.')
        return
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>EDM Passport Print</title>
            <style>
              body { margin: 0; background: #111; display: grid; place-items: center; min-height: 100vh; }
              img { max-width: 100%; max-height: 100vh; }
              @media print {
                body { background: white; }
                img { width: 100%; height: auto; }
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" />
            <script>window.onload = () => window.print()</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    } catch (error) {
      setProfileMessage(error.message || 'Could not print export.')
    }
  }


  async function handleCreateGpsDrop() {
    if (!isAdmin) {
      setGpsAdminMessage('Admin access required.')
      return
    }

    if (!adminStampId) {
      setGpsAdminMessage('Select a stamp first.')
      return
    }

    if (!gpsLatitude || !gpsLongitude) {
      setGpsAdminMessage('Latitude and longitude are required.')
      return
    }

    try {
      setGpsAdminMessage('Creating GPS drop...')

      await createGpsDrop({
        stampId: adminStampId,
        festivalId: adminDropFestivalId,
        latitude: gpsLatitude,
        longitude: gpsLongitude,
        radiusFeet: gpsRadiusFeet || 300,
        title: gpsTitle,
      })

      await refreshGpsDrops(adminDropFestivalId)

      setGpsTitle('')
      setGpsLatitude('')
      setGpsLongitude('')
      setGpsRadiusFeet('300')
      setGpsAdminMessage('GPS drop created and activated.')
    } catch (error) {
      setGpsAdminMessage(error.message || 'GPS drop creation failed.')
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

  function selectFestival(festivalId) {
    setSelectedFestivalId(festivalId)
    setAdminFestivalId(festivalId)
    refreshGpsDrops(festivalId)
    setPageIndex(1)
  }

  function backToFestivals() {
    setSelectedFestivalId('')
    setPageIndex(0)
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

  if (publicProfileId) {
    if (publicProfileLoading) {
      return (
        <main style={styles.screen}>
          <section style={styles.card}>
            <h1 style={styles.title}>EDM Passport</h1>
            <p style={styles.successText}>Loading public passport profile...</p>
          </section>
        </main>
      )
    }

    if (!publicProfile) {
      return (
        <main style={styles.screen}>
          <section style={styles.card}>
            <img src="/edm-passport-logo.png" alt="EDM Passport" style={styles.logo} />
            <h1 style={styles.title}>Create Your EDM Passport</h1>
            <p style={styles.tag}>Profile Not Found Yet</p>
            <p style={styles.bookText}>
              This QR code opens an EDM Passport profile. If you do not have one yet, create your passport now.
            </p>
            {publicProfileMessage && <p style={styles.successText}>{publicProfileMessage}</p>}
            <button style={styles.mainButton} onClick={createPassportFromScannedQr}>
              CREATE YOUR EDM PASSPORT
            </button>
          </section>
        </main>
      )
    }

    return (
      <PublicProfile
        user={{ id: publicProfile.id }}
        displayName={publicProfile.rave_name || 'Passport Holder'}
        country={publicProfile.country || country}
        collectedIds={publicProfileCollectedIds}
        crew={publicOwnerFamily}
        scannerUser={user}
        scannerProfile={profile}
        ownerFamily={publicOwnerFamily}
        smartMessage={publicSmartMessage}
        joinLoading={publicJoinLoading}
        onCreatePassport={createPassportFromScannedQr}
        onJoinFamily={handleJoinPublicProfileFamily}
        onOpenOwnPassport={openOwnPassportFromQr}
      />
    )
  }

  return (
    <main style={styles.screen}>
      <section style={styles.card}>
        {!bookOpen ? (
          <>
            <img src="/edm-passport-logo.png" alt="EDM Passport" style={styles.logo} />
            <h1 style={styles.title}>EDM Passport</h1>
            <p style={styles.tag}>CREATE YOUR FESTIVAL IDENTITY</p>

            <button
              style={styles.passportButton}
              onClick={() => {
                if (!user) {
                  setProfileMessage('Login first to open your passport.')
                  return
                }

                if (!country) {
                  setProfileMessage('Choose your passport country first.')
                  return
                }

                if (!raveName.trim()) {
                  setProfileMessage('Choose your rave name first.')
                  return
                }

                setBookOpen(true)
                setPageIndex(0)
              }}
            >
              {country ? (
                <img src={getPassportImage(country)} alt={country} style={styles.passportCover} />
              ) : (
                <div style={styles.emptyPassport}>Select a country to reveal your passport cover</div>
              )}
            </button>

            <label style={styles.label}>Passport Country</label>
            <select value={country} onChange={(event) => setCountry(event.target.value)} style={styles.input}>
              <option value="">Select Country</option>
              {countries.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <label style={styles.label}>Rave Name</label>
            <input
              style={styles.input}
              value={raveName}
              onChange={(event) => setRaveName(event.target.value)}
              placeholder="Choose your rave name"
            />

            {!user ? (
              <button style={styles.mainButton} onClick={signInWithGoogle}>LOGIN WITH GOOGLE</button>
            ) : (
              <div style={styles.loginBox}>
                <p>Rave Profile</p>
                <strong>{displayName}</strong>
                <button style={styles.mainButton} onClick={handleSaveRaveProfile} disabled={profileSaving}>
                  {profileSaving ? 'SAVING...' : 'SAVE RAVE PROFILE'}
                </button>
                <button style={styles.secondaryButton} onClick={signOut}>SIGN OUT</button>
              </div>
            )}

            {profileMessage && <p style={styles.successText}>{profileMessage}</p>}

            <button
              style={styles.mainButton}
              onClick={() => {
                if (!user) {
                  setProfileMessage('Login first to open your passport.')
                  return
                }

                if (!country) {
                  setProfileMessage('Choose your passport country first.')
                  return
                }

                if (!raveName.trim()) {
                  setProfileMessage('Choose your rave name first.')
                  return
                }

                setBookOpen(true)
                setPageIndex(0)
              }}
            >
              OPEN PASSPORT
            </button>
          </>        ) : (
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
                  <h2 style={styles.bookTitle}>Festival Directory</h2>
                  <p style={styles.bookText}>Choose a festival to open inside your {country} passport.</p>

                  <div style={styles.festivalHero}>
                    <h3 style={styles.festivalHeroTitle}>{displayName}</h3>
                    <p>{country} Passport</p>
                    <div style={styles.statsMiniGrid}>
                      <div style={styles.statBox}><strong>{stats.totalXp}</strong><span>XP</span></div>
                      <div style={styles.statBox}><strong>{stats.level}</strong><span>Rank</span></div>
                    </div>
                  </div>

                  <h3 style={styles.sectionTitle}>Upcoming Festivals</h3>
                  <div style={styles.festivalList}>
                    {upcomingFestivals.map((festival) => (
                      <button key={festival.id} style={styles.festivalCard} onClick={() => selectFestival(festival.id)}>
                        <strong>{festival.name}</strong>
                        <small>{festival.location}</small>
                        <span style={styles.festivalBadge}>OPEN FESTIVAL</span>
                      </button>
                    ))}
                  </div>

                  <h3 style={styles.sectionTitle}>Attended Festivals</h3>
                  <div style={styles.festivalList}>
                    {attendedFestivals.map((festival) => (
                      <button key={festival.id} style={styles.festivalCard} onClick={() => selectFestival(festival.id)}>
                        <strong>{festival.name}</strong>
                        <small>{festival.location}</small>
                        <span style={styles.festivalBadge}>VIEW MEMORIES</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {pageIndex === 1 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 2</p>
                  <h2 style={styles.bookTitle}>{activeFestival?.name || 'EDC Las Vegas 2026'}</h2>
                  <p style={styles.bookText}>{activeFestival?.location || 'Under the Electric Sky'}</p>

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

                    <div style={styles.autoCollectBox}>
                      <strong>Auto Collect</strong>
                      <p>
                        {autoCollectEnabled
                          ? 'ON — your passport is watching for nearby GPS drops.'
                          : 'OFF — turn this on to collect nearby drops automatically.'}
                      </p>

                      <button
                        style={autoCollectEnabled ? styles.dangerButton : styles.mainButton}
                        onClick={() => setAutoCollectEnabled((value) => !value)}
                      >
                        {autoCollectEnabled ? 'TURN AUTO COLLECT OFF' : 'TURN AUTO COLLECT ON'}
                      </button>

                      {autoCollectMessage && <p style={styles.successText}>{autoCollectMessage}</p>}
                    </div>

                    <button style={styles.secondaryButton} onClick={requestLocation}>
                      {locationLoading ? 'CHECKING GPS...' : 'CHECK MY LOCATION'}
                    </button>

                    <button style={styles.mainButton} onClick={handleCheckNearbyGpsDrops}>
                      CHECK NEARBY GPS DROPS
                    </button>

                    <button style={styles.mainButton} onClick={() => collectActiveStamp('qr-nfc-gps')}>COLLECT STAMP</button>

                    {locationError && <p style={styles.errorText}>{locationError}</p>}
                    {claimMessage && <p style={styles.successText}>{claimMessage}</p>}

                    {nearbyGpsDrops.length > 0 && (
                      <div style={styles.linkList}>
                        {nearbyGpsDrops.map((drop) => (
                          <div key={drop.id} style={styles.linkCard}>
                            <strong>{drop.title || drop.stamp_id}</strong>
                            <small>{Math.round(drop.distanceFeet)} feet away</small>
                            <small>Radius: {drop.radius_feet || 300} feet</small>
                          </div>
                        ))}
                      </div>
                    )}
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
                  handleLeaveFamily={handleLeaveFamily}
                  setActiveFamilyId={setActiveFamilyId}
                  familyMessage={familyMessage}
                  displayName={displayName}
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

              {pageIndex === 10 && (
                <>
                  <p style={styles.pageNumber}>Passport Page 11</p>
                  <h2 style={styles.bookTitle}>Passport Export Center</h2>
                  <p style={styles.bookText}>
                    Download, print, or save your EDM Passport identity. These exports use your rave name and country passport cover.
                  </p>

                  <div style={styles.exportGrid}>
                    <div style={styles.exportCard}>
                      <p style={styles.labelDark}>Wallet Card</p>
                      <div style={styles.exportMiniPassport}>
                        {country && <img src={getPassportImage(country)} alt={country} style={styles.exportCover} />}
                        <strong>{displayName}</strong>
                        <small>{country || 'Passport Country'}</small>
                        <small>{stats.level} • {stats.totalXp} XP</small>
                        <img src={getQrImageUrl()} alt="Passport QR Code" style={styles.qrImage} />
                      </div>
                      <small>3.375 in × 2.125 in</small>
                      <button style={styles.mainButton} onClick={() => downloadPassportExport('wallet')}>
                        DOWNLOAD WALLET PNG
                      </button>
                      <button style={styles.secondaryButton} onClick={() => printPassportExport('wallet')}>
                        PRINT WALLET CARD
                      </button>
                    </div>

                    <div style={styles.exportCard}>
                      <p style={styles.labelDark}>Festival Badge</p>
                      <div style={styles.exportBadgePreview}>
                        <strong>{displayName}</strong>
                        <small>{activeFestival?.name || 'Select Festival'}</small>
                        <img src={getQrImageUrl()} alt="Passport QR Code" style={styles.qrImage} />
                        <small>{country || 'Passport Country'}</small>
                      </div>
                      <small>4 in × 6 in</small>
                      <button style={styles.mainButton} onClick={() => downloadPassportExport('badge')}>
                        DOWNLOAD BADGE PNG
                      </button>
                      <button style={styles.secondaryButton} onClick={() => printPassportExport('badge')}>
                        PRINT FESTIVAL BADGE
                      </button>
                    </div>

                    <div style={styles.exportCard}>
                      <p style={styles.labelDark}>Lanyard Insert</p>
                      <div style={styles.exportBadgePreview}>
                        {country && <img src={getPassportImage(country)} alt={country} style={styles.exportCoverSmall} />}
                        <strong>{displayName}</strong>
                        <small>{stats.level}</small>
                        <img src={getQrImageUrl()} alt="Passport QR Code" style={styles.qrImage} />
                      </div>
                      <small>3 in × 4 in</small>
                      <button style={styles.mainButton} onClick={() => downloadPassportExport('lanyard')}>
                        DOWNLOAD LANYARD PNG
                      </button>
                      <button style={styles.secondaryButton} onClick={() => printPassportExport('lanyard')}>
                        PRINT LANYARD INSERT
                      </button>
                    </div>

                    <div style={styles.exportCard}>
                      <p style={styles.labelDark}>Phone Lock Screen</p>
                      <div style={styles.lockScreenPreview}>
                        {country && <img src={getPassportImage(country)} alt={country} style={styles.exportCoverSmall} />}
                        <strong>{displayName}</strong>
                        <small>{activeFestival?.name || 'EDM Passport'}</small>
                        <img src={getQrImageUrl()} alt="Passport QR Code" style={styles.qrImage} />
                      </div>
                      <small>1170 × 2532 px phone wallpaper</small>
                      <button style={styles.mainButton} onClick={() => downloadPassportExport('lockscreen')}>
                        DOWNLOAD LOCK SCREEN PNG
                      </button>
                    </div>
                  </div>

                  <p style={styles.successText}>Export Center ready. Use PNG for downloads, lock screens, and printing.</p>
                </>
              )}

              {pageIndex === 11 && isAdmin && (
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
                  gpsLatitude={gpsLatitude}
                  setGpsLatitude={setGpsLatitude}
                  gpsLongitude={gpsLongitude}
                  setGpsLongitude={setGpsLongitude}
                  gpsRadiusFeet={gpsRadiusFeet}
                  setGpsRadiusFeet={setGpsRadiusFeet}
                  gpsTitle={gpsTitle}
                  setGpsTitle={setGpsTitle}
                  handleCreateGpsDrop={handleCreateGpsDrop}
                  gpsAdminMessage={gpsAdminMessage}
                  gpsDrops={gpsDrops}
                  refreshGpsDrops={() => refreshGpsDrops(adminDropFestivalId)}
                  managedFestivals={managedFestivals}
                  adminFestivalId={adminFestivalId}
                  setAdminFestivalId={(festivalId) => {
                    setAdminFestivalId(festivalId)
                    refreshGpsDrops(festivalId)
                  }}
                  adminFestival={adminFestival}
                  festivalName={festivalName}
                  setFestivalName={setFestivalName}
                  festivalLocation={festivalLocation}
                  setFestivalLocation={setFestivalLocation}
                  festivalStatus={festivalStatus}
                  setFestivalStatus={setFestivalStatus}
                  festivalStartDate={festivalStartDate}
                  setFestivalStartDate={setFestivalStartDate}
                  festivalEndDate={festivalEndDate}
                  setFestivalEndDate={setFestivalEndDate}
                  festivalBannerUrl={festivalBannerUrl}
                  setFestivalBannerUrl={setFestivalBannerUrl}
                  festivalMapUrl={festivalMapUrl}
                  setFestivalMapUrl={setFestivalMapUrl}
                  handleCreateFestival={handleCreateFestival}
                  festivalAdminMessage={festivalAdminMessage}
                />
              )}
            </div>

            <div style={styles.pageControls}>
              <button style={styles.secondaryButton} onClick={previousPage} disabled={pageIndex === 0}>← Previous</button>
              <p style={styles.pageCounter}>{pageIndex + 1} / {maxPage + 1}</p>
              <button style={styles.secondaryButton} onClick={nextPage} disabled={pageIndex === maxPage}>Next →</button>
            </div>

            <button style={styles.secondaryButton} onClick={() => setBookOpen(false)}>CLOSE PASSPORT</button>
            {pageIndex !== 0 && <button style={styles.secondaryButton} onClick={backToFestivals}>← BACK TO FESTIVAL DIRECTORY</button>}
          </>
        )}
      </section>

      {unlockCelebration && (
        <div style={styles.unlockOverlay}>
          <div
            style={
              unlockCelebration.isLegendary
                ? { ...styles.unlockModal, ...styles.unlockModalLegendary }
                : unlockCelebration.isSecret
                  ? { ...styles.unlockModal, ...styles.unlockModalSecret }
                  : styles.unlockModal
            }
          >
            <div style={styles.unlockPulse}>⚡</div>
            <p style={styles.unlockEyebrow}>STAMP DISCOVERED</p>
            <h1 style={styles.unlockTitle}>{unlockCelebration.stamp.name}</h1>

            <div style={styles.unlockImageWrap}>
              <img
                src={unlockCelebration.stamp.image}
                alt={unlockCelebration.stamp.name}
                style={styles.unlockImage}
              />
            </div>

            <div style={styles.unlockBadgeRow}>
              <span
                style={
                  unlockCelebration.isLegendary
                    ? { ...styles.unlockBadge, ...styles.unlockLegendaryBadge }
                    : unlockCelebration.isSecret
                      ? { ...styles.unlockBadge, ...styles.unlockSecretBadge }
                      : styles.unlockBadge
                }
              >
                {unlockCelebration.rarity}
              </span>
              <span style={styles.unlockXp}>+{unlockCelebration.xp} XP</span>
            </div>

            <p style={styles.unlockCopy}>
              Added to your EDM Passport at {unlockCelebration.claimedAt}. Keep collecting to complete your festival story.
            </p>

            <button
              style={styles.mainButton}
              onClick={() => {
                setActiveId(unlockCelebration.stamp.id)
                setUnlockCelebration(null)
                setBookOpen(true)
                setPageIndex(1)
              }}
            >
              VIEW IN PASSPORT
            </button>

            <button style={styles.secondaryButton} onClick={() => setUnlockCelebration(null)}>
              KEEP EXPLORING
            </button>
          </div>
        </div>
      )}

      {selectedStamp && <StampModal stamp={selectedStamp} onClose={() => setSelectedStamp(null)} />}
    </main>
  )
}

const styles = {
  screen: {
    minHeight: '100vh',
    padding: 16,
    background: 'radial-gradient(circle at 12% 8%, rgba(255,45,214,.34), transparent 32%), radial-gradient(circle at 88% 12%, rgba(34,211,238,.30), transparent 34%), radial-gradient(circle at 50% 92%, rgba(124,58,237,.35), transparent 42%), linear-gradient(180deg, #030014 0%, #070018 42%, #020008 100%)',
    color: '#f8fbff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    margin: '0 auto',
    padding: 18,
    borderRadius: 30,
    background: 'linear-gradient(180deg, rgba(8,5,28,.92), rgba(16,2,35,.88))',
    border: '1px solid rgba(34,211,238,.55)',
    boxSizing: 'border-box',
    boxShadow: '0 0 34px rgba(34,211,238,.18), 0 0 70px rgba(255,45,214,.14), inset 0 0 26px rgba(255,255,255,.04)',
    backdropFilter: 'blur(10px)',
  },
  logo: { width: 126, height: 126, borderRadius: 999, objectFit: 'cover', display: 'block', margin: '0 auto 16px', border: '2px solid rgba(34,211,238,.75)', boxShadow: '0 0 30px rgba(34,211,238,.45), 0 0 55px rgba(255,45,214,.22)' },
  title: { textAlign: 'center', fontSize: 34, margin: '8px 0', fontWeight: 900, letterSpacing: '.02em', textShadow: '0 0 16px rgba(255,45,214,.65), 0 0 28px rgba(34,211,238,.35)' },
  tag: { textAlign: 'center', color: '#22d3ee', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 900, textShadow: '0 0 12px rgba(34,211,238,.9)' },
  festivalHero: { marginTop: 18, padding: 18, borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,45,214,.22), rgba(124,58,237,.24), rgba(34,211,238,.18))', border: '1px solid rgba(255,45,214,.45)', textAlign: 'center', boxShadow: '0 0 26px rgba(255,45,214,.18)' },
  festivalHeroTitle: { margin: '0 0 8px', fontSize: 26, fontWeight: 900, color: '#ffffff', textShadow: '0 0 14px rgba(34,211,238,.55)' },
  sectionTitle: { margin: '22px 0 10px', color: '#22d3ee', fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 900, textShadow: '0 0 10px rgba(34,211,238,.8)' },
  festivalList: { display: 'grid', gap: 12, marginTop: 10 },
  festivalCard: { width: '100%', padding: 15, borderRadius: 20, border: '1px solid rgba(34,211,238,.42)', background: 'linear-gradient(135deg, rgba(255,255,255,.08), rgba(34,211,238,.08), rgba(255,45,214,.06))', color: 'white', display: 'grid', gap: 6, textAlign: 'left', fontWeight: 900, boxShadow: 'inset 0 0 18px rgba(255,255,255,.03), 0 0 18px rgba(34,211,238,.10)' },
  festivalBadge: { justifySelf: 'start', marginTop: 4, padding: '6px 10px', borderRadius: 999, background: 'linear-gradient(90deg, #ff2dd6, #8b5cf6, #22d3ee)', color: '#030014', fontSize: 10, fontWeight: 900, letterSpacing: '.08em', boxShadow: '0 0 18px rgba(255,45,214,.35)' },
  passportButton: { width: '100%', marginTop: 18, padding: 0, border: 0, borderRadius: 28, background: 'transparent', filter: 'drop-shadow(0 0 22px rgba(34,211,238,.28))' },
  passportCover: { width: '100%', maxHeight: 440, objectFit: 'cover', borderRadius: 26, border: '1px solid rgba(34,211,238,.65)', boxShadow: '0 0 34px rgba(34,211,238,.25), 0 0 55px rgba(255,45,214,.15)' },
  emptyPassport: { padding: 60, borderRadius: 24, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontWeight: 900, border: '1px dashed rgba(34,211,238,.45)' },
  label: { display: 'block', marginTop: 18, color: '#22d3ee', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 900 },
  input: { width: '100%', marginTop: 8, padding: 14, borderRadius: 16, border: '1px solid rgba(34,211,238,.36)', background: 'rgba(3,0,20,.78)', color: 'white', boxSizing: 'border-box', outline: 'none', boxShadow: 'inset 0 0 18px rgba(34,211,238,.08)' },
  inputLight: { width: '100%', marginTop: 12, padding: 14, borderRadius: 16, border: '1px solid rgba(34,211,238,.48)', background: 'rgba(3,0,20,.82)', color: '#f8fbff', boxSizing: 'border-box', fontWeight: 900, outline: 'none', boxShadow: 'inset 0 0 16px rgba(34,211,238,.10), 0 0 12px rgba(34,211,238,.10)' },
  uploadButton: { width: '100%', marginTop: 12, padding: 18, borderRadius: 18, border: '1px solid rgba(34,211,238,.55)', background: 'linear-gradient(90deg, #ff2dd6, #7c3aed, #22d3ee)', color: '#050510', boxSizing: 'border-box', fontWeight: 900, display: 'block', textAlign: 'center', fontSize: 15, boxShadow: '0 0 22px rgba(34,211,238,.22)' },
  mainButton: { width: '100%', marginTop: 16, padding: 15, borderRadius: 18, border: '1px solid rgba(255,255,255,.16)', fontWeight: 900, background: 'linear-gradient(90deg, #ff2dd6 0%, #8b5cf6 48%, #22d3ee 100%)', color: '#030014', boxShadow: '0 0 22px rgba(255,45,214,.28), 0 0 28px rgba(34,211,238,.18)', letterSpacing: '.04em' },
  secondaryButton: { width: '100%', marginTop: 12, padding: 13, borderRadius: 16, border: '1px solid rgba(34,211,238,.55)', background: 'linear-gradient(135deg, rgba(34,211,238,.18), rgba(124,58,237,.18), rgba(255,45,214,.12))', color: '#f8fbff', fontWeight: 900, boxShadow: '0 0 18px rgba(34,211,238,.14)', letterSpacing: '.03em' },
  dangerButton: { width: '100%', marginTop: 12, padding: 13, borderRadius: 16, border: '1px solid rgba(251,113,133,.35)', background: 'linear-gradient(90deg, #fb7185, #f97316)', color: '#12020a', fontWeight: 900, boxShadow: '0 0 18px rgba(251,113,133,.2)' },
  loginBox: { marginTop: 16, padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(34,211,238,.28)' },
  bookPage: { minHeight: '70vh', padding: 18, borderRadius: 26, background: 'radial-gradient(circle at top left, rgba(255,45,214,.20), transparent 38%), radial-gradient(circle at bottom right, rgba(34,211,238,.18), transparent 38%), linear-gradient(180deg, rgba(10,5,35,.96), rgba(5,0,20,.96))', color: '#f8fbff', boxSizing: 'border-box', touchAction: 'pan-y', border: '1px solid rgba(34,211,238,.55)', boxShadow: '0 0 38px rgba(34,211,238,.18), inset 0 0 30px rgba(255,255,255,.035)' },
  pageNumber: { color: '#22d3ee', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 900, textShadow: '0 0 10px rgba(34,211,238,.9)' },
  bookTitle: { fontSize: 30, margin: '8px 0', fontWeight: 900, color: '#ffffff', textShadow: '0 0 16px rgba(255,45,214,.65), 0 0 22px rgba(34,211,238,.32)' },
  bookText: { color: '#c7f9ff', fontWeight: 800, lineHeight: 1.45 },
  claimBox: { marginTop: 16, padding: 16, borderRadius: 20, background: 'linear-gradient(135deg, rgba(34,211,238,.13), rgba(255,45,214,.12))', border: '1px solid rgba(34,211,238,.38)', textAlign: 'center', boxShadow: '0 0 20px rgba(34,211,238,.12)' },
  autoCollectBox: { marginTop: 16, padding: 14, borderRadius: 18, background: 'linear-gradient(135deg, rgba(255,45,214,.18), rgba(34,211,238,.16))', border: '1px solid rgba(34,211,238,.35)', display: 'grid', gap: 8 },
  labelDark: { marginTop: 14, color: '#22d3ee', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 900, display: 'block', textShadow: '0 0 8px rgba(34,211,238,.75)' },
  checkboxRow: { marginTop: 12, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(34,211,238,.22)', display: 'flex', gap: 10, alignItems: 'center', fontWeight: 900 },
  stampGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 18 },
  stampButton: { border: '1px solid rgba(34,211,238,.34)', background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(34,211,238,.07), rgba(255,45,214,.06))', color: '#f8fbff', borderRadius: 18, padding: 10, display: 'grid', justifyItems: 'center', gap: 8, fontWeight: 900, boxShadow: '0 0 18px rgba(34,211,238,.12), inset 0 0 18px rgba(255,255,255,.025)' },
  pageControls: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginTop: 12 },
  pageCounter: { margin: 0, color: '#22d3ee', fontSize: 12, fontWeight: 900, textShadow: '0 0 9px rgba(34,211,238,.8)' },
  successBox: { marginTop: 14, padding: 12, borderRadius: 14, background: 'rgba(34,197,94,.16)', border: '1px solid rgba(34,197,94,.42)', color: '#dcfce7' },
  warningBox: { marginTop: 14, padding: 12, borderRadius: 14, background: 'rgba(251,146,60,.15)', border: '1px solid rgba(251,146,60,.4)', color: '#ffedd5' },
  errorText: { marginTop: 12, padding: 10, borderRadius: 12, background: 'rgba(127,29,29,.50)', color: '#fecaca', fontWeight: 900, border: '1px solid rgba(248,113,113,.34)' },
  successText: { marginTop: 12, padding: 10, borderRadius: 12, background: 'rgba(22,101,52,.30)', color: '#bbf7d0', fontWeight: 900, border: '1px solid rgba(34,197,94,.34)' },
  linkList: { display: 'grid', gap: 12, marginTop: 16 },
  linkCard: { padding: 13, borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,255,255,.08), rgba(34,211,238,.07))', border: '1px solid rgba(34,211,238,.30)', color: '#f8fbff', display: 'grid', gap: 6, overflowWrap: 'anywhere', fontSize: 11, boxShadow: '0 0 16px rgba(34,211,238,.10)' },
  adminCard: { padding: 13, borderRadius: 16, background: 'linear-gradient(135deg, rgba(34,211,238,.10), rgba(124,58,237,.10), rgba(255,45,214,.08))', border: '1px solid rgba(34,211,238,.34)', color: '#f8fbff', display: 'grid', gap: 8, overflowWrap: 'anywhere', fontSize: 11, boxShadow: '0 0 18px rgba(34,211,238,.12)' },
  crewHero: { marginTop: 16, padding: 18, borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,45,214,.24), rgba(124,58,237,.20), rgba(34,211,238,.20))', textAlign: 'center', border: '1px solid rgba(34,211,238,.42)', boxShadow: '0 0 24px rgba(255,45,214,.16)' },
  familyCard: { padding: 13, borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,255,255,.08), rgba(34,211,238,.06))', display: 'grid', gap: 4, textAlign: 'left', border: '1px solid rgba(34,211,238,.30)', color: '#f8fbff', fontWeight: 900 },
  familyActive: { padding: 13, borderRadius: 16, background: 'linear-gradient(90deg, rgba(255,45,214,.32), rgba(34,211,238,.26))', display: 'grid', gap: 4, textAlign: 'left', border: '2px solid rgba(34,211,238,.58)', color: '#f8fbff', fontWeight: 900, boxShadow: '0 0 20px rgba(34,211,238,.18)' },
  rankCard: { marginTop: 16, padding: 18, borderRadius: 22, background: 'linear-gradient(135deg, rgba(255,45,214,.18), rgba(34,211,238,.16))', border: '1px solid rgba(34,211,238,.30)', textAlign: 'center' },
  rankTitle: { margin: '8px 0', fontSize: 32, fontWeight: 900, color: '#ffffff', textShadow: '0 0 14px rgba(255,45,214,.55)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 16 },
  statsMiniGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 16 },
  statBox: { padding: 12, borderRadius: 16, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(34,211,238,.26)', color: '#f8fbff', display: 'grid', gap: 4, textAlign: 'center', fontWeight: 900 },
  achievementUnlocked: { padding: 12, borderRadius: 14, background: 'linear-gradient(135deg, rgba(253,224,71,.20), rgba(255,45,214,.12))', border: '1px solid rgba(253,224,71,.42)', display: 'grid', gap: 4 },
  achievementLocked: { padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', opacity: 0.45, display: 'grid', gap: 4 },
  flexCard: { marginTop: 16, padding: 18, borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,45,214,.38), rgba(124,58,237,.28), rgba(34,211,238,.28))', color: 'white', textAlign: 'center', boxShadow: '0 0 45px rgba(255,45,214,.22), 0 0 50px rgba(34,211,238,.14)' },
  memoryBox: { width: '100%', minHeight: 180, marginTop: 16, padding: 14, borderRadius: 16, border: '1px solid rgba(34,211,238,.35)', background: 'rgba(3,0,20,.82)', color: '#f8fbff', boxSizing: 'border-box', fontWeight: 800, outline: 'none' },
  storyHero: { marginTop: 16, padding: 18, borderRadius: 22, background: 'linear-gradient(135deg, rgba(255,45,214,.22), rgba(34,211,238,.20))', border: '1px solid rgba(34,211,238,.34)', textAlign: 'center' },
  timelineCard: { padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(34,211,238,.28)', display: 'grid', gap: 8 },
  adminMapHeader: { marginTop: 18, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(34,211,238,.28)', display: 'grid', gap: 6, fontWeight: 900 },
  adminMap: {
    position: 'relative',
    height: 360,
    marginTop: 12,
    borderRadius: 22,
    overflow: 'hidden',
    border: '2px solid rgba(34,211,238,.42)',
    backgroundImage: 'linear-gradient(rgba(34,211,238,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.12) 1px, transparent 1px), radial-gradient(circle at 40% 35%, rgba(255,45,214,.24), transparent 26%), radial-gradient(circle at 60% 70%, rgba(34,211,238,.25), transparent 30%), linear-gradient(135deg, #050510, #14022e)',
    backgroundSize: '32px 32px, 32px 32px, 100% 100%, 100% 100%, 100% 100%',
    boxShadow: 'inset 0 0 40px rgba(34,211,238,.12), 0 0 24px rgba(34,211,238,.12)',
    touchAction: 'manipulation',
  },
  adminMapLabel: { position: 'absolute', left: 12, top: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(3,0,20,.78)', color: '#22d3ee', fontSize: 11, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase', border: '1px solid rgba(34,211,238,.35)' },
  adminMapPin: { position: 'absolute', transform: 'translate(-50%, -100%)', border: 0, background: 'transparent', fontSize: 26, lineHeight: 1, filter: 'drop-shadow(0 0 8px rgba(255,45,214,.95))', cursor: 'pointer' },
  adminMapSelectedPin: { position: 'absolute', transform: 'translate(-50%, -50%)', fontSize: 24, filter: 'drop-shadow(0 0 10px rgba(34,211,238,.95))', pointerEvents: 'none' },
  exportGrid: { display: 'grid', gap: 14, marginTop: 16 },
  exportCard: { padding: 14, borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,255,255,.08), rgba(34,211,238,.07), rgba(255,45,214,.05))', display: 'grid', gap: 10, textAlign: 'center', border: '1px solid rgba(34,211,238,.32)', color: '#f8fbff', boxShadow: '0 0 20px rgba(34,211,238,.12)' },
  exportMiniPassport: { padding: 12, borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,45,214,.14), rgba(34,211,238,.12))', border: '1px solid rgba(34,211,238,.28)', display: 'grid', gap: 6, justifyItems: 'center' },
  exportBadgePreview: { minHeight: 170, padding: 12, borderRadius: 18, background: 'linear-gradient(135deg, rgba(255,45,214,.20), rgba(34,211,238,.16), rgba(124,58,237,.18))', border: '1px solid rgba(34,211,238,.28)', display: 'grid', gap: 8, justifyItems: 'center', alignContent: 'center' },
  lockScreenPreview: { minHeight: 260, padding: 12, borderRadius: 24, background: 'radial-gradient(circle at top, rgba(255,45,214,.30), transparent 45%), radial-gradient(circle at bottom, rgba(34,211,238,.24), transparent 45%), #050510', color: 'white', display: 'grid', gap: 8, justifyItems: 'center', alignContent: 'center', border: '1px solid rgba(34,211,238,.35)' },
  exportCover: { width: '100%', maxWidth: 150, borderRadius: 12, border: '1px solid rgba(34,211,238,.45)', boxShadow: '0 0 18px rgba(34,211,238,.18)' },
  exportCoverSmall: { width: 90, borderRadius: 10, border: '1px solid rgba(34,211,238,.45)' },
  qrPlaceholder: { width: 82, height: 82, borderRadius: 10, background: 'repeating-linear-gradient(45deg, #111 0 6px, #fff 6px 12px)', color: '#111', display: 'grid', placeItems: 'center', fontWeight: 900, border: '3px solid white', boxShadow: '0 0 18px rgba(34,211,238,.22)' },
  qrImage: { width: 92, height: 92, borderRadius: 12, background: 'white', padding: 6, border: '3px solid white', boxShadow: '0 0 18px rgba(34,211,238,.22)', boxSizing: 'border-box' },
  memoryImage: { width: '100%', borderRadius: 14, marginTop: 8, border: '1px solid rgba(34,211,238,.28)' },
,
  unlockOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    padding: 18,
    display: 'grid',
    placeItems: 'center',
    background: 'radial-gradient(circle at 50% 20%, rgba(255,45,214,.34), transparent 30%), radial-gradient(circle at 50% 80%, rgba(34,211,238,.30), transparent 34%), rgba(3,0,20,.86)',
    backdropFilter: 'blur(12px)',
  },
  unlockModal: {
    width: '100%',
    maxWidth: 390,
    padding: 22,
    borderRadius: 32,
    textAlign: 'center',
    color: '#f8fbff',
    background: 'linear-gradient(180deg, rgba(10,5,35,.96), rgba(22,3,46,.94))',
    border: '1px solid rgba(34,211,238,.62)',
    boxShadow: '0 0 34px rgba(34,211,238,.32), 0 0 70px rgba(255,45,214,.24), inset 0 0 28px rgba(255,255,255,.05)',
    animation: 'stampPop .55s ease both',
  },
  unlockModalLegendary: {
    border: '1px solid rgba(255,214,10,.86)',
    boxShadow: '0 0 38px rgba(255,214,10,.42), 0 0 86px rgba(255,45,214,.28), inset 0 0 34px rgba(255,214,10,.08)',
  },
  unlockModalSecret: {
    border: '1px solid rgba(255,45,214,.75)',
    boxShadow: '0 0 38px rgba(255,45,214,.42), 0 0 86px rgba(34,211,238,.24), inset 0 0 34px rgba(255,45,214,.08)',
  },
  unlockPulse: {
    width: 58,
    height: 58,
    margin: '0 auto 10px',
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 34,
    background: 'linear-gradient(135deg, #ff2dd6, #8b5cf6, #22d3ee)',
    color: '#030014',
    boxShadow: '0 0 28px rgba(34,211,238,.55), 0 0 50px rgba(255,45,214,.35)',
  },
  unlockEyebrow: {
    margin: 0,
    color: '#22d3ee',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '.22em',
    textTransform: 'uppercase',
    textShadow: '0 0 12px rgba(34,211,238,.8)',
  },
  unlockTitle: {
    margin: '8px 0 14px',
    fontSize: 28,
    lineHeight: 1.05,
    fontWeight: 900,
    textShadow: '0 0 18px rgba(255,45,214,.72), 0 0 26px rgba(34,211,238,.42)',
  },
  unlockImageWrap: {
    width: 190,
    height: 190,
    margin: '0 auto 14px',
    borderRadius: 999,
    padding: 8,
    background: 'conic-gradient(from 180deg, #ff2dd6, #22d3ee, #8b5cf6, #ffd60a, #ff2dd6)',
    boxShadow: '0 0 32px rgba(255,45,214,.38), 0 0 56px rgba(34,211,238,.28)',
  },
  unlockImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 999,
    border: '4px solid rgba(3,0,20,.95)',
    background: '#030014',
  },
  unlockBadgeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
    margin: '10px 0',
  },
  unlockBadge: {
    padding: '8px 12px',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
    color: '#030014',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '.12em',
    boxShadow: '0 0 18px rgba(34,211,238,.34)',
  },
  unlockLegendaryBadge: {
    background: 'linear-gradient(90deg, #ffd60a, #ff9f1c)',
    boxShadow: '0 0 22px rgba(255,214,10,.55)',
  },
  unlockSecretBadge: {
    background: 'linear-gradient(90deg, #ff2dd6, #22d3ee)',
    boxShadow: '0 0 22px rgba(255,45,214,.55)',
  },
  unlockXp: {
    padding: '8px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,.10)',
    border: '1px solid rgba(34,211,238,.34)',
    color: '#f8fbff',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '.10em',
  },
  unlockCopy: {
    color: 'rgba(248,251,255,.82)',
    fontSize: 14,
    lineHeight: 1.45,
  }
}
