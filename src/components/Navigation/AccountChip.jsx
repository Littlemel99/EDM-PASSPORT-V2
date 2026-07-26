import { useEffect, useRef, useState } from 'react'
import { getAccountChipLabel } from './accountChipIdentity.js'

export default function AccountChip({
  raveName,
  avatarUrl,
  onOpenProfile,
  onEditPassport,
  onSwitchAccount,
  onSignOut,
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const label = getAccountChipLabel(raveName)

  useEffect(() => {
    if (!open) return

    const closeMenu = (event) => {
      if (
        event.key === 'Escape' ||
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', closeMenu)
    document.addEventListener('pointerdown', closeMenu)
    return () => {
      document.removeEventListener('keydown', closeMenu)
      document.removeEventListener('pointerdown', closeMenu)
    }
  }, [open])

  const runAction = (action) => {
    setOpen(false)
    action?.()
  }

  return (
    <div className="account-chip" ref={containerRef}>
      <button
        type="button"
        className="account-chip__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-chip-menu"
        aria-label={`Account menu for ${label}`}
        title={label}
        onClick={() => setOpen((current) => !current)}
      >
        {avatarUrl ? (
          <img
            className="account-chip__avatar"
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="account-chip__avatar account-chip__avatar--fallback" aria-hidden="true">
            ◉
          </span>
        )}
        <span className="account-chip__name">{label}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div
          id="account-chip-menu"
          className="account-chip__menu"
          role="menu"
          aria-label="Account"
        >
          <MenuItem onClick={() => runAction(onOpenProfile)}>
            MY PROFILE
          </MenuItem>
          <MenuItem onClick={() => runAction(onEditPassport)}>
            EDIT PASSPORT
          </MenuItem>
          <MenuItem onClick={() => runAction(onSwitchAccount)}>
            SWITCH ACCOUNT
          </MenuItem>
          <MenuItem onClick={() => runAction(onSignOut)}>
            SIGN OUT
          </MenuItem>
        </div>
      )}
    </div>
  )
}

function MenuItem({ children, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      className="account-chip__menu-item"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
