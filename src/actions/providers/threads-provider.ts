import type { ProviderSpecificMetadata } from './provider-metadata';

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function extractThreadsImageUrls(html: string): string[] {
  // Threads post media images are generally served from scontent*.cdninstagram.com
  // and include stable media paths (t51.82787-15 / t51.2885-15).
  const rawMatches =
    html.match(
      /https?:\/\/scontent[^"'<>\\\s]*cdninstagram\.com\/v\/t51\.(?:82787|2885)-15\/[^"'<>\\\s]+/gi,
    ) ?? [];

  return dedupe(rawMatches.map((value) => decodeHtmlEntities(value)));
}

function extractThreadsVideoUrls(html: string): string[] {
  // Threads video files can be exposed from scontent CDN paths with mp4 suffix.
  const rawMatches =
    html.match(
      /https?:\/\/scontent[^"'<>\\\s]*cdninstagram\.com\/[^"'<>\\\s]+\.mp4[^"'<>\\\s]*/gi,
    ) ?? [];

  return dedupe(rawMatches.map((value) => decodeHtmlEntities(value)));
}

export function extractThreadsProviderMetadata(html: string): ProviderSpecificMetadata {
  const videoUrls = extractThreadsVideoUrls(html);

  return {
    images: extractThreadsImageUrls(html),
    videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
    videoType: videoUrls.length > 0 ? 'video/mp4' : undefined,
  };
}
