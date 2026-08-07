import type { ProviderSpecificMetadata } from './provider-metadata';

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

function extractVideoUrls(html: string, baseUrl: URL): string[] {
  const rawMatches =
    html.match(/https?:\/\/video\.twimg\.com\/[^"'<>\\\s]+(?:\.mp4|\.m3u8)[^"'<>\\\s]*/gi) ?? [];

  const urls = rawMatches
    .map((value) => decodeHtmlEntities(value))
    .map((value) => resolveMaybeRelativeUrl(value, baseUrl))
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(urls));
}

export function extractXProviderMetadata(html: string, baseUrl: URL): ProviderSpecificMetadata {
  // We intentionally do NOT extract images here from <link rel="preload" as="image"> tags.
  //
  // X's server-side render preloads images for the entire conversation thread
  // (parent tweets, the current tweet, and visible replies) in a single <head> block.
  // There is no reliable way to isolate which preloaded images belong specifically to
  // the tweet being viewed vs. context tweets without parsing X's embedded page JSON.
  //
  // Relying on preloads caused three categories of bugs:
  //   1. Avatar images (pbs.twimg.com/profile_images/) appearing as content images.
  //   2. Images from replied-to tweets included in the preview.
  //   3. Images from reply tweets included in the preview.
  //
  // We therefore delegate image extraction entirely to the og:image / twitter:image
  // meta tags parsed by fetchOpenGraphAction, which are always scoped to the
  // specific tweet. The trade-off is that multi-image tweets (up to 4 in X's UI)
  // will only surface one image until a more reliable extraction strategy is added
  // (e.g. parsing the __NEXT_DATA__ JSON embedded in X's page HTML).
  return {
    videoUrls: extractVideoUrls(html, baseUrl),
  };
}
