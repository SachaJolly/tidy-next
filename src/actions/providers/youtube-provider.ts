import type { ProviderSpecificMetadata } from './provider-metadata';

/**
 * Provider metadata for YouTube and YouTube Music.
 *
 * Both share the same underlying video platform but have different image semantics:
 *
 * youtube.com (video)
 *   - og:image → yt3.googleusercontent.com = the channel's avatar/banner, NOT the video.
 *     The real video thumbnail (i.ytimg.com) comes from the oEmbed response.
 *     → exclude yt3.googleusercontent.com so only the oEmbed thumbnail is kept.
 *
 * music.youtube.com (music)
 *   - og:image → yt3.googleusercontent.com = the album/artist artwork (1400×1400).
 *     This IS the correct cover image for a music track.
 *   - oEmbed thumbnail → i.ytimg.com = a video frame, irrelevant for music.
 *     → exclude i.ytimg.com and prefer OG so the artwork wins.
 */
export function extractYouTubeProviderMetadata(url: URL): ProviderSpecificMetadata {
  const isMusicYouTube = url.hostname.toLowerCase() === 'music.youtube.com';

  if (isMusicYouTube) {
    return {
      // Drop the oEmbed video-frame thumbnail; the og:image artwork is better.
      excludeImageHostnames: ['i.ytimg.com'],
      // Signal the merge step to put OG images first so the album artwork
      // (yt3.googleusercontent.com) is selected as the primary image.
      preferOGImages: true,
    };
  }

  return {
    // Drop the channel avatar that YouTube mistakenly exposes as og:image.
    // The correct video thumbnail comes from oEmbed (i.ytimg.com).
    excludeImageHostnames: ['yt3.googleusercontent.com'],
  };
}
