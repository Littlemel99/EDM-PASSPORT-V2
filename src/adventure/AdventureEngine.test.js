import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  COLLECTION_STATES,
  DISCOVERY_STATES,
  resolveAdventureState,
} from './AdventureEngine.js'
import {
  adaptPublishedCollectionRecord,
  adaptPublishedDiscoveryRecord,
} from './AdventureAdapters.js'

const FESTIVAL_ID = 'festival-2026'
const NOW = new Date('2026-07-25T12:00:00.000Z')
const festival = {
  id: FESTIVAL_ID,
  timezone: 'UTC',
}
const discovery = (id, overrides = {}) => ({
  id,
  festivalId: FESTIVAL_ID,
  title: `Discovery ${id}`,
  active: true,
  published: true,
  xpReward: 100,
  ...overrides,
})
const collection = (id, requiredDiscoveryIds, overrides = {}) => ({
  id,
  festivalId: FESTIVAL_ID,
  name: `Collection ${id}`,
  requiredDiscoveryIds,
  active: true,
  published: true,
  ...overrides,
})
const resolve = (overrides = {}) =>
  resolveAdventureState({
    festival,
    now: NOW,
    ...overrides,
  })
const discoveryState = (state, id) =>
  state.discoveries.find((item) => item.id === id)
const collectionState = (state, id) =>
  state.collections.find((item) => item.id === id)

test('published active discovery without prerequisites is available', () => {
  const state = resolve({ discoveries: [discovery('a')] })
  assert.equal(discoveryState(state, 'a').state, DISCOVERY_STATES.AVAILABLE)
})

test('collected discovery precedes expiration', () => {
  const state = resolve({
    discoveries: [
      discovery('a', { availableUntil: '2026-07-24T12:00:00.000Z' }),
    ],
    collectedDiscoveryIds: ['a'],
  })
  assert.equal(discoveryState(state, 'a').state, DISCOVERY_STATES.COLLECTED)
})

test('discovery prerequisites resolve locked and hidden states', () => {
  const state = resolve({
    discoveries: [
      discovery('a'),
      discovery('locked', { prerequisiteDiscoveryIds: ['a'] }),
      discovery('hidden', {
        prerequisiteDiscoveryIds: ['a'],
        hiddenUntilDiscovered: true,
      }),
    ],
  })
  assert.equal(discoveryState(state, 'locked').state, DISCOVERY_STATES.LOCKED)
  assert.equal(discoveryState(state, 'hidden').state, DISCOVERY_STATES.HIDDEN)
  assert.equal(discoveryState(state, 'hidden').title, null)
  assert.equal(discoveryState(state, 'hidden').location, null)
})

test('ended discovery window expires only uncollected content', () => {
  const state = resolve({
    discoveries: [
      discovery('expired', { availableUntil: '2026-07-24' }),
    ],
  })
  assert.equal(
    discoveryState(state, 'expired').state,
    DISCOVERY_STATES.EXPIRED
  )
})

test('inactive, unpublished, and cross-festival discoveries are unavailable', () => {
  const state = resolve({
    discoveries: [
      discovery('inactive', { active: false }),
      discovery('draft', { published: false }),
      discovery('other', { festivalId: 'other-2026' }),
    ],
  })
  for (const id of ['inactive', 'draft', 'other']) {
    assert.equal(
      discoveryState(state, id).state,
      DISCOVERY_STATES.UNAVAILABLE
    )
  }
  assert.equal(state.progression.totalEligibleDiscoveries, 0)
})

test('valid collection is in progress and completes from required discoveries', () => {
  const input = {
    discoveries: [discovery('a'), discovery('b')],
    collections: [collection('quest', ['a', 'b'])],
  }
  const incomplete = resolve(input)
  assert.equal(
    collectionState(incomplete, 'quest').state,
    COLLECTION_STATES.IN_PROGRESS
  )
  const complete = resolve({
    ...input,
    collectedDiscoveryIds: ['a', 'b'],
  })
  const quest = collectionState(complete, 'quest')
  assert.equal(quest.state, COLLECTION_STATES.COMPLETE)
  assert.equal(quest.requiredCount, 2)
  assert.equal(quest.completedRequiredCount, 2)
  assert.equal(quest.progressPercent, 100)
})

test('empty and missing-reference collections never complete', () => {
  const state = resolve({
    discoveries: [discovery('a')],
    collections: [
      collection('empty', []),
      collection('missing', ['not-published']),
    ],
    collectedDiscoveryIds: ['not-published'],
  })
  assert.equal(
    collectionState(state, 'empty').state,
    COLLECTION_STATES.UNAVAILABLE
  )
  assert.equal(
    collectionState(state, 'missing').state,
    COLLECTION_STATES.UNAVAILABLE
  )
  assert.equal(collectionState(state, 'empty').progressPercent, 0)
})

