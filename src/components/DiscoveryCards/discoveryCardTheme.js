export const DISCOVERY_RARITY_THEMES = Object.freeze({
  common: Object.freeze({ label: 'COMMON', border: '#66736d', glow: 'rgba(145,160,153,.14)', surface: '#151b19', accent: '#aab7b1', text: '#f1f5f3', revealClass: 'reveal-common' }),
  uncommon: Object.freeze({ label: 'UNCOMMON', border: '#557d66', glow: 'rgba(99,190,130,.18)', surface: '#122019', accent: '#82d49d', text: '#effff4', revealClass: 'reveal-uncommon' }),
  rare: Object.freeze({ label: 'RARE', border: '#526f91', glow: 'rgba(92,169,255,.2)', surface: '#111b25', accent: '#83bfff', text: '#f1f8ff', revealClass: 'reveal-rare' }),
  epic: Object.freeze({ label: 'EPIC', border: '#72558f', glow: 'rgba(164,101,224,.22)', surface: '#1b1424', accent: '#c798f0', text: '#fbf4ff', revealClass: 'reveal-epic' }),
  legendary: Object.freeze({ label: 'LEGENDARY', border: '#9b7539', glow: 'rgba(232,169,61,.24)', surface: '#241b10', accent: '#f1bd63', text: '#fff9eb', revealClass: 'reveal-legendary' }),
})

export const DISCOVERY_CATEGORY_ARTWORK = Object.freeze({
  stage: Object.freeze({ motif: 'monolith', background: 'radial-gradient(circle at 50% 78%, rgba(222,91,34,.35), transparent 24%), linear-gradient(165deg,#1b2020 0%,#30160f 56%,#090b0b 100%)', accent: '#dd6f38' }),
  experience: Object.freeze({ motif: 'pathway', background: 'radial-gradient(circle at 75% 20%,rgba(163,124,66,.18),transparent 30%),linear-gradient(155deg,#1d241d,#101512 62%,#080a09)', accent: '#a98a55' }),
  community: Object.freeze({ motif: 'convergence', background: 'radial-gradient(circle at 30% 35%,rgba(93,164,111,.22),transparent 28%),radial-gradient(circle at 72% 60%,rgba(179,125,55,.15),transparent 25%),#101813', accent: '#6eaa7c' }),
  art: Object.freeze({ motif: 'relic', background: 'radial-gradient(circle at 50% 42%,rgba(191,142,77,.24),transparent 28%),linear-gradient(145deg,#211c16,#0b0d0c)', accent: '#bd9059' }),
  landmark: Object.freeze({ motif: 'fossil', background: 'radial-gradient(circle at 65% 35%,rgba(190,125,57,.2),transparent 30%),linear-gradient(160deg,#212019,#10120f 58%,#070908)', accent: '#c18a50' }),
  event: Object.freeze({ motif: 'signal', background: 'radial-gradient(circle at 50% 48%,rgba(225,113,47,.35),transparent 18%),radial-gradient(circle at 50% 58%,rgba(102,155,91,.18),transparent 38%),#100d0b', accent: '#e17b43' }),
  journey: Object.freeze({ motif: 'gateway', background: 'linear-gradient(180deg,rgba(99,137,91,.2),transparent 40%),linear-gradient(145deg,#182019,#090c0a)', accent: '#78966e' }),
  achievement: Object.freeze({ motif: 'crest', background: 'radial-gradient(circle at 50% 44%,rgba(224,164,74,.27),transparent 30%),linear-gradient(145deg,#292015,#0c0c0a)', accent: '#e1ad59' }),
  default: Object.freeze({ motif: 'terrain', background: 'radial-gradient(circle at 30% 20%,rgba(129,146,110,.16),transparent 30%),linear-gradient(155deg,#1a1d19,#090b0a)', accent: '#899486' }),
})

export function getDiscoveryRarityTheme(rarity) {
  return DISCOVERY_RARITY_THEMES[String(rarity || '').toLowerCase()] || DISCOVERY_RARITY_THEMES.common
}

