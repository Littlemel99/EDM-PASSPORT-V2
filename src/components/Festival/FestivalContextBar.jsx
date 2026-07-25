import './festivalContextBar.css'
import { getFestivalContextBarData } from './FestivalContextBarData.js'

export default function FestivalContextBar({
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
  variant = 'compact',
}) {
  const context = getFestivalContextBarData({
    activeFestival,
    activeFestivalProfile,
    activeFestivalBrand,
    activeFestivalDisplay,
  })

  return (
    <header
      className={`festival-context festival-context--${variant}`}
      aria-label="Active festival"
      style={{
        '--festival-context-accent': context.accent,
        '--festival-context-border': context.border,
        '--festival-context-glow': context.glow,
        background: context.surface,
      }}
      data-edition-id={context.editionId || 'unknown-edition'}
    >
      <div className="festival-context__copy">
        <span className="festival-context__eyebrow">ACTIVE FESTIVAL</span>
        <strong className="festival-context__name">
          {context.festivalName}
        </strong>
        <span className="festival-context__year">{context.year}</span>
      </div>
      {context.venueLocation && (
        <span className="festival-context__location">
          {context.venueLocation}
        </span>
      )}
    </header>
  )
}
