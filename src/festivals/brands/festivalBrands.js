import { getFestivalProfiles } from '../festivalProfiles.js'
import { edcLasVegasBrand } from './edcLasVegas.js'
import { lostLandsBrand } from './lostLands.js'

function clone(value) {
  if (Array.isArray(value)) return value.map(clone)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, clone(item)])
    )
  }
  return value
}

const FESTIVAL_BRANDS = [edcLasVegasBrand, lostLandsBrand]
const editionIds = FESTIVAL_BRANDS.flatMap((brand) => brand.editions)

if (new Set(editionIds).size !== editionIds.length) {
  throw new Error('Festival edition IDs must belong to exactly one brand.')
}

export function getFestivalBrands() {
  return clone(FESTIVAL_BRANDS)
}

export function getFestivalBrand(brandId) {
  const brand = FESTIVAL_BRANDS.find((item) => item.id === brandId)
  return brand ? clone(brand) : null
}

export function getFestivalEditionsByBrand(brandId) {
  return getFestivalProfiles().filter(
    (edition) => edition.festivalBrandId === brandId
  )
}

export function getCurrentFestivalEdition(brandId, date = new Date()) {
  const editions = getFestivalEditionsByBrand(brandId)
  if (!editions.length) return null

  const dateKey = date instanceof Date
    ? date.toISOString().slice(0, 10)
    : String(date).slice(0, 10)
  const activeEdition = editions.find(
    (edition) =>
      edition.startDate &&
      edition.endDate &&
      dateKey >= edition.startDate &&
      dateKey <= edition.endDate
  )

  return activeEdition || editions.sort((a, b) => b.year - a.year)[0]
}

export function getFestivalBrandForEdition(editionId) {
  const edition = getFestivalProfiles().find((item) => item.id === editionId)
  return edition ? getFestivalBrand(edition.festivalBrandId) : null
}

export function groupFestivalEditionsByBrand(editions = []) {
  return editions.reduce((groups, edition) => {
    if (!edition?.festivalBrandId) return groups
    if (!groups[edition.festivalBrandId]) {
      groups[edition.festivalBrandId] = []
    }
    groups[edition.festivalBrandId].push(clone(edition))
    return groups
  }, {})
}

export function getFestivalEditionHistory(brandId) {
  return getFestivalEditionsByBrand(brandId).sort(
    (a, b) => b.year - a.year
  )
}
