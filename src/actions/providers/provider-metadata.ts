export type ProviderSpecificMetadata = {
  images?: string[];
  videoUrls?: string[];
  videoType?: string;
  /**
   * Hostnames to exclude from the og:image / twitter:image candidate list.
   *
   * Declared by a provider when it knows that certain CDN hostnames appearing
   * in the page's meta tags are not content images (e.g. channel avatars, banners).
   * The exclusion is applied generically in fetchOpenGraphAction so that file
   * never needs provider-specific conditionals.
   */
  excludeImageHostnames?: string[];
  /**
   * When true, OG images are the authoritative source and oEmbed thumbnails
   * are filtered out during the merge step in fetch-link-metadata.
   *
   * Use this for platforms where the og:image is richer than the oEmbed
   * thumbnail (e.g. music.youtube.com where the og:image is the album artwork
   * at 1400×1400 while oEmbed only gives a video frame thumbnail).
   */
  preferOGImages?: boolean;
};
