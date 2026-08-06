import { NextResponse } from 'next/server';
import { isMediaProxyHost } from '@/lib/media-proxy';

const FETCH_TIMEOUT_MS = 12_000;
const BROWSER_LIKE_HEADERS: HeadersInit = {
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
};

function isPrivateHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  if (
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('.local')
  ) {
    return true;
  }

  if (/^127\./.test(normalized) || /^10\./.test(normalized) || /^192\.168\./.test(normalized)) {
    return true;
  }

  const match172 = normalized.match(/^172\.(\d{1,3})\./);
  if (match172) {
    const secondOctet = Number(match172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing "url" query parameter.' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 });
  }

  if (targetUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only HTTPS URLs are allowed.' }, { status: 400 });
  }

  if (isPrivateHostname(targetUrl.hostname)) {
    return NextResponse.json({ error: 'Private network URLs are not allowed.' }, { status: 403 });
  }

  if (!isMediaProxyHost(targetUrl.hostname)) {
    return NextResponse.json({ error: 'Host is not allowed for media proxy.' }, { status: 403 });
  }

  const outgoingHeaders = new Headers();
  for (const [key, value] of Object.entries(BROWSER_LIKE_HEADERS)) {
    outgoingHeaders.set(key, value);
  }
  const range = request.headers.get('range');
  if (range) {
    outgoingHeaders.set('range', range);
  }

  const upstream = await fetch(targetUrl.toString(), {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: outgoingHeaders,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      { error: `Media proxy upstream failed (HTTP ${upstream.status}).` },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get('content-type');
  const contentLength = upstream.headers.get('content-length');
  const contentRange = upstream.headers.get('content-range');
  const acceptRanges = upstream.headers.get('accept-ranges');
  const cacheControl = upstream.headers.get('cache-control');

  if (contentType) {
    responseHeaders.set('content-type', contentType);
  }
  if (contentLength) {
    responseHeaders.set('content-length', contentLength);
  }
  if (contentRange) {
    responseHeaders.set('content-range', contentRange);
  }
  if (acceptRanges) {
    responseHeaders.set('accept-ranges', acceptRanges);
  }

  responseHeaders.set(
    'cache-control',
    cacheControl && cacheControl.length > 0 ? cacheControl : 'public, max-age=300',
  );
  responseHeaders.set('x-media-proxy', '1');

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