test('minimum required count works and optional discoveries do not block', () => {
  const discoveries = [
    discovery('a'),
    discovery('b'),
    discovery('c'),
  ]
  const threshold = resolve({
    discoveries,
    collections: [
      collection('threshold', ['a', 'b', 'c'], {
        minimumRequiredCount: 2,
      }),
    ],
    collectedDiscoveryIds: ['a', 'b'],
  })
  assert.equal(
    collectionState(threshold, 'threshold').state,
    COLLECTION_STATES.COMPLETE
  )

  const optional = resolve({
    discoveries,
    collections: [
      collection('optional', ['a'], {
        optionalDiscoveryIds: ['b'],
      }),
    ],
    collectedDiscoveryIds: ['a'],
  })
  assert.equal(
    collectionState(optional, 'optional').state,
    COLLECTION_STATES.COMPLETE
  )
})

test('collection prerequisite, hidden, expiration, and publication states are safe', () => {
  const discoveries = [discovery('a'), discovery('b')]
  const state = resolve({
    discoveries,
    collections: [
      collection('base', ['a']),
      collection('locked', ['b'], {
        prerequisiteCollectionIds: ['base'],
      }),
      collection('hidden', ['b'], {
        prerequisiteCollectionIds: ['base'],
        hiddenUntilUnlocked: true,
      }),
      collection('expired', ['b'], { availableUntil: '2026-07-24' }),
      collection('inactive', ['b'], { active: false }),
      collection('draft', ['b'], { published: false }),
    ],
  })
  assert.equal(collectionState(state, 'locked').state, COLLECTION_STATES.LOCKED)
  assert.equal(collectionState(state, 'hidden').state, COLLECTION_STATES.HIDDEN)
  assert.equal(collectionState(state, 'expired').state, COLLECTION_STATES.EXPIRED)
  assert.equal(collectionState(state, 'inactive').state, COLLECTION_STATES.UNAVAILABLE)
  assert.equal(collectionState(state, 'draft').state, COLLECTION_STATES.UNAVAILABLE)
})

test('archived and unpublished discovery progress cannot satisfy collections', () => {
  const state = resolve({
    discoveries: [
      discovery('archived', { archived: true }),
      discovery('draft', { published: false }),
    ],
    collections: [
      collection('quest', ['archived', 'draft']),
    ],
    collectedDiscoveryIds: ['archived', 'draft'],
  })
  assert.equal(
    collectionState(state, 'quest').state,
    COLLECTION_STATES.UNAVAILABLE
  )
})

test('discovery unlocks discovery and collection deterministically', () => {
  const state = resolve({
    discoveries: [
      discovery('source', {
        unlocksDiscoveryIds: ['target'],
        unlocksCollectionIds: ['quest'],
      }),
      discovery('target'),
      discovery('quest-item'),
    ],
    collections: [collection('quest', ['quest-item'])],
  })
  assert.equal(discoveryState(state, 'target').state, DISCOVERY_STATES.LOCKED)
  assert.equal(collectionState(state, 'quest').state, COLLECTION_STATES.LOCKED)

  const unlocked = resolve({
    discoveries: [
      discovery('source', {
        unlocksDiscoveryIds: ['target'],
        unlocksCollectionIds: ['quest'],
      }),
      discovery('target'),
      discovery('quest-item'),
    ],
    collections: [collection('quest', ['quest-item'])],
    collectedDiscoveryIds: ['source'],
    claimContext: {
      newlyCollectedDiscoveryIds: ['source'],
    },
  })
  assert.equal(discoveryState(unlocked, 'target').state, DISCOVERY_STATES.AVAILABLE)
  assert.equal(collectionState(unlocked, 'quest').state, COLLECTION_STATES.IN_PROGRESS)
  assert.deepEqual(
    unlocked.newlyUnlockedItems.map(({ type, id }) => [type, id]),
    [
      ['discovery', 'target'],
      ['collection', 'quest'],
    ]
  )
})

test('collection unlocks discovery and collection through chains', () => {
  const discoveries = [
    discovery('a'),
    discovery('b'),
    discovery('target'),
  ]
  const collections = [
    collection('first', ['a'], {
      unlocksDiscoveryIds: ['target'],
      unlocksCollectionIds: ['second'],
    }),
    collection('second', ['b']),
  ]
  const locked = resolve({ discoveries, collections })
  assert.equal(discoveryState(locked, 'target').state, DISCOVERY_STATES.LOCKED)
  assert.equal(collectionState(locked, 'second').state, COLLECTION_STATES.LOCKED)

  const unlocked = resolve({
    discoveries,
    collections,
    collectedDiscoveryIds: ['a'],
    claimContext: { newlyCompletedCollectionIds: ['first'] },
  })
  assert.equal(discoveryState(unlocked, 'target').state, DISCOVERY_STATES.AVAILABLE)
  assert.equal(collectionState(unlocked, 'second').state, COLLECTION_STATES.IN_PROGRESS)
})

