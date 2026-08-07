import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { resolveMissionControlAdventureData } from './MissionControlAdventureData.js'

function adventure(overrides = {}) {
  return {
    discoveries: [
      {
        id: 'available',
        title: 'Available Discovery',
        state: 'AVAILABLE',
      },
      {
        id: 'hidden',
        title: null,
        name: 'Restricted Name',
        state: 'HIDDEN',
      },
    ],
    collections: [],
    nextRecommendedAction: {
      type: 'discovery',
      discoveryId: 'available',
      collectionId: 'quest',
      title: 'Available Discovery',
      reason: 'Advances Quest.',
      progressImpact: 50,
      urgency: 'normal',
      routeTarget: 'discoveries',
    },
    currentQuest: {
      collectionId: 'quest',
      name: 'Quest',
      story: 'A real configured story.',
      difficulty: 'Medium',
      progress: 50,
      nextRequiredDiscoveries: ['available', 'hidden'],
      rewards: {
        xp: 500,
        badge: 'Explorer',
        passportStamp: null,
        hiddenReward: null,
      },
      timeWindow: { availableFrom: null, availableUntil: null },
      state: 'IN_PROGRESS',
    },
    newlyUnlockedItems: [],
    rewardCandidates: [],
    progression: {
      totalEligibleDiscoveries: 2,
      collectedDiscoveries: 0,
      availableDiscoveries: 1,
      lockedDiscoveries: 0,
      hiddenDiscoveries: 1,
      totalEligibleCollections: 1,
      completedCollections: 0,
      earnedXpFromContent: 0,
    },
    ...overrides,
  }
}

const content = { isEmpty: false }

test('Mission Control consumes the engine recommendation without recalculation', () => {
  const input = adventure()
  const result = resolveMissionControlAdventureData({
    adventureState: input,
    contentState: content,
  })

  assert.equal(result.recommendation, input.nextRecommendedAction)
  assert.equal(result.primaryAction.route, 'discoveries')
  assert.equal(result.primaryAction.label, 'VIEW DISCOVERY')
})

test('valid matching Radar target is the only source of OPEN RADAR', () => {
  const matching = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: content,
    radarDiscovery: { id: 'available' },
  })
  const stale = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: content,
    radarDiscovery: { id: 'another-festival-target' },
  })

  assert.equal(matching.primaryAction.route, 'radar')
  assert.equal(matching.primaryAction.label, 'OPEN RADAR')
  assert.equal(stale.primaryAction.route, 'discoveries')
})

test('collection recommendation routes to existing Collections surface', () => {
  const result = resolveMissionControlAdventureData({
    adventureState: adventure({
      nextRecommendedAction: {
        type: 'collection',
        collectionId: 'quest',
        title: 'Quest',
        reason: 'Continue your quest.',
        progressImpact: 60,
        urgency: 'normal',
        routeTarget: 'collections',
      },
    }),
    contentState: content,
  })

  assert.equal(result.primaryAction.label, 'VIEW COLLECTION')
  assert.equal(result.primaryAction.route, 'collections')
})

test('quest metadata uses normalized state and conceals hidden requirements', () => {
  const result = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: content,
  })

  assert.equal(result.currentQuest.state, 'IN_PROGRESS')
  assert.equal(
    result.currentQuest.nextRequiredDiscoveries[1].title,
    'Mystery discovery'
  )
  assert.equal(JSON.stringify(result).includes('Restricted Name'), false)
})

test('momentum is derived only from real remaining progress', () => {
  const oneAway = resolveMissionControlAdventureData({
    adventureState: adventure({
      currentQuest: {
        ...adventure().currentQuest,
        nextRequiredDiscoveries: ['available'],
      },
    }),
    contentState: content,
  })
  const twoAway = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: content,
  })

  assert.equal(
    oneAway.momentum,
    'One discovery away from completing this collection.'
  )
  assert.equal(twoAway.momentum, '2 discoveries remain in this quest.')
})

test('urgency is absent without a real engine time-window signal', () => {
  const normal = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: content,
  })
  const expiring = resolveMissionControlAdventureData({
    adventureState: adventure({
      nextRecommendedAction: {
        ...adventure().nextRecommendedAction,
        urgency: 'expiring',
      },
    }),
    contentState: content,
  })

  assert.equal(normal.urgency, null)
  assert.equal(expiring.urgency, 'ENDS SOON')
})

