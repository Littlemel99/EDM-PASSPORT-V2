import {
  COLLECTION_STATES,
  DISCOVERY_STATES,
} from './AdventureEngine.js'

export function selectAvailableDiscoveries(adventureState) {
  return (
    adventureState?.discoveries?.filter(
      (item) => item.state === DISCOVERY_STATES.AVAILABLE
    ) || []
  )
}

export function selectHiddenDiscoveryCount(adventureState) {
  return (
    adventureState?.progression?.hiddenDiscoveries ||
    0
  )
}

export function selectActiveCollections(adventureState) {
  return (
    adventureState?.collections?.filter((item) =>
      [
        COLLECTION_STATES.IN_PROGRESS,
        COLLECTION_STATES.LOCKED,
        COLLECTION_STATES.HIDDEN,
      ].includes(item.state)
    ) || []
  )
}

export function selectCurrentQuest(adventureState) {
  return adventureState?.currentQuest || null
}

export function selectNextRecommendedAction(adventureState) {
  return adventureState?.nextRecommendedAction || null
}

export function selectRewardCandidates(adventureState) {
  return adventureState?.rewardCandidates || []
}

export function selectAdventureProgress(adventureState) {
  return adventureState?.progression || null
}

export function selectNewlyUnlockedItems(adventureState) {
  return adventureState?.newlyUnlockedItems || []
}
