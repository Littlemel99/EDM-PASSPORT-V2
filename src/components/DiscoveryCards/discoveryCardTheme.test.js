import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateCollectionProgress, getCollectionById } from '../../collections/CollectionEngine.js'
import { lostLands2026Discoveries } from '../../festivals/lostLands2026Discoveries.js'
import {
  DISCOVERY_RARITY_THEMES,
  getAchievementProgress,
  getDiscoveryCardPresentation,
  getDiscoveryCategoryArtwork,
  getDiscoveryRarityTheme,
} from './discoveryCardTheme.js'

const requiredThemeFields = ['label', 'border', 'glow', 'surface', 'accent', 'text', 'revealClass']
const prehistoricStage = lostLands2026Discoveries.find(({ id }) => id === 'lost-lands-prehistoric-stage')

test('every supported rarity returns a complete visual theme', () => {
  for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
    const theme = getDiscoveryRarityTheme(rarity)
    assert.deepEqual(Object.keys(theme), requiredThemeFields)
    assert.ok(requiredThemeFields.every((field) => theme[field]))
  }
})

test('unknown rarity falls back safely', () => {
  assert.equal(getDiscoveryRarityTheme('mythic'), DISCOVERY_RARITY_THEMES.common)
})

test('collected card exposes title and metadata', () => {
  const view = getDiscoveryCardPresentation(prehistoricStage, { collected: true })
  assert.equal(view.title, 'Prehistoric Stage')
  assert.equal(view.location, 'The Prehistoric Stage')
  assert.equal(view.categoryLabel, 'STAGE')
  assert.equal(view.stateLabel, 'COLLECTED')
})

test('uncollected card hides restricted title', () => {
  const view = getDiscoveryCardPresentation({ ...prehistoricStage, visibility: 'hidden' })
  assert.equal(view.title, 'Mystery Discovery')
  assert.equal(view.restricted, true)
})

test('hidden discovery does not leak secret content', () => {
  const secret = { ...prehistoricStage, name: 'Secret Name', description: 'Secret Story', location: 'Secret Place', visibility: 'secret' }
  const view = getDiscoveryCardPresentation(secret)
  assert.equal(view.description.includes('Secret'), false)
  assert.equal(view.location, null)
  assert.equal(view.rarity.label, 'RARITY HIDDEN')
  assert.equal(JSON.stringify(view).includes('Secret Name'), false)
})

test('achievement-only card displays achievement state', () => {
  const achievement = lostLands2026Discoveries.find(({ category }) => category === 'achievement')
  const view = getDiscoveryCardPresentation(achievement)
  assert.equal(view.achievement, true)
  assert.equal(view.stateLabel, 'ACHIEVEMENT')
  assert.equal(view.xp, null)
  assert.match(view.claimMessage, /progression/i)
})

test('achievement progress derives from existing festival collection state', () => {
  const achievement = lostLands2026Discoveries.find(({ category }) => category === 'achievement')
  const claimableIds = lostLands2026Discoveries
    .filter((discovery) => discovery.claimable !== false)
    .map((discovery) => discovery.id)
  const partial = getAchievementProgress(achievement, lostLands2026Discoveries, claimableIds.slice(0, 2))
  const complete = getAchievementProgress(achievement, lostLands2026Discoveries, claimableIds)

  assert.equal(partial.collectedCount, 2)
  assert.equal(partial.totalCount, 9)
  assert.equal(partial.unlocked, false)
  assert.equal(complete.unlocked, true)
  assert.equal(complete.percent, 100)
})

test('missing image uses category artwork fallback', () => {
  const view = getDiscoveryCardPresentation(prehistoricStage, { collected: true })
  assert.equal(view.usesFallbackArtwork, true)
  assert.equal(view.artwork.motif, 'monolith')
})

test('missing category uses safe default fallback', () => {
  assert.equal(getDiscoveryCategoryArtwork(null).motif, 'terrain')
})

test('card variants preserve discovery identity', () => {
  for (const variant of ['full', 'compact', 'grid', 'detail']) {
    const view = getDiscoveryCardPresentation(prehistoricStage, { variant })
    assert.equal(view.discoveryId, prehistoricStage.id)
    assert.equal(view.variant, variant)
  }
})

test('EDC discovery data renders without Lost Lands hardcoding', () => {
  const edc = { id: 'kinetic-field', festivalId: 'edc-las-vegas-2026', name: 'Kinetic Field', category: 'stage', rarity: 'rare' }
  const view = getDiscoveryCardPresentation(edc, { collected: true })
  assert.equal(view.title, 'Kinetic Field')
  assert.equal(view.editionLabel, 'Edc Las Vegas • 2026')
})

test('Lost Lands cards show edition 2026', () => {
  const view = getDiscoveryCardPresentation(prehistoricStage)
  assert.equal(view.editionYear, '2026')
  assert.equal(view.editionLabel, 'Lost Lands • 2026')
})

test('DiscoveryCard presentation does not mutate discovery input', () => {
  const discovery = structuredClone(prehistoricStage)
  const before = structuredClone(discovery)
  getDiscoveryCardPresentation(discovery, { collected: true, variant: 'full' })
  assert.deepEqual(discovery, before)
})

test('Collection Detail presentation does not change progress math', () => {
  const collection = getCollectionById('lost-lands-stages')
  const collectedIds = [prehistoricStage.id]
  const before = calculateCollectionProgress(collection, collectedIds)
  getDiscoveryCardPresentation(prehistoricStage, { collected: true })
  assert.deepEqual(calculateCollectionProgress(collection, collectedIds), before)
})

test('overlapping collection cards preserve the same discovery ID', () => {
  const discovery = lostLands2026Discoveries.find(({ id }) => id === 'lost-lands-discovery-center')
  const explorationCard = getDiscoveryCardPresentation(discovery)
  const communityCard = getDiscoveryCardPresentation(discovery)
  assert.equal(explorationCard.discoveryId, discovery.id)
  assert.equal(communityCard.discoveryId, discovery.id)
  assert.notEqual(explorationCard, communityCard)
})

test('reduced-motion presentation disables nonessential motion', () => {
  assert.equal(getDiscoveryCardPresentation(prehistoricStage, { reducedMotion: true }).motion, 'none')
  assert.notEqual(getDiscoveryCardPresentation(prehistoricStage).motion, 'none')
})
