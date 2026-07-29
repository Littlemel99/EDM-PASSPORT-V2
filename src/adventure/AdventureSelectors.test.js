import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveAdventureState } from './AdventureEngine.js'
import {
  selectActiveCollections,
  selectAdventureProgress,
  selectAvailableDiscoveries,
  selectCurrentQuest,
  selectHiddenDiscoveryCount,
  selectNewlyUnlockedItems,
  selectNextRecommendedAction,
  selectRewardCandidates,
} from './AdventureSelectors.js'

const state = resolveAdventureState({
  festival: { id: 'festival', timezone: 'UTC' },
  now: new Date('2026-01-01T12:00:00Z'),
  discoveries: [
    {
      id: 'source',
      festivalId: 'festival',
      title: 'Source',
      published: true,
      active: true,
      unlocksDiscoveryIds: ['target'],
    },
    {
      id: 'target',
      festivalId: 'festival',
      title: 'Target',
      published: true,
      active: true,
    },
    {
      id: 'hidden',
      festivalId: 'festival',
      title: 'Hidden',
      published: true,
      active: true,
      hiddenUntilDiscovered: true,
    },
  ],
  collections: [
    {
      id: 'quest',
      festivalId: 'festival',
      name: 'Quest',
      requiredDiscoveryIds: ['target'],
      published: true,
      active: true,
    },
  ],
  collectedDiscoveryIds: ['source'],
  claimContext: { newlyCollectedDiscoveryIds: ['source'] },
})

test('selectors expose precomputed adventure slices', () => {
  assert.deepEqual(
    selectAvailableDiscoveries(state).map(({ id }) => id),
    ['target']
  )
  assert.equal(selectHiddenDiscoveryCount(state), 1)
  assert.deepEqual(
    selectActiveCollections(state).map(({ id }) => id),
    ['quest']
  )
  assert.equal(selectCurrentQuest(state).collectionId, 'quest')
  assert.equal(
    selectNextRecommendedAction(state).discoveryId,
    'target'
  )
  assert.equal(selectRewardCandidates(state).length, 1)
  assert.equal(
    selectAdventureProgress(state),
    state.progression
  )
  assert.deepEqual(
    selectNewlyUnlockedItems(state).map(({ id }) => id),
    ['target']
  )
})

test('selectors fail safely without recalculating state', () => {
  assert.deepEqual(selectAvailableDiscoveries(null), [])
  assert.equal(selectHiddenDiscoveryCount(null), 0)
  assert.deepEqual(selectActiveCollections(null), [])
  assert.equal(selectCurrentQuest(null), null)
  assert.equal(selectNextRecommendedAction(null), null)
  assert.deepEqual(selectRewardCandidates(null), [])
  assert.equal(selectAdventureProgress(null), null)
  assert.deepEqual(selectNewlyUnlockedItems(null), [])
})
