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

export function getResolvedDisplayMode(
  mode: ItemLinkDisplayMode,
  metadata: MetadataWithEmbed,
): ItemLinkDisplayMode {
  if (mode === 'embed' && !isEmbedModeAvailable(metadata)) {
    return 'bookmark';
  }

  return mode;
}
