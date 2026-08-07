import type { ProviderSpecificMetadata } from './provider-metadata';

// Timeout for the syndication API call. Kept shorter than the main HTML fetch
// timeout because it is a supplemental enrichment step: if it is slow, we'd
// rather return the og:image quickly than block the whole preview.
const SYNDICATION_TIMEOUT_MS = 5_000;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function resolveMaybeRelativeUrl(value: string | undefined, baseUrl: URL): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

/**
 * Extracts the numeric tweet/status ID from an X/Twitter URL.
 *
 * Handles all standard status URL shapes:
 *   - /username/status/1234567890
 *   - /username/status/1234567890/video/1
 *   - /username/status/1234567890?s=46&t=xxx
 *
 * Returns null for non-status pages (profiles, search, home, etc.) so that
 * callers can gracefully skip the syndication fetch on pages with no tweet ID.
 */
function extractTweetId(url: URL): string | null {
  const match = url.pathname.match(/\/status\/(\d+)/);
  return match ? (match[1] ?? null) : null;
}

/**
 * Computes the access token required by the Twitter/X Syndication CDN endpoint.
 *
 * This token formula is baked into the X web client and has been independently
 * documented by the open-source community (FxEmbed, community-archive, etc.):
 *   token = (tweetId / 1e15 * π).toString(base36).replace(trailing zeros and dots, "")
 *
 * It is entirely deterministic — any caller who knows the tweet ID can compute
 * the correct token. No secret, no API key, no authentication required.
 */
function computeSyndicationToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(36)
    .replace(/(0+|\.)/g, '');
}

/**
 * Requests all media attached to a tweet from the Twitter/X Syndication CDN.
 *
 * Background: `cdn.syndication.twimg.com/tweet-result` is the same endpoint
 * used by Twitter's own embedded-tweet widget (platform.twitter.com/widgets.js).
 * Because it is designed for public embeds, it requires NO authentication for
 * public tweets — only the deterministic per-tweet token.
 *
 * Key advantage over og:image scraping: X's HTML only ever exposes the FIRST
 * image of a multi-image tweet in its og:image meta tag. The syndication
 * response's `mediaDetails` array contains ALL images (up to 4 for photos),
 * as well as video/GIF thumbnails.
 *
 * Returns an array of high-quality image URLs (empty array on any failure so
 * this step never blocks the main OG fallback chain).
 */
async function fetchSyndicationImages(id: string): Promise<string[]> {
  const token = computeSyndicationToken(id);
  // We include `lang=en` to get a consistent response regardless of the server's
  // geographic location, and keep the URL minimal to reduce failure surface.
  const endpoint = `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}&lang=en`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      // Never cache: tweet media can be edited/deleted and a stale cached
      // response could expose removed content.
      cache: 'no-store',
      signal: AbortSignal.timeout(SYNDICATION_TIMEOUT_MS),
      headers: {
        Accept: 'application/json',
        // Use a browser-like UA and Referer to match how the X embed widget
        // itself calls this endpoint, reducing the chance of being rate-limited.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        Referer: 'https://x.com/',
      },
    });

    if (!response.ok) {
      // Non-2xx response (e.g. 404 for deleted tweets, 403 for private accounts).
      // Not an error from our perspective — just no media to show.
      return [];
    }

    const payload = (await response.json()) as Record<string, unknown>;

    // `mediaDetails` is the authoritative media array in the syndication response.
    // Each entry represents one attached photo, video, or animated GIF with fields:
    //   - type: "photo" | "video" | "animated_gif"
    //   - media_url_https: pbs.twimg.com URL of the image or video thumbnail
    //   - video_info.variants: array of video stream URLs (not used here — video
    //     stream URLs are already extracted from the page HTML by extractVideoUrls)
    const mediaDetails = payload.mediaDetails;
    if (!Array.isArray(mediaDetails)) {
      return [];
    }

    const images: string[] = [];

    for (const item of mediaDetails) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const media = item as Record<string, unknown>;
      const mediaUrl = typeof media.media_url_https === 'string' ? media.media_url_https : null;
      if (!mediaUrl) {
        continue;
      }

      // Append ?name=large to explicitly request the high-quality variant
      // (~1080px wide). The default response URL has no size param and would
      // serve a smaller thumbnail. We use URL construction to safely handle
      // any edge case where media_url_https already has query parameters.
      try {
        const imageUrl = new URL(mediaUrl);
        imageUrl.searchParams.set('name', 'large');
        images.push(imageUrl.toString());
      } catch {
        // Malformed URL — include the raw value as a best-effort fallback.
        images.push(mediaUrl);
      }
    }

    return images;
  } catch {
    // Any network error, timeout, or JSON parse failure is silently swallowed.
    // The syndication fetch is an optional enrichment step: failures must never
    // prevent the caller from returning at least the og:image from the main HTML.
    return [];
  }
}

/**
 * Scrapes video stream URLs directly from the X page HTML.
 *
 * X embeds video.twimg.com stream URLs in the page's JavaScript bundles.
 * Regex-matching on the raw HTML is a rough approach but reliable enough for
 * the current use-case since we only need to surface a playable video URL —
 * the syndication endpoint already provides the poster/thumbnail image.
 */
function extractVideoUrls(html: string, baseUrl: URL): string[] {
  const rawMatches =
    html.match(/https?:\/\/video\.twimg\.com\/[^"'<>\\\s]+(?:\.mp4|\.m3u8)[^"'<>\\\s]*/gi) ?? [];

  const urls = rawMatches
    .map((value) => decodeHtmlEntities(value))
    .map((value) => resolveMaybeRelativeUrl(value, baseUrl))
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(urls));
}

/**
 * Main entry point for X/Twitter-specific metadata extraction.
 *
 * Strategy:
 * 1. Parse the tweet ID from the URL.
 * 2. Fetch all media from the Syndication CDN (gives us images 1–4 on
 *    multi-image tweets, vs. only image 1 from og:image).
 * 3. Scrape video stream URLs from the page HTML.
 *
 * Image deduplication between syndication and og:image meta tags happens
 * upstream in fetchOpenGraphAction via dedupeImagesByAsset — since both
 * sources use pbs.twimg.com/media/<id> paths, the asset-key logic collapses
 * duplicates and the first-seen (og:image) URL wins for image 1 while
 * syndication-only URLs are appended for images 2–4.
 */
export async function extractXProviderMetadata(
  html: string,
  baseUrl: URL,
): Promise<ProviderSpecificMetadata> {
  const tweetId = extractTweetId(baseUrl);

  // Skip the syndication fetch entirely for non-status pages (profiles,
  // search results, etc.) where there is no tweet ID in the URL.
  const images = tweetId ? await fetchSyndicationImages(tweetId) : [];

  return {
    images: images.length > 0 ? images : undefined,
    videoUrls: extractVideoUrls(html, baseUrl),
  };
}
