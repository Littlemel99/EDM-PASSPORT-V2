import { getTopLevelDestinations } from '../../navigation/topLevelNavigation.js'
import AccountChip from './AccountChip.jsx'
import './topLevelNavigation.css'

export default function TopLevelNavigation({
  activeDestination,
  activeFestivalEditionId,
  onNavigate,
  raveName,
  avatarUrl,
  onOpenProfile,
  onEditPassport,
  onSwitchAccount,
  onSignOut,
  isAdmin = false,
}) {
  return (
    <nav
      className="top-level-navigation"
      aria-label="Primary application navigation"
      data-has-active-journey={Boolean(activeFestivalEditionId)}
      data-admin={isAdmin}
    >
      {getTopLevelDestinations(isAdmin).map((destination) => {
        const active = destination.id === activeDestination

        return (
          <button
            key={destination.id}
            type="button"
            className={active ? 'top-level-navigation__item top-level-navigation__item--active' : 'top-level-navigation__item'}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate?.(destination.id)}
          >
            {destination.label}
          </button>
        )
      })}
      <AccountChip
        raveName={raveName}
        avatarUrl={avatarUrl}
        onOpenProfile={onOpenProfile}
        onEditPassport={onEditPassport}
        onSwitchAccount={onSwitchAccount}
        onSignOut={onSignOut}
      />
    </nav>
  )
}
