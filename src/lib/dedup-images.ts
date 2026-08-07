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

    // All pbs.twimg.com assets (photos, video thumbnails, GIF thumbnails, etc.)
    // follow the pattern: same pathname = same image, different query params =
    // just different size variants (?name=small, ?name=large, ?name=orig, etc.).
    //
    // This covers every pbs.twimg.com path shape:
    //   /media/<id>.jpg                          → tweet photo
    //   /ext_tw_video_thumb/<tweetId>/pu/img/... → video poster/thumbnail
    //   /tweet_video_thumb/<hash>.png            → GIF thumbnail
    //   /profile_images/...                      → avatar (filtered upstream,
    //                                              but harmless to key here)
    //
    // By keying on pathname alone we correctly deduplicate the og:image URL
    // (no params) against the syndication CDN URL (same path + ?name=large)
    // so the same asset never appears twice at different quality levels.
    if (hostname === 'pbs.twimg.com' || hostname.endsWith('.pbs.twimg.com')) {
      return `pbs:${parsed.pathname}`;
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
