const PENDING_CLAIM_KEY = 'edm-pending-claim'

export function getClaimIdFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('claim') || ''
}

export function savePendingClaim(claimId) {
  if (!claimId) return
  localStorage.setItem(PENDING_CLAIM_KEY, claimId)
}

export function getPendingClaim() {
  return localStorage.getItem(PENDING_CLAIM_KEY) || ''
}

export function clearPendingClaim() {
  localStorage.removeItem(PENDING_CLAIM_KEY)
}

export function cleanClaimUrl() {
  const cleanUrl = window.location.origin + window.location.pathname
  window.history.replaceState({}, '', cleanUrl)
}
