const LOCAL_DEVELOPMENT_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
])

export function isDevIncompleteProfileEnabled({
  isDev = false,
  hostname = '',
  search = '',
} = {}) {
  if (!isDev || !LOCAL_DEVELOPMENT_HOSTS.has(hostname)) return false

  return (
    new URLSearchParams(search).get('devIncompleteProfile') === 'true'
  )
}

