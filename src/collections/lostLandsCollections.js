const FESTIVAL_ID = 'lost-lands-2026'

function createCollection(collection) {
  return {
    festivalId: FESTIVAL_ID,
    artwork: null,
    theme: null,
    featured: false,
    ...collection,
  }
}

export const lostLandsCollections = [
  createCollection({
    id: 'lost-lands-stages',
    name: 'Stages',
    shortName: 'Stages',
    description: 'Discover the core performance environments of Lost Lands.',
    discoveryIds: [
      'lost-lands-prehistoric-stage',
      'lost-lands-crater',
    ],
    displayOrder: 1,
    featured: true,
  }),
  createCollection({
    id: 'lost-lands-exploration',
    name: 'Exploration',
    shortName: 'Exploration',
    description:
      'Follow the festival trail through community spaces and prehistoric landmarks.',
    discoveryIds: [
      'lost-lands-village-marketplace',
      'lost-lands-discovery-center',
      'lost-lands-dinosaur-encounter',
    ],
    displayOrder: 2,
    featured: true,
  }),
  createCollection({
    id: 'lost-lands-community',
    name: 'Community',
    shortName: 'Community',
    description:
      'Take part in the shared culture, workshops, and stewardship of the festival.',
    discoveryIds: [
      'lost-lands-sacred-code',
      'lost-lands-discovery-center',
    ],
    displayOrder: 3,
  }),
  createCollection({
    id: 'lost-lands-camping',
    name: 'Camping',
    shortName: 'Camping',
    description:
      'Mark the arrival experiences that begin the Lost Lands weekend.',
    discoveryIds: [
      'lost-lands-camping-arrival',
      'lost-lands-village-marketplace',
    ],
    displayOrder: 4,
  }),
  createCollection({
    id: 'lost-lands-art',
    name: 'Art',
    shortName: 'Art',
    description:
      'Find immersive builds and prehistoric environments across the grounds.',
    discoveryIds: [
      'lost-lands-builders-installation',
      'lost-lands-dinosaur-encounter',
    ],
    displayOrder: 5,
  }),
  createCollection({
    id: 'lost-lands-event-moments',
    name: 'Event Moments',
    shortName: 'Moments',
    description: 'Collect the limited moments that define the festival edition.',
    discoveryIds: ['lost-lands-thursday-pre-party'],
    displayOrder: 6,
  }),
]
