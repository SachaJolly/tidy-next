import type { ProviderSpecificMetadata } from './provider-metadata';

/**
 * Provider metadata for Spotify.
 *
 * Spotify's oEmbed response already provides title, thumbnail, and embed HTML.
 * There are currently no image filtering or ordering overrides needed.
 * This file exists as a dedicated place to add Spotify-specific logic in the
 * future (e.g. podcast episode images, playlist covers, high-res artwork).
 */
export function extractSpotifyProviderMetadata(): ProviderSpecificMetadata {
  return {};
}
