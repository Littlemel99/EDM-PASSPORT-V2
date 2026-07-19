import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

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

      try {
        setProfileSaving(true)
        setProfileMessage('Saving rave profile...')

        const savedProfile = await saveProfile(user, {
          raveName: String(raveName).trim(),
          country,
        })

        setProfile(savedProfile)
        setProfileMessage('Rave profile saved.')
        return savedProfile
      } catch (error) {
        setProfileMessage(
          error.message || 'Rave profile save failed.'
        )
        return null
      } finally {
        setProfileSaving(false)
      }
    },
    []
  )

  const loadPublicPassportProfile = useCallback(
    async (profileId) => {
      if (!profileId) return

      try {
        setPublicProfileLoading(true)
        setPublicProfileMessage(
          'Loading EDM Passport profile...'
        )

        const foundProfile = await loadPublicProfile(profileId)

        if (!foundProfile) {
          setPublicProfile(null)
          setPublicOwnerFamily(null)
          setPublicProfileCollectedIds([
            'world-party-parade',
          ])
          setPublicProfileMessage(
            'This EDM Passport profile was not found yet.'
          )
          return
        }

        setPublicProfile(foundProfile)
        setPublicOwnerFamily(
          await loadPrimaryFamilyByOwner(profileId)
        )
        setPublicProfileCollectedIds(
          await loadCollectedIdsByUserId(profileId)
        )
        setPublicProfileMessage('')
        setPublicSmartMessage('')
      } catch (error) {
        setPublicProfile(null)
        setPublicOwnerFamily(null)
        setPublicProfileMessage(
          error.message ||
            'Could not load this EDM Passport profile.'
        )
      } finally {
        setPublicProfileLoading(false)
      }
    },
    []
  )

  const closePublicProfile = useCallback(() => {
    const cleanUrl =
      window.location.origin + window.location.pathname

    window.history.replaceState({}, '', cleanUrl)
    setPublicProfileId('')
    setPublicProfile(null)
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
