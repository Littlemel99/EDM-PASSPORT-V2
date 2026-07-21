import {
  DISCOVERY_RARITIES,
  DISCOVERY_VISIBILITY,
} from '../adventure/constants.js'

const FESTIVAL_ID = 'lost-lands-2026'
const COMMON_XP = 100
const RARE_XP = 300
const EPIC_XP = 750
const LEGENDARY_XP = 1000

function createDiscovery(discovery) {
  return {
    festivalId: FESTIVAL_ID,
    image: null,
    visibility: DISCOVERY_VISIBILITY.VISIBLE,
    claimMethods: [],
    sourceType: 'festival-catalog',
    ...discovery,
  }
}

export const lostLands2026Discoveries = [
  createDiscovery({
    id: 'lost-lands-prehistoric-stage',
    name: 'Prehistoric Stage',
    shortName: 'Prehistoric Stage',
    description:
      'Discover the festival’s central prehistoric performance environment.',
    category: 'stage',
    rarity: DISCOVERY_RARITIES.RARE,
    xp: RARE_XP,
    location: 'The Prehistoric Stage',
    fallback: '🦖',
  }),
  createDiscovery({
    id: 'lost-lands-crater',
    name: 'The Crater',
    shortName: 'The Crater',
    description: 'Explore the expanded Crater stage area.',
    category: 'stage',
    rarity: DISCOVERY_RARITIES.RARE,
    xp: RARE_XP,
    location: 'The Crater',
    fallback: '🌋',
  }),
  createDiscovery({
    id: 'lost-lands-village-marketplace',
    name: 'Village Marketplace',
    shortName: 'Village Marketplace',
    description:
      'Explore the festival’s marketplace and community activity area.',
    category: 'experience',
    rarity: DISCOVERY_RARITIES.UNCOMMON,
    xp: COMMON_XP,
    location: 'Village Marketplace',
    fallback: '🏕️',
  }),
  createDiscovery({
    id: 'lost-lands-discovery-center',
    name: 'Discovery Center',
    shortName: 'Discovery Center',
    description:
      'Find workshops, meetups, skills, classes, and crafts hosted by community Oracles.',
    category: 'community',
    rarity: DISCOVERY_RARITIES.UNCOMMON,
    xp: COMMON_XP,
    location: 'Discovery Center at Village Marketplace',
    fallback: '🔮',
  }),
  createDiscovery({
    id: 'lost-lands-builders-installation',
    name: 'Builders Program Installation',
    shortName: 'Builders Installation',
    description:
      'Discover an immersive installation created through the Lost Lands Builders Program.',
    category: 'art',
    rarity: DISCOVERY_RARITIES.EPIC,
    xp: EPIC_XP,
    location: 'Festival grounds',
    fallback: '🛠️',
  }),
  createDiscovery({
    id: 'lost-lands-dinosaur-encounter',
    name: 'Dinosaur Encounter',
    shortName: 'Dinosaur Encounter',
    description:
      'Find one of the dinosaurs or prehistoric environmental landmarks.',
    category: 'landmark',
    rarity: DISCOVERY_RARITIES.EPIC,
    xp: EPIC_XP,
    location: 'Prehistoric festival grounds',
    fallback: '🦕',
  }),
  createDiscovery({
    id: 'lost-lands-thursday-pre-party',
    name: 'Thursday Pre-Party',
    shortName: 'Thursday Pre-Party',
    description: 'Attend the official Thursday early-entry Pre-Party.',
    category: 'event',
    rarity: DISCOVERY_RARITIES.LEGENDARY,
    xp: LEGENDARY_XP,
    location: 'The Prehistoric Stage or The Crater',
    fallback: '⚡',
  }),
  createDiscovery({
    id: 'lost-lands-sacred-code',
    name: 'Sacred Code',
    shortName: 'Sacred Code',
    description:
      'Participate in the Leave No Trace culture that protects Legend Valley.',
    category: 'community',
    rarity: DISCOVERY_RARITIES.UNCOMMON,
    xp: COMMON_XP,
    location: 'Festival or campground',
    fallback: '♻️',
  }),
  createDiscovery({
    id: 'lost-lands-camping-arrival',
    name: 'Camping Arrival',
    shortName: 'Camping Arrival',
    description:
      'Begin the Lost Lands adventure through the camping or early-entry experience.',
    category: 'journey',
    rarity: DISCOVERY_RARITIES.COMMON,
    xp: COMMON_XP,
    location: 'Lost Lands campgrounds',
    fallback: '⛺',
  }),
  createDiscovery({
    id: 'lost-lands-prehistoric-explorer',
    name: 'Prehistoric Explorer',
    shortName: 'Prehistoric Explorer',
    description: 'Complete the core Lost Lands discovery trail.',
    category: 'achievement',
    rarity: DISCOVERY_RARITIES.LEGENDARY,
    xp: LEGENDARY_XP,
    location: 'Lost Lands 2026',
    fallback: '🏆',
    claimable: false,
    sourceType: 'derived-achievement',
  }),
]
