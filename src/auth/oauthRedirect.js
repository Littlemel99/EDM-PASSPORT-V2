export function getOAuthRedirectUrl(origin) {
  const normalizedOrigin = String(origin || '').trim().replace(/\/+$/, '')
  if (!normalizedOrigin) return '/'
  return `${normalizedOrigin}/`
}
