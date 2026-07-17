import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

const CrewContext = createContext(null)

export function CrewProvider({ children }) {
  const [families, setFamilies] = useState([])
  const [publicFamilies, setPublicFamilies] = useState([])
  const [activeFamilyId, setActiveFamilyId] = useState('')
  const [familyInput, setFamilyInput] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [pendingFamilyInviteCode, setPendingFamilyInviteCode] =
    useState(
      localStorage.getItem('edm-pending-family-invite') || ''
    )
  const [familyMessage, setFamilyMessage] = useState('')

  const value = useMemo(
    () => ({
      families,
      setFamilies,
      publicFamilies,
      setPublicFamilies,
      activeFamilyId,
      setActiveFamilyId,
      familyInput,
      setFamilyInput,
      joinCode,
      setJoinCode,
      pendingFamilyInviteCode,
      setPendingFamilyInviteCode,
      familyMessage,
      setFamilyMessage,
    }),
    [
      families,
      publicFamilies,
      activeFamilyId,
      familyInput,
      joinCode,
      pendingFamilyInviteCode,
      familyMessage,
    ]
  )

  return (
    <CrewContext.Provider value={value}>
      {children}
    </CrewContext.Provider>
  )
}

export function useCrew() {
  const context = useContext(CrewContext)

  if (!context) {
    throw new Error(
      'useCrew must be used inside CrewProvider'
    )
  }

  return context
}
