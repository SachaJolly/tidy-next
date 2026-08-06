/**
 * Central allowlist for remote media hosts we intentionally proxy through
 * `/api/media-proxy`.
 *
 * Why allowlist (and not "proxy everything"):
 * - Security: we avoid turning our API route into an open proxy.
 * - Reliability: some hosts work better direct, others require proxy headers.
 * - Maintainability: one shared list reused by client mapping + API route checks.
 */
export const MEDIA_PROXY_ALLOWED_HOSTS = [
  // X / Twitter media CDN.
  'twimg.com',
  'video.twimg.com',
  'pbs.twimg.com',

  // Instagram / Meta CDNs.
  'fbcdn.net',
  'scontent.cdninstagram.com',
  'cdninstagram.com',

  // Bluesky CDN.
  'cdn.bsky.app',

  // Video thumbnails / assets.
  'ytimg.com',
  'vimeocdn.com',

  // Reddit media.
  'redd.it',
  'redditmedia.com',

  // Common publisher / asset CDNs.
  'images.ctfassets.net',
  'cdn.prod.website-files.com',
  'cloudfront.net',
] as const;

/**
 * Returns true when a hostname is explicitly allowed for proxying.
 *
 * We match:
 * - exact host: `video.twimg.com`
 * - subdomains: `foo.video.twimg.com`
 *
 * Using lowercase avoids case-related mismatches.
 */
export function isMediaProxyHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  return MEDIA_PROXY_ALLOWED_HOSTS.some(
    (allowed) => normalized === allowed || normalized.endsWith(`.${allowed}`),
  );
}

/**
 * Builds the internal proxy URL used by the frontend for display.
 *
 * Example:
 * `https://video.twimg.com/...` ->
 * `/api/media-proxy?url=https%3A%2F%2Fvideo.twimg.com%2F...`
 */
export function toMediaProxyUrl(sourceUrl: string): string {
  return `/api/media-proxy?url=${encodeURIComponent(sourceUrl)}`;
}

/**
 * Main display URL mapper used by UI components.
 *
 * Behavior summary:
 * 1) If URL is already proxied or local, keep it as-is.
 * 2) If URL is absolute/protocol-relative, proxy only if host is allowlisted.
 * 3) Otherwise return original string (fallback-safe behavior).
 *
 * This is why "some images are proxied and others are not":
 * proxying is conditional on the source host being in MEDIA_PROXY_ALLOWED_HOSTS.
 */
export function toDisplayMediaUrl(sourceUrl: string): string {
  // Defensive trim for values coming from metadata providers.
  const normalized = sourceUrl.trim();

  // Do not double-proxy URLs already routed through our internal endpoint.
  if (normalized.startsWith('/api/media-proxy?')) {
    return normalized;
  }
  // Keep local assets untouched (`/foo.jpg`), but ignore protocol-relative (`//`).
  if (normalized.startsWith('/') && !normalized.startsWith('//')) {
    return normalized;
  }

  // Handle absolute (`https://...`) and protocol-relative (`//...`) URLs only.
  if (/^(https?:)?\/\//i.test(normalized)) {
    // Normalize protocol-relative URLs so URL parsing always succeeds.
    const absolute = normalized.startsWith('//') ? `https:${normalized}` : normalized;

    try {
      const parsed = new URL(absolute);
      // Conditional proxy decision:
      // - allowlisted host => route through /api/media-proxy
      // - any other host   => keep direct URL (no proxy)
      return isMediaProxyHost(parsed.hostname) ? toMediaProxyUrl(absolute) : absolute;
    } catch {
      // If parsing fails, keep original value to avoid hard runtime failures.
      return normalized;
    }
  }

  // Non-http-like values (or malformed strings) are returned unchanged.
  return normalized;
}
