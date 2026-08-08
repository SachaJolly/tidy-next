import type { ProviderSpecificMetadata } from './provider-metadata';
import { extractSpotifyProviderMetadata } from './spotify-provider';
import { extractThreadsProviderMetadata } from './threads-provider';
import { extractXProviderMetadata } from './x-provider';
import { extractYouTubeProviderMetadata } from './youtube-provider';

function isXHostname(hostname: string): boolean {
  return (
    hostname === 'x.com' ||
    hostname.endsWith('.x.com') ||
    hostname === 'twitter.com' ||
    hostname.endsWith('.twitter.com')
  );
}

function isThreadsHostname(hostname: string): boolean {
  return (
    hostname === 'threads.com' ||
    hostname.endsWith('.threads.com') ||
    hostname === 'cdninstagram.com' ||
    hostname.endsWith('.cdninstagram.com')
  );
}

function isYouTubeHostname(hostname: string): boolean {
  return (
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be' ||
    hostname.endsWith('.youtu.be')
  );
}

function isSpotifyHostname(hostname: string): boolean {
  return hostname === 'open.spotify.com' || hostname.endsWith('.open.spotify.com');
}

export async function extractProviderSpecificMetadata(
  url: URL,
  html: string,
): Promise<ProviderSpecificMetadata> {
  const hostname = url.hostname.toLowerCase();

  if (isXHostname(hostname)) {
    return extractXProviderMetadata(html, url);
  }

  if (isThreadsHostname(hostname)) {
    return extractThreadsProviderMetadata(html);
  }

  if (isYouTubeHostname(hostname)) {
    return extractYouTubeProviderMetadata(url);
  }

  if (isSpotifyHostname(hostname)) {
    return extractSpotifyProviderMetadata();
  }

  return {};
}
