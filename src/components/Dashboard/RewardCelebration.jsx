import { PageIdentity } from '../Festival/index.js'
import {
  getDiscoveryCategoryArtwork,
  getDiscoveryRarityTheme,
} from '../DiscoveryCards/discoveryCardTheme.js'
import { getFestivalContextBarData } from '../Festival/FestivalContextBarData.js'
import { resolveRewardRevealData } from './rewardRevealData.js'
import './rewardReveal.css'

function ProgressChange({ label, before, after, total }) {
  return (
    <div className="reward-reveal__progress-row">
      <span>{label}</span>
      <strong>
        {before} → {after} / {total}
      </strong>
    </div>
  )
}

export default function RewardCelebration({
  result,
  currentUserId = null,
  developerMode = false,
  onContinue,
  onRepeatLastClaim,
  onViewInPassport,
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
}) {
  if (!result?.discovery) return null

  const festivalContext = getFestivalContextBarData({
    activeFestival,
    activeFestivalProfile,
    activeFestivalBrand,
    activeFestivalDisplay,
  })
  const reveal = resolveRewardRevealData(result, {
    festivalContext,
    currentUserId,
  })
  if (!reveal) return null

  const { discovery } = reveal
  const rarityTheme = getDiscoveryRarityTheme(discovery.rarity)
  const artwork = getDiscoveryCategoryArtwork(discovery.category)
  const duplicate = reveal.duplicate

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${reveal.state === 'NEW_DISCOVERY' ? 'Discovery unlocked' : 'Already discovered'}: ${discovery.name}`}
      className="reward-reveal__overlay"
    >
      <section
        className={`reward-reveal__card ${duplicate ? 'reward-reveal__card--duplicate' : 'reward-reveal__card--new'}`}
        style={{
          '--reveal-accent': rarityTheme.accent,
          '--reveal-border': rarityTheme.border,
          '--reveal-glow': rarityTheme.glow,
        }}
      >
        <PageIdentity
          pageName="DISCOVERY REWARD"
          activeFestival={activeFestival}
          activeFestivalProfile={activeFestivalProfile}
          activeFestivalBrand={activeFestivalBrand}
          activeFestivalDisplay={activeFestivalDisplay}
          variant="reward"
        />

        <p className="reward-reveal__eyebrow">
          {duplicate ? 'ALREADY DISCOVERED' : 'DISCOVERY UNLOCKED'}
        </p>

        <div
          className={`reward-reveal__art reward-reveal__art--${artwork.motif}`}
          style={{ background: artwork.background }}
        >
          {discovery.image ? (
            <img src={discovery.image} alt={discovery.name} />
          ) : (
            <div className="reward-reveal__relic" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <h2 className="reward-reveal__title">{discovery.name}</h2>
        <div className="reward-reveal__metadata">
          <span>{reveal.rarity}</span>
          <span>{reveal.category}</span>
        </div>
        <p className="reward-reveal__story">{reveal.story}</p>

        <div className="reward-reveal__xp" aria-label={`${reveal.xpEarned} XP earned`}>
          <strong>{duplicate ? '0' : `+${reveal.xpEarned}`}</strong>
          <span>XP EARNED</span>
        </div>

        {duplicate ? (
          <div className="reward-reveal__unchanged" role="status">
            <strong>No progress added</strong>
            <span>Collection unchanged</span>
            <span>Daily Mission unchanged</span>
            <span>Achievement unchanged</span>
          </div>
        ) : (
          <div className="reward-reveal__progress" aria-label="Claim progress changes">
            <ProgressChange
              label="Discoveries"
              before={reveal.discoveryProgress.before}
              after={reveal.discoveryProgress.after}
              total={reveal.discoveryProgress.total}
            />

            {reveal.collectionChanges.map((change) => (
              <ProgressChange
                key={change.collectionId}
                label={change.name}
                before={change.before}
                after={change.after}
                total={change.total}
              />
            ))}

            {reveal.missionChange && (
              <ProgressChange
                label="Daily Mission"
                before={reveal.missionChange.before}
                after={reveal.missionChange.after}
                total={reveal.missionChange.target}
              />
            )}

            {reveal.achievementChange && (
              <ProgressChange
                label={reveal.achievementChange.achievement?.name || 'Achievement'}
                before={reveal.achievementChange.before}
                after={reveal.achievementChange.after}
                total={reveal.achievementChange.total}
              />
            )}
          </div>
        )}

        {reveal.completedCollections.length > 0 && (
          <aside className="reward-reveal__milestone" aria-label="Completed collections">
            <span>COLLECTION COMPLETE</span>
            {reveal.completedCollections.map((collection) => (
              <strong key={collection.collectionId}>{collection.name}</strong>
            ))}
            <small>
              {reveal.completedCollectionCount} / {reveal.totalCollections} collections completed
            </small>
          </aside>
        )}

        {reveal.achievementChange?.unlockedNow && (
          <aside className="reward-reveal__milestone reward-reveal__milestone--achievement">
            <span>ACHIEVEMENT UNLOCKED</span>
            <strong>
              {reveal.achievementChange.achievement?.name || 'Prehistoric Explorer'}
            </strong>
            <small>
              {reveal.achievementChange.after} / {reveal.achievementChange.total}
            </small>
            <p>Unlocked through discovery progression.</p>
          </aside>
        )}

        <button
          type="button"
          className="reward-reveal__primary"
          onClick={onContinue}
        >
          {reveal.primaryActionLabel}
        </button>

        {reveal.secondaryActionLabel && (
          <button
            type="button"
            className="reward-reveal__secondary"
            onClick={() => onViewInPassport?.(discovery)}
          >
            {reveal.secondaryActionLabel}
          </button>
        )}

        {developerMode && (
          <button
            type="button"
            className="reward-reveal__developer"
            onClick={() => onRepeatLastClaim?.(discovery)}
          >
            REPEAT PREVIOUS DISCOVERY
          </button>
        )}
      </section>
    </div>
  )
}
