import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  loadPublicProfile,
  saveProfile,
} from '../services/profileService'
import {
  loadCollectedIdsByUserId,
} from '../services/stampService'
import {
  loadPrimaryFamilyByOwner,
} from '../services/crewService'
import { getDefaultCollectedIds } from '../services/festivalPersistence.js'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const profileOwnerIdRef = useRef(null)
  const publicProfileRequestRef = useRef(0)

  const [publicProfileId, setPublicProfileId] = useState('')
  const [publicProfile, setPublicProfile] = useState(null)
  const [
    publicProfileCollectedIds,
    setPublicProfileCollectedIds,
  ] = useState(['world-party-parade'])
  const [
    publicProfileLoading,
    setPublicProfileLoading,
  ] = useState(false)
  const [
    publicProfileMessage,
    setPublicProfileMessage,
  ] = useState('')
  const [publicOwnerFamily, setPublicOwnerFamily] =
    useState(null)
  const [publicSmartMessage, setPublicSmartMessage] =
    useState('')
  const [publicJoinLoading, setPublicJoinLoading] =
    useState(false)

  const saveCurrentProfile = useCallback(
    async ({ user, raveName, country }) => {
      if (!user) {
        setProfileMessage('Login first to save your rave profile.')
        return null
      }

      if (!String(raveName || '').trim()) {
        setProfileMessage('Choose your rave name first.')
        return null
      }

      if (!country) {
        setProfileMessage('Choose your passport country first.')
        return null
      }

      const requestedUserId = user.id

      try {
        setProfileSaving(true)
        setProfileMessage('Saving rave profile...')

        const savedProfile = await saveProfile(user, {
          raveName: String(raveName).trim(),
          country,
        })

        if (profileOwnerIdRef.current !== requestedUserId) return null
        setProfile(savedProfile)
        setProfileMessage('Rave profile saved.')
        return savedProfile
      } catch (error) {
        if (profileOwnerIdRef.current === requestedUserId) {
          setProfileMessage(
            error.message || 'Rave profile save failed.'
          )
        }
        return null
      } finally {
        if (profileOwnerIdRef.current === requestedUserId) {
          setProfileSaving(false)
        }
      }
    },
    []
  )

  const beginPrivateProfileSession = useCallback((userId = null) => {
    profileOwnerIdRef.current = userId
    setProfile(null)
    setProfileMessage('')
    setProfileSaving(false)
  }, [])

  const publishPrivateProfile = useCallback((nextProfile, userId) => {
    if (profileOwnerIdRef.current !== userId) return false
    if (nextProfile?.id && nextProfile.id !== userId) return false
    setProfile(nextProfile || null)
    return true
  }, [])

  const loadPublicPassportProfile = useCallback(
    async (profileId, festivalId) => {
      if (!profileId) return
      const requestId = ++publicProfileRequestRef.current

      try {
        setPublicProfileLoading(true)
        setPublicProfileMessage(
          'Loading EDM Passport profile...'
        )

        const foundProfile = await loadPublicProfile(profileId)
        if (requestId !== publicProfileRequestRef.current) return

        if (!foundProfile) {
          setPublicProfile(null)
          setPublicOwnerFamily(null)
          setPublicProfileCollectedIds(getDefaultCollectedIds(festivalId))
          setPublicProfileMessage(
            'This EDM Passport profile was not found yet.'
          )
          return
        }

        const [ownerFamily, collectedIds] = await Promise.all([
          loadPrimaryFamilyByOwner(profileId),
          loadCollectedIdsByUserId(profileId, festivalId),
        ])
        if (requestId !== publicProfileRequestRef.current) return

        setPublicProfile(foundProfile)
        setPublicOwnerFamily(ownerFamily)
        setPublicProfileCollectedIds(collectedIds)
        setPublicProfileMessage('')
        setPublicSmartMessage('')
      } catch (error) {
        if (requestId !== publicProfileRequestRef.current) return
        setPublicProfile(null)
        setPublicOwnerFamily(null)
        setPublicProfileMessage(
          error.message ||
            'Could not load this EDM Passport profile.'
        )
      } finally {
        if (requestId === publicProfileRequestRef.current) {
          setPublicProfileLoading(false)
        }
      }
    },
    []
  )

  const closePublicProfile = useCallback(() => {
    publicProfileRequestRef.current += 1
    const cleanUrl =
      window.location.origin + window.location.pathname

    window.history.replaceState({}, '', cleanUrl)
    setPublicProfileId('')
    setPublicProfile(null)
    setPublicProfileCollectedIds([])
    setPublicProfileLoading(false)
    setPublicOwnerFamily(null)
    setPublicProfileMessage('')
    setPublicSmartMessage('')
  }, [])

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      profileMessage,
      setProfileMessage,
      profileSaving,
      setProfileSaving,
      publicProfileId,
      setPublicProfileId,
      publicProfile,
      setPublicProfile,
      publicProfileCollectedIds,
      setPublicProfileCollectedIds,
      publicProfileLoading,
      setPublicProfileLoading,
      publicProfileMessage,
      setPublicProfileMessage,
      publicOwnerFamily,
      setPublicOwnerFamily,
      publicSmartMessage,
      setPublicSmartMessage,
      publicJoinLoading,
      setPublicJoinLoading,
      saveCurrentProfile,
      beginPrivateProfileSession,
      publishPrivateProfile,
      loadPublicPassportProfile,
      closePublicProfile,
    }),
    [
      profile,
      profileMessage,
      profileSaving,
      publicProfileId,
      publicProfile,
      publicProfileCollectedIds,
      publicProfileLoading,
      publicProfileMessage,
      publicOwnerFamily,
      publicSmartMessage,
      publicJoinLoading,
      saveCurrentProfile,
      beginPrivateProfileSession,
      publishPrivateProfile,
      loadPublicPassportProfile,
      closePublicProfile,
    ]
  )

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)

  if (!context) {
    throw new Error(
      'useProfile must be used inside ProfileProvider'
    )
  }

  return context
}
