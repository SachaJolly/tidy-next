'use server';

import { detectOEmbedProvider, type OEmbedProvider } from '@/lib/oembed-provider';

export type OEmbedMetadata = {
  provider: OEmbedProvider;
  source: 'oembed';
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  embed?: string;
  siteName?: string;
  author?: string;
  embedUrl?: string;
  width?: number;
  height?: number;
};

export type FetchOEmbedResult = {
  metadata?: OEmbedMetadata;
  provider?: OEmbedProvider;
  unsupported?: boolean;
  error?: string;
};

const OEMBED_TIMEOUT_MS = 8_000;

const OEMBED_HEADERS: HeadersInit = {
  Accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
};

// One endpoint per provider. Keep this switch exhaustive with OEmbedProvider:
// TypeScript then forces us to update routing whenever a new provider is introduced.
function getOEmbedEndpoint(provider: OEmbedProvider, rawUrl: string): string {
  const encodedUrl = encodeURIComponent(rawUrl);

  switch (provider) {
    case 'spotify':
      return `https://open.spotify.com/oembed?url=${encodedUrl}`;
    case 'youtube':
      return `https://www.youtube.com/oembed?url=${encodedUrl}&format=json`;
    case 'vimeo':
      return `https://vimeo.com/api/oembed.json?url=${encodedUrl}`;
    case 'dailymotion':
      return `https://www.dailymotion.com/services/oembed?url=${encodedUrl}`;
    case 'soundcloud':
      return `https://soundcloud.com/oembed?format=json&url=${encodedUrl}`;
    case 'twitter':
      return `https://publish.twitter.com/oembed?url=${encodedUrl}&omit_script=true&dnt=true`;
  }
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Provider-aware oEmbed fetch.
 *
 * Important behavior:
 * - Returns `unsupported: true` for unknown domains so the orchestrator can
 *   continue with OpenGraph (this is not treated as an error).
 * - Normalizes provider payloads into one predictable shape for UI consumption.
 * - Keeps provider-specific raw complexity out of components/forms.
 */
export async function fetchOEmbedMetadataAction(rawUrl: string): Promise<FetchOEmbedResult> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return { error: 'Invalid URL.' };
  }

  const provider = detectOEmbedProvider(parsedUrl);
  // Returning "unsupported" (instead of an error) lets the orchestrator
  // decide to try another strategy without treating this as a hard failure.
  if (!provider) {
    return { unsupported: true };
  }

  try {
    const endpoint = getOEmbedEndpoint(provider, parsedUrl.toString());
    const response = await fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
      headers: OEMBED_HEADERS,
    });

    if (!response.ok) {
      return {
        provider,
        error: `oEmbed request failed (HTTP ${response.status}).`,
      };
    }

    const payload = (await response.json()) as Record<string, unknown>;

    // We normalize provider payloads into one metadata shape so UI/form logic
    // doesn't need provider-specific branches.
    return {
      provider,
      metadata: {
        provider,
        source: 'oembed',
        title: readString(payload, 'title'),
        description: readString(payload, 'description'),
        image: readString(payload, 'thumbnail_url'),
        // Most providers expose a single thumbnail in oEmbed.
        // We still map it to `images[]` so downstream UI can use one contract.
        images: (() => {
          const image = readString(payload, 'thumbnail_url');
          return image ? [image] : undefined;
        })(),
        // `html` is a provider-rendered embed snippet (iframe/blockquote/...).
        // It is used by display_mode = "embed" when available.
        embed: readString(payload, 'html'),
        siteName: readString(payload, 'provider_name'),
        author: readString(payload, 'author_name'),
        embedUrl: readString(payload, 'iframe_url'),
        width: readNumber(payload, 'width'),
        height: readNumber(payload, 'height'),
      },
    };
  } catch {
    return {
      provider,
      error: 'oEmbed request failed.',
    };
  }
}
