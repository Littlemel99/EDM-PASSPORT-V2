import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { resolveRewardRevealData } from './rewardRevealData.js'

const source = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')

const discovery = Object.freeze({
  id: 'lost-lands-prehistoric-stage',
  festivalId: 'lost-lands-2026',
  name: 'Prehistoric Stage',
  description: 'Discover the central prehistoric performance environment.',
  category: 'stage',
  rarity: 'rare',
  xp: 100,
  claimable: true,
})

const festivalContext = Object.freeze({
  editionId: 'lost-lands-2026',
  festivalName: 'Lost Lands',
  year: 2026,
})

function makeResult(overrides = {}) {
  return {
    discovery,
    userId: 'user-a',
    isNew: true,
    xpEarned: 100,
    discoveryProgress: {
      before: 1,
      after: 2,
      total: 9,
      beforePercent: 11,
      afterPercent: 22,
    },
    collectionChanges: [{
      collectionId: 'lost-lands-stages',
      name: 'Stages',
      before: 1,
      after: 2,
      total: 2,
      completedNow: true,
    }],
    completedCollectionCount: 1,
    totalCollections: 6,
    missionProgress: {
      previousProgress: 1,
      progress: 2,
      target: 3,
      rewardUnlocked: null,
    },
    achievementChange: {
      achievement: {
        id: 'lost-lands-prehistoric-explorer',
        name: 'Prehistoric Explorer',
        claimable: false,
      },
      before: 1,
      after: 2,
      total: 9,
      unlockedNow: false,
    },
    ...overrides,
  }
}

function resolve(overrides = {}, options = {}) {
  return resolveRewardRevealData(makeResult(overrides), {
    festivalContext,
    currentUserId: 'user-a',
    ...options,
  })
}

test('new Lost Lands claim resolves NEW DISCOVERY with earned XP', () => {
  const reveal = resolve()
  assert.equal(reveal.state, 'NEW_DISCOVERY')
  assert.equal(reveal.isNew, true)
  assert.equal(reveal.xpEarned, 100)
})

test('duplicate resolves ALREADY DISCOVERED with zero XP and no changes', () => {
  const reveal = resolve({
    isNew: false,
    xpEarned: 100,
    discoveryProgress: { before: 2, after: 2, total: 9 },
  })
  assert.equal(reveal.state, 'ALREADY_DISCOVERED')
  assert.equal(reveal.xpEarned, 0)
  assert.deepEqual(reveal.collectionChanges, [])
  assert.equal(reveal.missionChange, null)
  assert.equal(reveal.achievementChange, null)
})

test('new claim exposes before and after discovery progress', () => {
  assert.deepEqual(resolve().discoveryProgress, {
    before: 1,
    after: 2,
    total: 9,
    beforePercent: 11,
    afterPercent: 22,
  })
})

test('duplicate discovery progress remains unchanged', () => {
  const progress = resolve({
    isNew: false,
    discoveryProgress: { before: 2, after: 2, total: 9 },
  }).discoveryProgress
  assert.equal(progress.before, progress.after)
})

test('affected collection progress is accurate', () => {
  assert.deepEqual(resolve().collectionChanges[0], {
    collectionId: 'lost-lands-stages',
    name: 'Stages',
    before: 1,
    after: 2,
    total: 2,
    completedNow: true,
  })
})

test('overlapping collections are represented once by collection ID', () => {
  const repeated = makeResult().collectionChanges[0]
  const reveal = resolve({
    collectionChanges: [
      repeated,
      repeated,
      {
        collectionId: 'lost-lands-exploration',
        name: 'Exploration',
        before: 0,
        after: 1,
        total: 3,
      },
    ],
  })
  assert.deepEqual(
    reveal.collectionChanges.map((change) => change.collectionId),
    ['lost-lands-stages', 'lost-lands-exploration']
  )
})

test('completed collection is identified and multiple completions are supported', () => {
  const reveal = resolve({
    collectionChanges: [
      makeResult().collectionChanges[0],
      {
        collectionId: 'lost-lands-art',
        name: 'Art',
        before: 1,
        after: 2,
        total: 2,
        completedNow: true,
      },
    ],
  })
  assert.deepEqual(
    reveal.completedCollections.map((change) => change.name),
    ['Stages', 'Art']
  )
})

