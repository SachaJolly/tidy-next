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

function extractPreloadedImageUrls(html: string, baseUrl: URL): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const linkTagRegex = /<link\b[^>]*>/gi;

  const add = (value: string | undefined) => {
    const resolved = resolveMaybeRelativeUrl(value, baseUrl);
    if (!resolved || seen.has(resolved)) {
      return;
    }

    seen.add(resolved);
    urls.push(resolved);
  };

  let tagMatch = linkTagRegex.exec(html);
  while (tagMatch) {
    const attrs = extractHtmlTagAttributes(tagMatch[0]);
    const rel = attrs.rel?.toLowerCase() ?? '';
    const as = attrs.as?.toLowerCase() ?? '';

    if (!rel.split(/\s+/).includes('preload') || as !== 'image') {
      tagMatch = linkTagRegex.exec(html);
      continue;
    }

    add(attrs.href);

    const imageSrcSet = attrs.imagesrcset;
    if (imageSrcSet) {
      const entries = imageSrcSet.split(',');
      for (const entry of entries) {
        const [src] = entry.trim().split(/\s+/);
        add(src);
      }
    }

    tagMatch = linkTagRegex.exec(html);
  }

  return urls;
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
  return {
    images: extractPreloadedImageUrls(html, baseUrl),
    videoUrls: extractVideoUrls(html, baseUrl),
  };
}