test('reward previews derive values without mutating XP or granting rewards', () => {
  const input = adventure({
    rewardCandidates: [
      {
        sourceType: 'discovery',
        sourceId: 'earned',
        xp: 300,
        badge: 'Trail Finder',
      },
    ],
  })
  const before = structuredClone(input)
  const result = resolveMissionControlAdventureData({
    adventureState: input,
    contentState: content,
  })

  assert.deepEqual(result.questRewards, ['+500 XP', 'Explorer badge'])
  assert.deepEqual(result.rewardCandidates[0].rewards, [
    '+300 XP',
    'Trail Finder badge',
  ])
  assert.deepEqual(input, before)
})

test('hidden rewards remain absent before engine-proven completion', () => {
  const result = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: content,
  })

  assert.equal(result.questRewards.includes('Secret reward'), false)
})

test('newly unlocked metadata respects normalized hidden state', () => {
  const result = resolveMissionControlAdventureData({
    adventureState: adventure({
      newlyUnlockedItems: [
        {
          type: 'discovery',
          id: 'hidden',
          state: 'HIDDEN',
          title: 'Restricted Name',
        },
      ],
    }),
    contentState: content,
  })

  assert.equal(result.newlyUnlockedItems[0].title, 'Mystery unlock')
  assert.equal(JSON.stringify(result).includes('Restricted Name'), false)
})

test('empty festival suppresses adventure, progress, rewards, and recap semantics', () => {
  const result = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: { isEmpty: true },
  })

  assert.equal(result.isEmpty, true)
  assert.equal(result.recommendation, null)
  assert.equal(result.currentQuest, null)
  assert.equal(result.primaryAction, null)
  assert.equal(result.fallbackAction, null)
  assert.equal(result.progress, null)
  assert.deepEqual(result.rewardCandidates, [])
})

test('configured content with no recommendation gets an honest fallback', () => {
  const result = resolveMissionControlAdventureData({
    adventureState: adventure({
      nextRecommendedAction: null,
      currentQuest: null,
      progression: {
        ...adventure().progression,
        availableDiscoveries: 0,
      },
    }),
    contentState: content,
  })

  assert.equal(result.primaryAction, null)
  assert.equal(result.fallbackAction.route, 'collections')
  assert.equal(result.fallbackAction.label, 'VIEW COLLECTIONS')
  assert.equal(
    result.noActionReason,
    'No published discovery is currently available.'
  )
})

test('progress summary uses only precomputed Adventure Engine progression', () => {
  const result = resolveMissionControlAdventureData({
    adventureState: adventure(),
    contentState: content,
  })

  assert.deepEqual(result.progress, {
    collectedDiscoveries: 0,
    totalEligibleDiscoveries: 2,
    completedCollections: 0,
    totalEligibleCollections: 1,
    earnedXpFromContent: 0,
    lockedDiscoveries: 0,
    hiddenDiscoveries: 1,
  })
})

test('Mission Control wiring preserves claim authorization and existing routes', () => {
  const guideSource = readFileSync(
    new URL('./MissionControlAdventureGuide.jsx', import.meta.url),
    'utf8'
  )
  const dashboardSource = readFileSync(
    new URL('./FestivalDashboard.jsx', import.meta.url),
    'utf8'
  )

  assert.match(dashboardSource, /adventureState=\{adventureState\}/)
  assert.match(guideSource, /<DiscoveryRadar/)
  assert.match(guideSource, /onOpenCollections/)
  assert.match(guideSource, /onOpenDiscoveries/)
  assert.doesNotMatch(guideSource, />\s*(CLAIM|COLLECT)\s*</)
  assert.doesNotMatch(
    guideSource,
    /saveStamp|claimStampDrop|collectActiveStamp/
  )
})

test('Mission Control layout is narrow-safe and keyboard actions are semantic buttons', () => {
  const source = readFileSync(
    new URL('./MissionControlAdventureGuide.jsx', import.meta.url),
    'utf8'
  )

  assert.match(source, /minWidth: 0/)
  assert.match(source, /gridTemplateColumns: 'repeat\(2,minmax\(0,1fr\)\)'/)
  assert.match(source, /minHeight: 48/)
  assert.match(source, /type="button"/)
})