test('Daily Mission change appears only when progress changes', () => {
  assert.deepEqual(resolve().missionChange, {
    before: 1,
    after: 2,
    target: 3,
    rewardUnlocked: null,
  })
  assert.equal(resolve({
    missionProgress: { previousProgress: 2, progress: 2, target: 3 },
  }).missionChange, null)
})

test('Prehistoric Explorer progress and unlock are resolved without a claim action', () => {
  const reveal = resolve({
    achievementChange: {
      achievement: {
        id: 'lost-lands-prehistoric-explorer',
        name: 'Prehistoric Explorer',
        claimable: false,
      },
      before: 8,
      after: 9,
      total: 9,
      unlockedNow: true,
    },
  })
  assert.equal(reveal.achievementChange.after, 9)
  assert.equal(reveal.achievementChange.unlockedNow, true)
  assert.equal(reveal.achievementChange.achievement.claimable, false)
})

test('festival identity comes from the discovery-owning edition context', () => {
  assert.equal(resolve().festival.editionId, discovery.festivalId)
  assert.equal(resolve().festival.festivalName, 'Lost Lands')
  assert.equal(resolve().festival.year, 2026)
})

test('EDC and unknown edition contexts use their own safe presentation data', () => {
  const edc = resolve({}, {
    festivalContext: {
      editionId: 'edc-las-vegas-2026',
      festivalName: 'EDC Las Vegas',
      year: 2026,
    },
  })
  assert.equal(JSON.stringify(edc.festival).includes('Lost Lands'), false)

  const unknown = resolveRewardRevealData(
    makeResult({
      discovery: { ...discovery, festivalId: 'unknown-2030' },
    }),
    { currentUserId: 'user-a' }
  )
  assert.equal(unknown.festival.festivalName, 'Festival Edition')
})

test('actions are state appropriate', () => {
  assert.equal(resolve().primaryActionLabel, 'CONTINUE EXPLORING')
  assert.equal(resolve().secondaryActionLabel, 'VIEW IN PASSPORT')
  const duplicate = resolve({ isNew: false })
  assert.equal(duplicate.primaryActionLabel, 'RETURN TO RADAR')
  assert.equal(duplicate.secondaryActionLabel, null)
})

test('resolver returns defensive frozen data without mutating inputs', () => {
  const input = makeResult()
  const before = structuredClone(input)
  const reveal = resolveRewardRevealData(input, {
    festivalContext,
    currentUserId: 'user-a',
  })
  assert.deepEqual(input, before)
  assert.equal(Object.isFrozen(reveal), true)
  assert.equal(Object.isFrozen(reveal.discovery), true)
})

test('a stale result from a prior account is rejected', () => {
  assert.equal(
    resolveRewardRevealData(makeResult(), {
      festivalContext,
      currentUserId: 'user-b',
    }),
    null
  )
})

test('Reward Celebration uses semantic state actions and gates admin repeat', () => {
  const component = source('./RewardCelebration.jsx')
  assert.match(component, /<button/)
  assert.match(component, /reveal\.primaryActionLabel/)
  assert.match(component, /reveal\.secondaryActionLabel/)
  assert.match(component, /\{developerMode && \(/)
  assert.match(component, /aria-label=.*XP earned/)
})

test('Continue closes to Dashboard and View in Passport opens Discoveries', () => {
  const app = source('../../App.jsx')
  const closeStart = app.indexOf('function closeRewardCelebration')
  const viewStart = app.indexOf('function viewCelebratedDiscovery')
  assert.match(app.slice(closeStart, viewStart), /setBookOpen\(false\)/)
  assert.match(
    app.slice(viewStart, app.indexOf('function repeatLastClaim', viewStart)),
    /DASHBOARD_PASSPORT_TARGETS\.rewardDiscovery/
  )
})

test('responsive CSS supports 320px layouts and reduced motion', () => {
  const css = source('./rewardReveal.css')
  assert.match(css, /@media \(max-width: 360px\)/)
  assert.match(css, /overflow-x: hidden/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /animation: none !important/)
})
