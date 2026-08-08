'use server';

import { dedupeImagesByAsset } from '@/lib/dedup-images';
import type { OEmbedMetadata } from '@/actions/fetch-oembed';
import { fetchOEmbedMetadataAction } from '@/actions/fetch-oembed';
import { extractProviderSpecificMetadata } from '@/actions/providers';
import { detectOEmbedProvider } from '@/lib/oembed-provider';
import type { OpenGraphMetadata } from '@/actions/fetch-opengraph';
import { fetchOpenGraphAction } from '@/actions/fetch-opengraph';

/**
 * Orchestrator for link metadata fetching.
 *
 * This action does not parse HTML itself. Its responsibility is to:
 * 1) choose the best fetch strategy for the URL,
 * 2) apply targeted fallback/enrichment when data is incomplete,
 * 3) return one stable metadata contract for the UI.
 */
export type LinkMetadata = OpenGraphMetadata;

export type FetchLinkMetadataResult = {
  metadata?: LinkMetadata;
  error?: string;
};

// Maps oEmbed-only data to the shared metadata contract expected by the form.
function mapOEmbedToLinkMetadata(rawUrl: string, oembed: OEmbedMetadata): LinkMetadata {
  return {
    url: rawUrl,
    title: oembed.title,
    description: oembed.description,
    image: oembed.image,
    images: oembed.images ?? (oembed.image ? [oembed.image] : undefined),
    siteName: oembed.siteName,
    author: oembed.author,
    embed: oembed.embed,
    provider: oembed.provider,
    metadataSource: 'oembed',
  };
}

function hasImageData(metadata: Pick<LinkMetadata, 'image' | 'images'>): boolean {
  return Boolean(
    metadata.image?.trim() ||
    (Array.isArray(metadata.images) && metadata.images.some((value) => value.trim().length > 0)),
  );
}

function needsOpenGraphEnrichment(metadata: LinkMetadata): boolean {
  // For preview quality, we enrich when any core card field is missing.
  return !metadata.title?.trim() || !metadata.description?.trim() || !hasImageData(metadata);
}

function mergeOEmbedWithOpenGraph(
  oembed: LinkMetadata,
  og: LinkMetadata,
  options: { preferOGImages?: boolean } = {},
): LinkMetadata {
  // When the provider signals preferOGImages, OG images take full priority and
  // oEmbed thumbnails are excluded from the merged list. This is used for
  // platforms where the og:image is richer than the oEmbed thumbnail
  // (e.g. music.youtube.com album artwork vs. video-frame thumbnail).
  //
  // Otherwise, OG images still come first in the candidate list so that
  // asset-level deduplication keeps the highest-quality URL for each image
  // (e.g. standard YouTube maxresdefault over oEmbed hqdefault).
  const oembedImageCandidates = options.preferOGImages
    ? []
    : [...(oembed.images ?? []), oembed.image ?? ''];

  const mergedImages = dedupeImagesByAsset(
    [
      ...(og.images ?? []),
      og.image ?? '',
      ...oembedImageCandidates,
    ].filter((value) => value.trim().length > 0),
  );

  return {
    ...og,
    // Keep oEmbed-first values for fields that are usually more domain-specific (like embeds),
    // but fill missing card fields from OpenGraph/JSON-LD.
    title: oembed.title ?? og.title,
    description: oembed.description ?? og.description,
    // Use mergedImages[0] as the primary image: since OG images are placed first
    // in the candidate list, this will be the highest-quality available URL.
    // Fall back to explicit oEmbed or OG image fields only when mergedImages is empty.
    image: mergedImages[0] ?? oembed.image ?? og.image,
    images: mergedImages.length > 0 ? mergedImages : undefined,
    siteName: oembed.siteName ?? og.siteName,
    author: oembed.author ?? og.author,
    embed: oembed.embed ?? og.embed,
    provider: oembed.provider ?? og.provider,
    metadataSource: 'combined',
  };
}

export async function fetchLinkMetadataAction(rawUrl: string): Promise<FetchLinkMetadataResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return { error: 'Invalid URL.' };
  }

  const normalizedUrl = parsedUrl.toString();
  const detectedProvider = detectOEmbedProvider(parsedUrl);

  // Read provider-specific metadata from the URL alone (no HTML fetch needed here).
  // We pass an empty string for html since URL-only providers (YouTube, Spotify)
  // derive their metadata entirely from the URL structure.
  const urlProviderMetadata = await extractProviderSpecificMetadata(parsedUrl, '');

  // Strategy A (provider recognized): oEmbed first.
  // This avoids an unnecessary HTML fetch for platforms where oEmbed is richer/faster.
  if (detectedProvider) {
    const oembedResult = await fetchOEmbedMetadataAction(normalizedUrl);
    if (oembedResult.metadata) {
      const oembedMetadata = mapOEmbedToLinkMetadata(normalizedUrl, oembedResult.metadata);

      // Fast path: if oEmbed already has the card essentials, avoid extra fetches.
      if (!needsOpenGraphEnrichment(oembedMetadata)) {
        return { metadata: oembedMetadata };
      }

      // oEmbed can be sparse on some providers/routes (e.g. X posts without thumbnail/title).
      // In that case, enrich with OG/JSON-LD instead of returning an empty-looking preview.
      const ogEnrichmentResult = await fetchOpenGraphAction(normalizedUrl);
      if (ogEnrichmentResult.metadata) {
        return {
          metadata: mergeOEmbedWithOpenGraph(oembedMetadata, ogEnrichmentResult.metadata, {
            // The provider declares whether OG images should win over oEmbed thumbnails.
            // fetchOpenGraphAction has already applied excludeImageHostnames so the OG
            // image list is already clean at this point.
            preferOGImages: urlProviderMetadata.preferOGImages,
          }),
        };
      }

      // Degraded path: return sparse oEmbed data instead of hard failing the form.
      return { metadata: oembedMetadata };
    }

    // Fallback only on failure: still a single extra request in degraded cases.
    const ogFallbackResult = await fetchOpenGraphAction(normalizedUrl);
    if (ogFallbackResult.metadata) {
      return {
        metadata: {
          ...ogFallbackResult.metadata,
          provider: ogFallbackResult.metadata.provider ?? detectedProvider,
          metadataSource: 'opengraph',
        },
      };
    }

    return {
      error: oembedResult.error ?? ogFallbackResult.error ?? 'Could not fetch URL metadata.',
    };
  }

  // Strategy B (provider unknown): OpenGraph only.
  // We intentionally skip oEmbed here to avoid double-fetch on generic domains.
  const ogResult = await fetchOpenGraphAction(normalizedUrl);
  if (ogResult.metadata) {
    return {
      metadata: {
        ...ogResult.metadata,
        metadataSource: 'opengraph',
      },
    };
  }

  return { error: ogResult.error ?? 'Could not fetch URL metadata.' };
}
