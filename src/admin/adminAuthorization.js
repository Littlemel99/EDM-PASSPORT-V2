export const ADMIN_ACCOUNT_EMAIL = 'fdruth@gmail.com'

export function canAccessAdminConsole(user) {
  return (
    String(user?.email || '').trim().toLowerCase() ===
    ADMIN_ACCOUNT_EMAIL
  )
}

export function isAdminLocation(location = {}) {
  const pathname = String(location.pathname || '').replace(/\/+$/, '')
  const params = new URLSearchParams(location.search || '')
  return pathname === '/admin' || params.get('admin') === 'true'
}
