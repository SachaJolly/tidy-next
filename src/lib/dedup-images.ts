/**
 * Shared image deduplication utilities.
 *
 * Several metadata sources (og:image, oEmbed thumbnail, preloaded assets, JSON-LD)
 * can independently reference the same underlying media at different sizes or via
 * different CDN URL formats. These helpers collapse those variants into a single
 * canonical URL per logical asset so the UI does not render duplicate thumbnails.
 */

/**
 * Returns a stable deduplication key for an image URL.
 *
 * For providers known to serve the same image at multiple size variants under
 * different URLs (X/Twitter CDN, YouTube thumbnails), the key is derived from
 * the logical asset identity rather than the raw URL string. All other URLs
 * fall back to their normalized string form.
 */
export function getImageAssetKey(urlValue: string): string {
  try {
    const parsed = new URL(urlValue);
    const hostname = parsed.hostname.toLowerCase();

    // X image assets often appear as several size variants for the same media
    // (e.g. ?name=small vs ?name=large on the same pbs.twimg.com/media/ path).
    // We collapse variants by media ID so one tweet image doesn't appear as
    // fake duplicates.
    if (hostname === 'pbs.twimg.com' || hostname.endsWith('.pbs.twimg.com')) {
      const mediaMatch = parsed.pathname.match(/^\/media\/([^./?:]+)/);
      if (mediaMatch) {
        return `pbs:${mediaMatch[1]}`;
      }
    }

    // YouTube exposes the same video thumbnail under many filenames depending on
    // quality (hqdefault.jpg, mqdefault.jpg, maxresdefault.jpg, sddefault.jpg…).
    // We collapse all quality variants by video ID so the merge step can pick
    // whichever URL it encounters first — provided we put higher-quality sources
    // first in the candidate list before calling dedupeImagesByAsset.
    if (hostname === 'i.ytimg.com' || hostname.endsWith('.i.ytimg.com')) {
      const videoMatch = parsed.pathname.match(/^\/vi(?:_webp)?\/([^/]+)\//);
      if (videoMatch) {
        return `ytimg:${videoMatch[1]}`;
      }
    }

    return parsed.toString();
  } catch {
    return urlValue;
  }
}

/**
 * Deduplicates a list of image URLs by logical asset identity.
 *
 * Preserves the first-seen URL for each asset key (order matters: put
 * higher-quality / more canonical sources first in the input list).
 */
export function dedupeImagesByAsset(urls: string[]): string[] {
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const urlValue of urls) {
    const key = getImageAssetKey(urlValue);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(urlValue);
  }

  return deduped;
}
