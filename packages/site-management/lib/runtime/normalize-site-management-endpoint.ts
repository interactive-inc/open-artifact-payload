export function normalizeSiteManagementEndpoint(value: string): string | Error {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return new Error(`Invalid endpoint URL: ${value}`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return new Error(`Endpoint must use http or https: ${value}`)
  }
  if (url.username.length > 0 || url.password.length > 0) {
    return new Error('Endpoint must not include credentials')
  }
  if (url.search.length > 0 || url.hash.length > 0) {
    return new Error('Endpoint must not include a query string or fragment')
  }
  if (url.protocol === 'http:' && !isLoopbackHostname(url.hostname)) {
    return new Error(`Non-local endpoints must use https: ${value}`)
  }

  return url.toString().replace(/\/+$/, '')
}

export function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  )
}
