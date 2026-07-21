import { festivals } from '../data/festivals.js'
import { stamps } from '../data/stamps.js'
import { stageLocations } from '../data/stageLocations.js'

const festivalRecord = festivals.find(
  (festival) => festival.id === 'edc-las-vegas-2026'
)
const stampById = new Map(stamps.map((stamp) => [stamp.id, stamp]))

export const edcLasVegas2026 = {
  id: 'edc-las-vegas-2026',
  festivalBrandId: 'edc-las-vegas',
  year: 2026,
  name: festivalRecord?.name || 'EDC Las Vegas 2026',
  displayName: festivalRecord?.name || 'EDC Las Vegas 2026',
  shortName: 'EDC Las Vegas',
  country: 'United States',
  city: 'Las Vegas',
  region: 'Nevada',
  venue: null,
  timezone: null,
  startDate: festivalRecord?.startDate || null,
  endDate: festivalRecord?.endDate || null,
  status: festivalRecord?.status || null,
  description: null,
  logo: null,
  heroImage: null,
  mapImage: null,
  theme: {
    name: null,
    tagline: null,
    description: null,
    palette: [],
    artworkDirection: null,
    typographyDirection: null,
    effects: [],
  },
  stages: Object.keys(stageLocations).map((discoveryId) => ({
    id: discoveryId,
    name: stampById.get(discoveryId)?.name || discoveryId,
    discoveryId,
  })),
  artists: [],
  discoveryIds: stamps.map((stamp) => stamp.id),
  missionIds: [],
  rewardIds: [],
  liveDropIds: [],
  gpsDropIds: [],
}