export function getDiscoveryCategoryArtwork(category) {
  return DISCOVERY_CATEGORY_ARTWORK[String(category || '').toLowerCase()] || DISCOVERY_CATEGORY_ARTWORK.default
}

export function getAchievementProgress(achievement, discoveries = [], collectedIds = []) {
  const festivalId = achievement?.festivalId || achievement?.festival_id
  const eligibleIds = [...new Set(
    discoveries
      .filter((discovery) =>
        discovery?.id &&
        discovery.festivalId === festivalId &&
        discovery.claimable !== false &&
        discovery.sourceType !== 'derived-achievement'
      )
      .map((discovery) => discovery.id)
  )]
  const collectedSet = new Set(collectedIds)
  const collectedCount = eligibleIds.filter((id) => collectedSet.has(id)).length
  const totalCount = eligibleIds.length

  return {
    achievementId: achievement?.id || null,
    collectedCount,
    totalCount,
    percent: totalCount ? Math.round((collectedCount / totalCount) * 100) : 0,
    unlocked: totalCount > 0 && collectedCount === totalCount,
  }
}

function getEdition(discovery = {}) {
  const parts = String(discovery.festivalId || discovery.festival_id || 'festival-edition').split('-')
  const year = /^\d{4}$/.test(parts.at(-1)) ? parts.pop() : null
  const name = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  return { label: year ? `${name} • ${year}` : name, year }
}

export function getDiscoveryCardPresentation(discovery = {}, options = {}) {
  const normalizedState = String(discovery.state || '').toUpperCase()
  const collected =
    normalizedState === 'COLLECTED' || Boolean(options.collected)
  const visibility = String(discovery.visibility || 'visible').toLowerCase()
  const restricted =
    !collected &&
    (normalizedState === 'HIDDEN' ||
      ['hidden', 'secret'].includes(visibility))
  const locked = normalizedState === 'LOCKED'
  const achievement = discovery.claimable === false || discovery.category === 'achievement' || discovery.sourceType === 'derived-achievement'
  const rarity = getDiscoveryRarityTheme(restricted ? 'common' : discovery.rarity)
  const artwork = getDiscoveryCategoryArtwork(discovery.category)
  const edition = getEdition(discovery)

  return {
    discoveryId: discovery.id || null,
    variant: ['full', 'compact', 'grid', 'detail'].includes(options.variant) ? options.variant : 'grid',
    title: restricted
      ? 'Mystery Discovery'
      : discovery.title || discovery.name || 'Untitled Discovery',
    description: restricted ? 'Continue exploring to reveal this discovery.' : discovery.description || 'A festival discovery awaits.',
    categoryLabel: restricted ? 'RESTRICTED' : String(discovery.category || 'discovery').toUpperCase(),
    location: restricted ? null : discovery.location || null,
    xp:
      restricted || achievement
        ? null
        : Math.max(
            0,
            Number(discovery.xpReward ?? discovery.xp) || 0
          ),
    rarity: restricted ? { ...rarity, label: 'RARITY HIDDEN' } : { ...rarity },
    artwork: { ...artwork },
    image: collected && discovery.image ? discovery.image : null,
    usesFallbackArtwork: !(collected && discovery.image),
    restricted,
    locked,
    achievement,
    stateLabel: achievement
      ? 'ACHIEVEMENT'
      : collected
        ? 'COLLECTED'
        : restricted
          ? 'HIDDEN'
          : locked
            ? 'LOCKED'
            : normalizedState === 'EXPIRED'
              ? 'EXPIRED'
              : normalizedState === 'AVAILABLE'
                ? 'AVAILABLE'
                : 'UNDISCOVERED',
    editionLabel: edition.label,
    editionYear: edition.year,
    claimMessage: achievement
      ? 'Unlocked through progression.'
      : collected
        ? 'Discovery verified and collected.'
        : Array.isArray(discovery.claimMethods) && discovery.claimMethods.length === 0
          ? 'Claim verification is not configured for this discovery.'
          : 'Verification is required to collect this discovery.',
    motion: options.reducedMotion ? 'none' : 'transform 180ms ease, box-shadow 180ms ease',
  }
}
