import type { ItemLinkDisplayMode } from '@/components/ItemLink/ItemLink.types';

type MetadataWithEmbed =
  | {
      embed?: string | null;
      videoUrl?: string | null;
    }
  | null
  | undefined;

export function isEmbedModeAvailable(metadata: MetadataWithEmbed): boolean {
  const hasEmbedHtml = typeof metadata?.embed === 'string' && metadata.embed.trim().length > 0;
  const hasVideoUrl = typeof metadata?.videoUrl === 'string' && metadata.videoUrl.trim().length > 0;

  return hasEmbedHtml || hasVideoUrl;
}

export function isDisplayModeAvailable(
  mode: ItemLinkDisplayMode,
  metadata: MetadataWithEmbed,
): boolean {
  if (mode === 'embed') {
    return isEmbedModeAvailable(metadata);
  }

  return true;
}

/**
 * Narrows a stored display mode to the three shapes `ItemLink` can actually draw.
 *
 * `ItemLink` defaults to 'link', so everything that is not a bookmark or an embed has to
 * land there too — 'text', a missing value, or a mode the API grows later. Sharing this
 * rule is what keeps the card, its loading skeleton and the dropdown talking about the
 * same shape; when they each had their own fallback they disagreed on 'text'.
 */
export function toItemLinkDisplayMode(mode: string | null | undefined): ItemLinkDisplayMode {
  return mode === 'bookmark' || mode === 'embed' ? mode : 'link';
}

export function getResolvedDisplayMode(
  mode: ItemLinkDisplayMode,
  metadata: MetadataWithEmbed,
): ItemLinkDisplayMode {
  if (mode === 'embed' && !isEmbedModeAvailable(metadata)) {
    return 'bookmark';
  }

  return mode;
}
