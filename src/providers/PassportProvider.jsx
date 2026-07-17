import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

const PassportContext = createContext(null)

export function PassportProvider({ children }) {
  const [activeId, setActiveId] = useState(
    'world-party-parade'
  )
  const [bookOpen, setBookOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedStamp, setSelectedStamp] = useState(null)

  const value = useMemo(
    () => ({
      activeId,
      setActiveId,
      bookOpen,
      setBookOpen,
      pageIndex,
      setPageIndex,
      selectedStamp,
      setSelectedStamp,
    }),
    [
      activeId,
      bookOpen,
      pageIndex,
      selectedStamp,
    ]
  )

  return (
    <PassportContext.Provider value={value}>
      {children}
    </PassportContext.Provider>
  )
}

export function usePassport() {
  const context = useContext(PassportContext)

  if (!context) {
    throw new Error(
      'usePassport must be used inside PassportProvider'
    )
  }

  return context
}
