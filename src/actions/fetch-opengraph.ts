'use server';

export type OpenGraphMetadata = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
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
  embed?: string;
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

    if (key && content && !(key in map)) {
      map[key] = content;
    }

    tagMatch = metaTagRegex.exec(html);
  }

  return map;
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

    const finalUrl = response.url ? new URL(response.url) : parsedUrl;
    const metaMap = extractMetaContentMap(html);
    const title = getFirstMetaContent(metaMap, ['og:title', 'twitter:title']) ?? getTitle(html);
    const description =
      getFirstMetaContent(metaMap, ['og:description', 'twitter:description', 'description']) ??
      undefined;
    const image = resolveMaybeRelativeUrl(
      getFirstMetaContent(metaMap, ['og:image', 'twitter:image']),
      finalUrl,
    );
    const favicon = extractFaviconUrl(html, finalUrl);
    const canonicalUrl = extractCanonicalUrl(html, finalUrl);
    const siteName = getFirstMetaContent(metaMap, ['og:site_name']);
    const imageAlt = getFirstMetaContent(metaMap, ['og:image:alt', 'twitter:image:alt']);
    const type = getFirstMetaContent(metaMap, ['og:type']);
    const locale = getFirstMetaContent(metaMap, ['og:locale']);
    const author = getFirstMetaContent(metaMap, ['author', 'article:author']);
    const publishedTime = getFirstMetaContent(metaMap, ['article:published_time']);
    const modifiedTime = getFirstMetaContent(metaMap, ['article:modified_time']);
    const keywords = getFirstMetaContent(metaMap, ['keywords']);
    const language = getFirstMetaContent(metaMap, ['language']);
    const twitterCard = getFirstMetaContent(metaMap, ['twitter:card']);
    const twitterSite = getFirstMetaContent(metaMap, ['twitter:site']);
    const twitterCreator = getFirstMetaContent(metaMap, ['twitter:creator']);

    return {
      metadata: {
        url: finalUrl.toString(),
        title,
        description,
        image,
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
        raw: metaMap,
      },
    };
  } catch {
    return { error: 'Could not fetch URL metadata.' };
  }
}
