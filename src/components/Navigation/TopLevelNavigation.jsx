import {
  canOpenEditionDestination,
  getTopLevelDestinations,
} from '../../navigation/topLevelNavigation.js'
import './topLevelNavigation.css'

export default function TopLevelNavigation({
  activeDestination,
  activeFestivalEditionId,
  onNavigate,
  onSignOut,
}) {
  const needsFestival = !activeFestivalEditionId

  return (
    <>
      <nav
        className="top-level-navigation"
        aria-label="Primary application navigation"
      >
        {getTopLevelDestinations().map((destination) => {
          const enabled = canOpenEditionDestination(
            destination.id,
            activeFestivalEditionId
          )
          const active = destination.id === activeDestination

          return (
            <button
              key={destination.id}
              type="button"
              className={active ? 'top-level-navigation__item top-level-navigation__item--active' : 'top-level-navigation__item'}
              aria-current={active ? 'page' : undefined}
              aria-label={
                enabled
                  ? destination.label
                  : `${destination.label}: Select a festival`
              }
              disabled={!enabled}
              onClick={() => onNavigate?.(destination.id)}
            >
              {destination.label}
            </button>
          )
        })}
        <button
          type="button"
          className="top-level-navigation__sign-out"
          onClick={onSignOut}
        >
          SIGN OUT
        </button>
      </nav>
      {needsFestival && (
        <p className="top-level-navigation__prompt" role="status">
          Select a festival to begin your journey. Select a festival to
          view its passport.
        </p>
      )}
    </>
  )
}
