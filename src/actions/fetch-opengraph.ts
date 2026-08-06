'use server';

import { extractJsonLdMetadata } from '@/lib/jsonld-metadata';
import { extractProviderSpecificMetadata } from '@/actions/providers';

/**
 * OpenGraph/HTML metadata strategy.
 *
 * Responsibilities:
 * - Fetch the target page HTML server-side (avoids browser CORS limitations).
 * - Extract OG + Twitter card tags, canonical URL, favicon, and fallback title.
 * - Enrich with JSON-LD when OG is partial.
 * - Build a normalized image list (`images[]`) for multi-image previews.
 *
 * This action is intentionally independent from provider routing:
 * routing/fallback policy lives in `fetch-link-metadata.ts` (orchestrator).
 */
export type OpenGraphMetadata = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  imageAlt?: string;
  favicon?: string;
  siteName?: string;
  type?: string;
  locale?: string;
  canonicalUrl?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string;
  language?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  videoUrl?: string;
  videoUrls?: string[];
  videoType?: string;
  jsonLdType?: string;
  embed?: string;
  provider?: string;
  metadataSource?: 'opengraph' | 'oembed' | 'combined';
  raw?: Record<string, string>;
};

export type FetchOpenGraphResult = {
  metadata?: OpenGraphMetadata;
  error?: string;
};

const FETCH_TIMEOUT_MS = 10_000;

const BROWSER_HEADERS: HeadersInit = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  // A browser-like UA avoids some naive bot-blocking 403 responses.
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
};