test('cycles are diagnosed, fail closed, and never recurse forever', () => {
  const state = resolve({
    discoveries: [
      discovery('a', { prerequisiteDiscoveryIds: ['b'] }),
      discovery('b', { prerequisiteDiscoveryIds: ['a'] }),
    ],
    collections: [
      collection('one', ['a'], {
        prerequisiteCollectionIds: ['two'],
      }),
      collection('two', ['b'], {
        prerequisiteCollectionIds: ['one'],
      }),
    ],
  })
  assert.ok(state.diagnostics.cyclePaths.length >= 2)
  assert.equal(discoveryState(state, 'a').state, DISCOVERY_STATES.UNAVAILABLE)
  assert.equal(collectionState(state, 'one').state, COLLECTION_STATES.UNAVAILABLE)
})

test('cross-festival unlock references are ignored with diagnostics', () => {
  const state = resolve({
    discoveries: [
      discovery('source', { unlocksDiscoveryIds: ['other'] }),
      discovery('other', { festivalId: 'other-festival' }),
    ],
    collectedDiscoveryIds: ['source'],
  })
  assert.equal(state.newlyUnlockedItems.length, 0)
  assert.ok(state.diagnostics.missingReferences.length > 0)
})

test('discovery and collection rewards are derived without mutation or duplication', () => {
  const sourceDiscovery = discovery('a', {
    xpReward: 250,
    badgeReward: 'Explorer',
  })
  const sourceCollection = collection('quest', ['a'], {
    xpReward: 500,
    badgeReward: 'Quest Master',
    passportStampReward: 'Quest Stamp',
    hiddenReward: 'Secret ending',
  })
  const state = resolve({
    discoveries: [sourceDiscovery],
    collections: [sourceCollection],
    collectedDiscoveryIds: ['a', 'a'],
  })
  assert.equal(state.rewardCandidates.length, 2)
  assert.equal(state.progression.earnedXpFromContent, 750)
  assert.equal(sourceDiscovery.xpReward, 250)
  const collectionReward = state.rewardCandidates.find(
    ({ sourceType }) => sourceType === 'collection'
  )
  assert.equal(collectionReward.hiddenReward, 'Secret ending')

  const acknowledged = resolve({
    discoveries: [sourceDiscovery],
    collections: [sourceCollection],
    collectedDiscoveryIds: ['a'],
    rewardedSourceKeys: ['discovery:a', 'collection:quest'],
  })
  assert.equal(acknowledged.rewardCandidates.length, 0)
  assert.equal(acknowledged.progression.earnedXpFromContent, 750)
})

test('hidden rewards are not exposed before collection completion', () => {
  const state = resolve({
    discoveries: [
      discovery('a', { hiddenReward: 'Discovery secret' }),
    ],
    collections: [
      collection('quest', ['a'], { hiddenReward: 'Secret' }),
    ],
  })
  assert.equal(state.rewardCandidates.length, 0)
  assert.equal(state.currentQuest.rewards.hiddenReward, null)
  assert.equal(discoveryState(state, 'a').hiddenReward, null)
})

test('current quest selects manually selected or highest-progress collection', () => {
  const discoveries = [
    discovery('a'),
    discovery('b'),
    discovery('c'),
  ]
  const collections = [
    collection('low', ['a', 'b', 'c']),
    collection('high', ['a', 'b']),
  ]
  const automatic = resolve({
    discoveries,
    collections,
    collectedDiscoveryIds: ['a'],
  })
  assert.equal(automatic.currentQuest.collectionId, 'high')

  const selected = resolve({
    discoveries,
    collections,
    collectedDiscoveryIds: ['a'],
    selectedQuestId: 'low',
  })
  assert.equal(selected.currentQuest.collectionId, 'low')
})

test('next recommendation advances the nearest collection', () => {
  const state = resolve({
    discoveries: [discovery('a'), discovery('b'), discovery('c')],
    collections: [
      collection('near', ['a', 'b']),
      collection('far', ['a', 'b', 'c']),
    ],
    collectedDiscoveryIds: ['a'],
  })
  assert.equal(state.nextRecommendedAction.discoveryId, 'b')
  assert.equal(state.nextRecommendedAction.collectionId, 'near')
})

test('soonest expiring discovery is recommended without active collections', () => {
  const state = resolve({
    discoveries: [
      discovery('later', { availableUntil: '2026-07-30T00:00:00Z' }),
      discovery('sooner', { availableUntil: '2026-07-26T00:00:00Z' }),
    ],
  })
  assert.equal(state.nextRecommendedAction.discoveryId, 'sooner')
  assert.equal(state.nextRecommendedAction.urgency, 'expiring')
})

