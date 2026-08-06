import type { ProviderSpecificMetadata } from './provider-metadata';
import { extractThreadsProviderMetadata } from './threads-provider';
import { extractXProviderMetadata } from './x-provider';

function isXHostname(hostname: string): boolean {
  return (
    hostname === 'x.com' ||
    hostname.endsWith('.x.com') ||
    hostname === 'twitter.com' ||
    hostname.endsWith('.twitter.com')
  );
}

function isThreadsHostname(hostname: string): boolean {
  return hostname === 'threads.com' || hostname.endsWith('.threads.com');
}

export function extractProviderSpecificMetadata(url: URL, html: string): ProviderSpecificMetadata {
  const hostname = url.hostname.toLowerCase();

  if (isXHostname(hostname)) {
    return extractXProviderMetadata(html, url);
  }

  if (isThreadsHostname(hostname)) {
    return extractThreadsProviderMetadata(html);
  }

  return {};
}
