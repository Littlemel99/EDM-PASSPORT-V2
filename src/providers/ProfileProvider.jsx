import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

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