const FALLBACK_HEADERS: HeadersInit = {
  Accept: 'text/html,application/xhtml+xml',
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

async function fetchHtmlResponse(url: string): Promise<Response> {
  const attempts: HeadersInit[] = [BROWSER_HEADERS, FALLBACK_HEADERS];
  let lastResponse: Response | null = null;

  // We try a browser-like request first, then a lighter fallback header set.
  // This improves compatibility with sites that aggressively filter bots.
  for (const headers of attempts) {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers,
    });

    if (response.ok) {
      return response;
    }

    lastResponse = response;

    // Retry on auth/challenge style blocks; otherwise keep current response.
    if (response.status !== 401 && response.status !== 403 && response.status !== 429) {
      break;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw new Error('No response from metadata fetch attempts.');
}

function isPrivateHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  if (
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('.local')
  ) {
    return true;
  }

  if (/^127\./.test(normalized) || /^10\./.test(normalized) || /^192\.168\./.test(normalized)) {
    return true;
  }

  const match172 = normalized.match(/^172\.(\d{1,3})\./);
  if (match172) {
    const secondOctet = Number(match172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  return false;
}

function extractHtmlTagAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*(["'])(.*?)\2/g;

  let match = attrRegex.exec(tag);
  while (match) {
    attributes[match[1].toLowerCase()] = decodeHtmlEntities(match[3].trim());
    match = attrRegex.exec(tag);
  }

  return attributes;
}

function extractMetaContentMap(html: string): Record<string, string> {
  const map: Record<string, string> = {};
  const metaTagRegex = /<meta\b[^>]*>/gi;

  let tagMatch = metaTagRegex.exec(html);
  while (tagMatch) {
    const attrs = extractHtmlTagAttributes(tagMatch[0]);
    const key = (attrs.property ?? attrs.name)?.toLowerCase();
    const content = attrs.content;

    // Keep the first value seen for each key to preserve page author intent
    // and avoid noisy overrides from duplicate tags lower in the document.
    if (key && content && !(key in map)) {
      map[key] = content;
    }

    tagMatch = metaTagRegex.exec(html);
  }

  return map;
}

function extractMetaContentValues(html: string, selectors: string[]): string[] {
  const values: string[] = [];
  const seen = new Set<string>();
  const targetKeys = new Set(selectors.map((selector) => selector.toLowerCase()));
  const metaTagRegex = /<meta\b[^>]*>/gi;

  let tagMatch = metaTagRegex.exec(html);
  while (tagMatch) {
    const attrs = extractHtmlTagAttributes(tagMatch[0]);
    const key = (attrs.property ?? attrs.name)?.toLowerCase();
    const content = attrs.content;

    // Skip irrelevant meta tags early for performance on very large pages.
    if (!key || !content || !targetKeys.has(key)) {
      tagMatch = metaTagRegex.exec(html);
      continue;
    }

    if (!seen.has(content)) {
      seen.add(content);
      values.push(content);
    }

    tagMatch = metaTagRegex.exec(html);
  }

  return values;
}

function extractVideoUrls(html: string, baseUrl: URL): string[] {
  const metaVideoValues = extractMetaContentValues(html, [
    'og:video',
    'og:video:url',
    'og:video:secure_url',
    'twitter:player:stream',
  ])
    .map((value) => resolveMaybeRelativeUrl(value, baseUrl))
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(metaVideoValues));
}

function getPreferredVideoUrl(videoUrls: string[]): string | undefined {
  if (videoUrls.length === 0) {
    return undefined;
  }

  const withScore = videoUrls.map((urlValue) => {
    let score = 0;

    if (/\.mp4(?:\?|$)/i.test(urlValue)) {
      score += 10_000;
    }

    if (/\.m3u8(?:\?|$)/i.test(urlValue)) {
      score += 5_000;
    }

    const resolutionMatch = urlValue.match(/\/(\d{2,5})x(\d{2,5})\//);
    if (resolutionMatch) {
      const width = Number(resolutionMatch[1]);
      const height = Number(resolutionMatch[2]);
      if (Number.isFinite(width) && Number.isFinite(height)) {
        score += width * height;
      }
    }

    return { urlValue, score };
  });

  withScore.sort((a, b) => b.score - a.score);
  return withScore[0]?.urlValue;
}

function inferVideoType(
  videoUrl: string | undefined,
  explicitVideoType: string | undefined,
): string | undefined {
  if (explicitVideoType?.trim()) {
    return explicitVideoType.trim();
  }

  if (!videoUrl) {
    return undefined;
  }

  if (/\.m3u8(?:\?|$)/i.test(videoUrl)) {
    return 'application/x-mpegURL';
  }
  if (/\.mp4(?:\?|$)/i.test(videoUrl)) {
    return 'video/mp4';
  }

  return undefined;
}

function getImageAssetKey(urlValue: string): string {
  try {
    const parsed = new URL(urlValue);
    const hostname = parsed.hostname.toLowerCase();

    // X image assets often appear as several size variants for the same media.
    // We collapse variants so one tweet image doesn't appear as fake duplicates.
    if (hostname === 'pbs.twimg.com' || hostname.endsWith('.pbs.twimg.com')) {
      const mediaMatch = parsed.pathname.match(/^\/media\/([^./?:]+)/);
      if (mediaMatch) {
        return `pbs:${mediaMatch[1]}`;
      }
    }

    return parsed.toString();
  } catch {
    return urlValue;
  }
}

function dedupeImagesByAsset(urls: string[]): string[] {
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const urlValue of urls) {
    const key = getImageAssetKey(urlValue);
    // Deduping by logical asset key avoids duplicates where only size/format changes.
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(urlValue);
  }

  return deduped;
}

function getFirstMetaContent(map: Record<string, string>, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const content = map[selector.toLowerCase()];
    if (content) {
      return content;
    }
  }

  return undefined;
}

function extractCanonicalUrl(html: string, baseUrl: URL): string | undefined {
  const linkTagRegex = /<link\b[^>]*>/gi;
  let tagMatch = linkTagRegex.exec(html);

  while (tagMatch) {
    const attrs = extractHtmlTagAttributes(tagMatch[0]);
    const rel = attrs.rel?.toLowerCase() ?? '';
    if (rel.split(/\s+/).includes('canonical') && attrs.href) {
      return resolveMaybeRelativeUrl(attrs.href, baseUrl);
    }
    tagMatch = linkTagRegex.exec(html);
  }

  return undefined;
}

function extractFaviconUrl(html: string, baseUrl: URL): string | undefined {
  const linkTagRegex = /<link\b[^>]*>/gi;
  let tagMatch = linkTagRegex.exec(html);

  while (tagMatch) {
    const attrs = extractHtmlTagAttributes(tagMatch[0]);
    const rel = attrs.rel?.toLowerCase() ?? '';
    if (rel.includes('icon') && attrs.href) {
      return resolveMaybeRelativeUrl(attrs.href, baseUrl);
    }
    tagMatch = linkTagRegex.exec(html);
  }

  return resolveMaybeRelativeUrl('/favicon.ico', baseUrl);
}

function getTitle(html: string): string | undefined {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeHtmlEntities(titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || '') || undefined;
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

export async function fetchOpenGraphAction(rawUrl: string): Promise<FetchOpenGraphResult> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return { error: 'Invalid URL.' };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { error: 'Only HTTP(S) URLs are supported.' };
  }

  if (isPrivateHostname(parsedUrl.hostname)) {
    return { error: 'Private network URLs are not allowed.' };
  }

  try {
    const response = await fetchHtmlResponse(parsedUrl.toString());

    if (!response.ok) {
      if (response.status === 403) {
        return { error: 'This website blocks metadata fetching (HTTP 403).' };
      }
      return { error: `Unable to fetch URL metadata (HTTP ${response.status}).` };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      return { error: 'URL does not return an HTML document.' };
    }

    const html = await response.text();

    // Use the post-redirect URL as canonical base for resolving relative assets.
    // This prevents broken image/favicon links when the initial URL redirects.
    const finalUrl = response.url ? new URL(response.url) : parsedUrl;
    const metaMap = extractMetaContentMap(html);
    const jsonLdMetadata = extractJsonLdMetadata(html, finalUrl);
    const providerMetadata = extractProviderSpecificMetadata(finalUrl, html);
    const ogImageValues = extractMetaContentValues(html, ['og:image', 'twitter:image'])
      .map((value) => resolveMaybeRelativeUrl(value, finalUrl))
      .filter((value): value is string => Boolean(value));
    const imageCandidates = [
      ...(providerMetadata.images ?? []),
      ...ogImageValues,
      ...(jsonLdMetadata?.images ?? []),
    ];
    // Keep first-seen order, then remove asset-level duplicates (important for X variants).
    const images = dedupeImagesByAsset(Array.from(new Set(imageCandidates)));
    const videoUrls = Array.from(
      new Set([...(providerMetadata.videoUrls ?? []), ...extractVideoUrls(html, finalUrl)]),
    );
    const videoUrl = getPreferredVideoUrl(videoUrls);
    const title =
      getFirstMetaContent(metaMap, ['og:title', 'twitter:title']) ??
      jsonLdMetadata?.title ??
      getTitle(html);
    const description =
      getFirstMetaContent(metaMap, ['og:description', 'twitter:description', 'description']) ??
      jsonLdMetadata?.description ??
      undefined;
    const image =
      resolveMaybeRelativeUrl(
        getFirstMetaContent(metaMap, ['og:image', 'twitter:image']),
        finalUrl,
      ) ??
      images[0] ??
      jsonLdMetadata?.image ??
      undefined;
    const favicon = extractFaviconUrl(html, finalUrl);
    const canonicalUrl = extractCanonicalUrl(html, finalUrl);
    const siteName = getFirstMetaContent(metaMap, ['og:site_name']) ?? jsonLdMetadata?.siteName;
    const imageAlt = getFirstMetaContent(metaMap, ['og:image:alt', 'twitter:image:alt']);
    const type = getFirstMetaContent(metaMap, ['og:type']) ?? jsonLdMetadata?.type;
    const locale = getFirstMetaContent(metaMap, ['og:locale']);
    const author =
      getFirstMetaContent(metaMap, ['author', 'article:author']) ?? jsonLdMetadata?.author;
    const publishedTime =
      getFirstMetaContent(metaMap, ['article:published_time']) ?? jsonLdMetadata?.publishedTime;
    const modifiedTime =
      getFirstMetaContent(metaMap, ['article:modified_time']) ?? jsonLdMetadata?.modifiedTime;
    const keywords = getFirstMetaContent(metaMap, ['keywords']) ?? jsonLdMetadata?.keywords;
    const language = getFirstMetaContent(metaMap, ['language']) ?? jsonLdMetadata?.language;
    const twitterCard = getFirstMetaContent(metaMap, ['twitter:card']);
    const twitterSite = getFirstMetaContent(metaMap, ['twitter:site']);
    const twitterCreator = getFirstMetaContent(metaMap, ['twitter:creator']);
    const explicitVideoType = getFirstMetaContent(metaMap, ['og:video:type']);
    const videoType = providerMetadata.videoType ?? inferVideoType(videoUrl, explicitVideoType);

    return {
      metadata: {
        url: finalUrl.toString(),
        title,
        description,
        image,
        images: images.length > 0 ? images : undefined,
        imageAlt,
        favicon,
        siteName,
        type,
        locale,
        canonicalUrl,
        author,
        publishedTime,
        modifiedTime,
        keywords,
        language,
        twitterCard,
        twitterSite,
        twitterCreator,
        videoUrl,
        videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
        videoType,
        jsonLdType: jsonLdMetadata?.type,
        metadataSource: 'opengraph',
        raw: metaMap,
      },
    };
  } catch {
    return { error: 'Could not fetch URL metadata.' };
  }
}
