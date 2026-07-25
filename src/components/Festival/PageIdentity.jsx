import { getPageIdentityData } from './PageIdentityData.js'
import './pageIdentity.css'

export default function PageIdentity({
  pageName,
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
  variant = 'compact',
}) {
  const identity = getPageIdentityData({
    pageName,
    activeFestival,
    activeFestivalProfile,
    activeFestivalBrand,
    activeFestivalDisplay,
  })

  return (
    <header
      className={`page-identity page-identity--${variant}`}
      aria-label={`${identity.pageName} page identity`}
      data-edition-id={identity.editionId || 'unknown-edition'}
      style={{
        '--page-identity-accent': identity.accent,
        '--page-identity-border': identity.border,
        '--page-identity-glow': identity.glow,
        background: identity.surface,
      }}
    >
      <div className="page-identity__titles">
        <span className="page-identity__app">{identity.appName}</span>
        <h1 className="page-identity__page">{identity.pageName}</h1>
      </div>
      <div className="page-identity__edition">
        <strong>{identity.festivalName}</strong>
        <span>{identity.year}</span>
        {identity.location && (
          <span className="page-identity__location">{identity.location}</span>
        )}
      </div>
    </header>
  )
}
