import type { ItemLinkDisplayMode } from '@/components/ItemLink/ItemLink.types';

type MetadataWithEmbed =
  | {
      embed?: string | null;
    }
  | null
  | undefined;

export function isEmbedModeAvailable(metadata: MetadataWithEmbed): boolean {
  return typeof metadata?.embed === 'string' && metadata.embed.trim().length > 0;
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
