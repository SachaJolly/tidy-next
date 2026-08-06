export type OEmbedProvider =
  'spotify' | 'youtube' | 'vimeo' | 'dailymotion' | 'soundcloud' | 'twitter';

function matchesDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

// Centralized provider detection used by both:
// - the oEmbed action (to know which endpoint to call)
// - the orchestrator (to choose strategy before fetching).
// When adding a provider, start here so routing stays consistent everywhere.
export function detectOEmbedProvider(url: URL): OEmbedProvider | null {
  const hostname = url.hostname.toLowerCase();

  if (matchesDomain(hostname, 'open.spotify.com')) {
    return 'spotify';
  }
  if (matchesDomain(hostname, 'youtube.com') || matchesDomain(hostname, 'youtu.be')) {
    return 'youtube';
  }
  if (matchesDomain(hostname, 'vimeo.com')) {
    return 'vimeo';
  }
  if (matchesDomain(hostname, 'dailymotion.com') || matchesDomain(hostname, 'dai.ly')) {
    return 'dailymotion';
  }
  if (matchesDomain(hostname, 'soundcloud.com')) {
    return 'soundcloud';
  }
  if (matchesDomain(hostname, 'twitter.com') || matchesDomain(hostname, 'x.com')) {
    return 'twitter';
  }

  return null;
}