test('no available adventure returns safe null quest and recommendation', () => {
  const state = resolve()
  assert.equal(state.currentQuest, null)
  assert.equal(state.nextRecommendedAction, null)
  assert.deepEqual(state.rewardCandidates, [])
})

test('availability windows are inclusive and injected time is deterministic', () => {
  const records = [
    discovery('start', {
      availableFrom: '2026-07-25T12:00:00.000Z',
    }),
    discovery('end', {
      availableUntil: '2026-07-25T12:00:00.000Z',
    }),
  ]
  const boundary = resolve({ discoveries: records })
  assert.equal(discoveryState(boundary, 'start').state, DISCOVERY_STATES.AVAILABLE)
  assert.equal(discoveryState(boundary, 'end').state, DISCOVERY_STATES.AVAILABLE)
  const after = resolveAdventureState({
    festival,
    now: new Date('2026-07-25T12:00:00.001Z'),
    discoveries: records,
  })
  assert.equal(discoveryState(after, 'end').state, DISCOVERY_STATES.EXPIRED)
})

test('duplicate IDs and malformed records return diagnostics without crashing', () => {
  const state = resolve({
    discoveries: [discovery('a'), discovery('a'), {}, null],
    collections: [
      collection('quest', ['a']),
      collection('quest', ['a']),
      {},
    ],
  })
  assert.deepEqual(state.diagnostics.duplicateDiscoveryIds, ['a'])
  assert.deepEqual(state.diagnostics.duplicateCollectionIds, ['quest'])
  assert.ok(state.diagnostics.invalidDiscoveryIds.length > 0)
  assert.ok(state.diagnostics.invalidCollectionIds.length > 0)
})

test('account and festival progress remain isolated', () => {
  const records = [
    discovery('local'),
    discovery('other', { festivalId: 'other-festival' }),
  ]
  const accountA = resolve({
    discoveries: records,
    collectedDiscoveryIds: ['local'],
  })
  const accountB = resolve({
    discoveries: records,
    collectedDiscoveryIds: ['other'],
  })
  assert.equal(accountA.progression.collectedDiscoveries, 1)
  assert.equal(accountB.progression.collectedDiscoveries, 0)
  assert.equal(accountB.progression.totalEligibleDiscoveries, 1)
})

test('Backstage local drafts are excluded from attendee adventure state', () => {
  const state = resolve({
    discoveries: [
      discovery('draft', { sourceType: 'backstage-draft' }),
    ],
    collections: [
      collection('draft-collection', ['draft'], {
        localDraft: true,
      }),
    ],
  })
  assert.equal(state.progression.totalEligibleDiscoveries, 0)
  assert.equal(state.progression.totalEligibleCollections, 0)
})

test('published Backstage-compatible records adapt into engine models', () => {
  const adaptedDiscovery = adaptPublishedDiscoveryRecord(
    {
      id: 'a',
      title: 'Adapted',
      publishStatus: 'PUBLISHED',
      xp: 50,
    },
    FESTIVAL_ID
  )
  const adaptedCollection = adaptPublishedCollectionRecord(
    {
      id: 'quest',
      name: 'Adapted Quest',
      publishStatus: 'PUBLISHED',
      discoveryIds: ['a'],
    },
    FESTIVAL_ID
  )
  const state = resolve({
    discoveries: [adaptedDiscovery],
    collections: [adaptedCollection],
  })
  assert.equal(discoveryState(state, 'a').state, DISCOVERY_STATES.AVAILABLE)
  assert.equal(collectionState(state, 'quest').state, COLLECTION_STATES.IN_PROGRESS)
})

test('shared attendee content resolver and public Passport remain unchanged', () => {
  const resolverSource = readFileSync(
    new URL('../attendee/attendeeContentState.js', import.meta.url),
    'utf8'
  )
  const publicPassportSource = readFileSync(
    new URL('../components/PublicProfile.jsx', import.meta.url),
    'utf8'
  )
  assert.doesNotMatch(resolverSource, /AdventureEngine|resolveAdventureState/)
  assert.doesNotMatch(publicPassportSource, /resolveAdventureState/)
})

test('limited attendee integration powers collection state without replacing Radar', () => {
  const appSource = readFileSync(
    new URL('../App.jsx', import.meta.url),
    'utf8'
  )
  const collectionsSource = readFileSync(
    new URL(
      '../components/Collections/FestivalCollections.jsx',
      import.meta.url
    ),
    'utf8'
  )
  assert.match(appSource, /resolveAdventureState/)
  assert.match(appSource, /adventureState=\{attendeeAdventureState\}/)
  assert.match(collectionsSource, /adventureCollection\?\.state/)
  assert.match(appSource, /diagnoseFestivalDiscoverySelection/)
  assert.match(appSource, /const nextDiscovery =/)
})
