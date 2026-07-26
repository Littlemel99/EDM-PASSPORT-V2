import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearOnboardingDraft,
  initializeAuthenticatedPassport,
  readOnboardingDraft,
  withOperationTimeout,
  writeOnboardingDraft,
} from './authenticatedOnboarding.js'

const user = Object.freeze({ id: 'user-a', email: 'a@example.com' })
const completeProfile = Object.freeze({
  id: user.id,
  rave_name: 'Explorer A',
  country: 'United States',
})

test('first-time account creates its profile and navigates to Directory', async () => {
  const steps = []
  let persistedProfile = null
  let loadCalls = 0
  const result = await initializeAuthenticatedPassport({
    user,
    load: async () => {
      loadCalls += 1
      return persistedProfile
    },
    create: async (_user, draft) => {
      persistedProfile = {
        id: user.id,
        rave_name: draft.raveName,
        country: draft.country,
      }
      return persistedProfile
    },
    draft: { raveName: 'Explorer A', country: 'United States' },
    onStep: (step) => steps.push(step),
  })

  assert.equal(result.destination, 'festival-directory')
  assert.equal(result.profile.id, user.id)
  assert.equal(result.profile.rave_name, 'Explorer A')
  assert.equal(loadCalls, 2)
  assert.ok(steps.includes('PROFILE_CREATE_SUCCESS'))
  assert.ok(steps.includes('PROFILE_RELOAD_SUCCESS'))
  assert.ok(steps.includes('DIRECTORY_NAVIGATION'))
})

test('existing account skips creation and restores its Active Journey', async () => {
  let createCalls = 0
  const result = await initializeAuthenticatedPassport({
    user,
    activeFestivalEditionId: 'lost-lands-2026',
    load: async () => completeProfile,
    create: async () => {
      createCalls += 1
    },
  })

  assert.equal(result.destination, 'festival-dashboard')
  assert.equal(createCalls, 0)
})

test('profile creation failure exits loading with the actual error', async () => {
  await assert.rejects(
    initializeAuthenticatedPassport({
      user,
      load: async () => null,
      create: async () => {
        throw new Error('Profile insert rejected')
      },
      draft: { raveName: 'Explorer A', country: 'United States' },
    }),
    /Profile insert rejected/
  )
})

test('successful write that cannot be reloaded stops onboarding', async () => {
  await assert.rejects(
    initializeAuthenticatedPassport({
      user,
      load: async () => null,
      create: async () => completeProfile,
      draft: { raveName: 'Explorer A', country: 'United States' },
    }),
    /saved but could not be reloaded/
  )
})

test('browser restart restores the persisted rave name without a draft', async () => {
  const result = await initializeAuthenticatedPassport({
    user,
    load: async () => completeProfile,
    create: async () => {
      throw new Error('Existing profile must not be recreated')
    },
    draft: null,
  })

  assert.equal(result.profile.rave_name, 'Explorer A')
  assert.equal(result.created, false)
})

test('profile lookup failure exits loading with the actual error', async () => {
  await assert.rejects(
    initializeAuthenticatedPassport({
      user,
      load: async () => {
        throw new Error('Profile lookup unavailable')
      },
      create: async () => completeProfile,
    }),
    /Profile lookup unavailable/
  )
})

test('a stalled lookup times out instead of spinning forever', async () => {
  await assert.rejects(
    withOperationTimeout(new Promise(() => {}), 5, 'Profile lookup'),
    /Profile lookup timed out/
  )
})

test('retry can complete after an initial lookup failure', async () => {
  let attempts = 0
  const load = async () => {
    attempts += 1
    if (attempts === 1) throw new Error('Temporary lookup error')
    return completeProfile
  }

  await assert.rejects(
    initializeAuthenticatedPassport({ user, load, create: async () => null }),
    /Temporary lookup error/
  )
  const result = await initializeAuthenticatedPassport({
    user,
    load,
    create: async () => null,
  })
  assert.equal(result.destination, 'festival-directory')
})

test('onboarding draft is one-time browser-session state', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }

  assert.equal(
    writeOnboardingDraft(storage, {
      raveName: 'Explorer A',
      country: 'United States',
    }),
    true
  )
  assert.deepEqual(readOnboardingDraft(storage), {
    raveName: 'Explorer A',
    country: 'United States',
  })
  clearOnboardingDraft(storage)
  assert.equal(readOnboardingDraft(storage), null)
})
