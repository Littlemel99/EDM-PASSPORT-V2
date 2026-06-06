export const festivals = [
  {
    id: 'edc-las-vegas-2026',
    name: 'EDC Las Vegas 2026',
    location: 'Las Vegas, Nevada',
    status: 'upcoming',
    startDate: '2026-05-15',
    endDate: '2026-05-17',
    bannerUrl: '',
    mapUrl: '',
  },
  {
    id: 'tomorrowland-2026',
    name: 'Tomorrowland 2026',
    location: 'Boom, Belgium',
    status: 'upcoming',
    startDate: '2026-07-17',
    endDate: '2026-07-26',
    bannerUrl: '',
    mapUrl: '',
  },
  {
    id: 'ultra-miami-2026',
    name: 'Ultra Miami 2026',
    location: 'Miami, Florida',
    status: 'upcoming',
    startDate: '2026-03-27',
    endDate: '2026-03-29',
    bannerUrl: '',
    mapUrl: '',
  },
  {
    id: 'edc-las-vegas-2025',
    name: 'EDC Las Vegas 2025',
    location: 'Las Vegas, Nevada',
    status: 'attended',
    startDate: '2025-05-16',
    endDate: '2025-05-18',
    bannerUrl: '',
    mapUrl: '',
  },
]

export function getFestivalById(id) {
  return festivals.find((festival) => festival.id === id) || festivals[0]
}
