const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i
const HTTP_SCHEME = /^https?:\/\//i

/**
 * Turns a user-entered endpoint into an absolute HTTP(S) URL.
 * Explicit HTTP/HTTPS is preserved. Local targets default to HTTP; public
 * targets default to HTTPS when the protocol is omitted.
 */
export function normalizeHttpUrl(value: string): string {
  const raw = value.trim()
  if (!raw) throw new Error('Enter an endpoint URL.')
  if (EXPLICIT_SCHEME.test(raw) && !HTTP_SCHEME.test(raw)) throw new Error('Only HTTP and HTTPS URLs are supported.')

  const withoutSlashes = raw.startsWith('//') ? raw.slice(2) : raw
  if (HTTP_SCHEME.test(withoutSlashes)) return new URL(withoutSlashes).toString()

  const host = new URL(`http://${withoutSlashes}`).hostname.replace(/^\[|\]$/g, '').toLowerCase()
  const local = host === 'localhost' || host === '::1' || /^127(?:\.\d{1,3}){3}$/.test(host) || host.endsWith('.localhost')
  return new URL(`${local ? 'http' : 'https'}://${withoutSlashes}`).toString()
}

export function isLoopbackHttpUrl(value: string): boolean {
  const host = new URL(normalizeHttpUrl(value)).hostname.replace(/^\[|\]$/g, '').toLowerCase()
  return host === 'localhost' || host === '::1' || /^127(?:\.\d{1,3}){3}$/.test(host) || host.endsWith('.localhost')
}
