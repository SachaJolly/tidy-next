import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute } from './lib/auth-routes';
import { resolveLocaleFromRequest, routing } from './i18n-routing';
import { LANGUAGE_COOKIE_NAME, LANGUAGE_COOKIE_MAX_AGE } from './lib/language-mapper';
import { api, ApiFetchError } from './lib/api';
import type { User } from './lib/types';

/**
 * Route guard executed before the app renders.
 *
 * IMPORTANT — file location: this file MUST live at `src/proxy.ts`, not at the
 * project root, because this project's `app` directory lives under `src/app`.
 * Next.js's dev file watcher only looks for `middleware`/`proxy` files inside
 * the same parent folder as `app`/`pages` — i.e. `src/`. A root-level
 * `proxy.ts` (or the old `middleware.ts`) is silently never discovered or
 * invoked in that setup: no error, no warning, it just never runs. This was
 * the actual root cause of the DB->cookie language sync appearing completely
 * broken — the code was correct, but the file was never executed at all.
 *
 * Also note: as of Next.js 16, the `middleware.ts` file convention itself was
 * renamed to `proxy.ts` (exported function `proxy`, not `middleware`).
 *
 * Why this proxy still matters even with Server Components:
 * - It prevents unauthenticated users from ever reaching protected pages.
 * - It runs before the request hits the page tree, so redirects are instant.
 * - It complements the server-rendered navbar by keeping navigation honest.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathSegments = pathname.split('/').filter(Boolean);
  const maybeLocale = pathSegments[0];
  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';

  const token = request.cookies.get('tidy_token')?.value;
  let isAuthenticated = !!token;
  let userLanguageFromDb: string | null = null;

  // If authenticated, fetch user language from DB (highest priority)
  if (token) {
    try {
      const user = await api.auth.get<User>('/api/v1/me', {
        authorization: token,
        cache: 'no-store',
      });
      userLanguageFromDb = user?.language ?? null;
    } catch (error) {
      if (error instanceof ApiFetchError && error.status === 401) {
        isAuthenticated = false;
      }

      // If API fails, fall back to cookie/header detection
      if (!(error instanceof ApiFetchError && error.status === 401)) {
        console.error('[proxy] failed to fetch user language:', error);
      }
    }
  }

  // Detect locale with DB preference as highest priority
  const currentCookieLocale = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  const cookieLocale = userLanguageFromDb || currentCookieLocale;
  const detectedLocale = resolveLocaleFromRequest({
   pathnameLocale: routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
     ? maybeLocale
     : null,
   cookieLocale,
   acceptLanguage,
  });
  
  const pathnameWithoutLocale = routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
   ? `/${pathSegments.slice(1).join('/')}`
   : pathname;
  const hasLocalePrefix = routing.locales.includes(maybeLocale as (typeof routing.locales)[number]);
  const canonicalPath = pathnameWithoutLocale === '' ? '/' : pathnameWithoutLocale;

  // Cookie options shared across all cookie sets in this proxy
  const cookieOptions = {
   maxAge: LANGUAGE_COOKIE_MAX_AGE,
   httpOnly: false,
   sameSite: 'lax' as const,
   path: '/',
  };

  if (hasLocalePrefix) {
   const response = NextResponse.redirect(new URL(canonicalPath, request.url));
   response.cookies.set(LANGUAGE_COOKIE_NAME, detectedLocale, cookieOptions);
   return response;
  }

  // The auth guard runs first so protected pages never render for anonymous
  // users. We still persist the detected locale so the next request renders in
  // the user's language without exposing locale prefixes in the URL.
  if (isProtectedRoute(pathnameWithoutLocale) && !isAuthenticated) {
   const signinUrl = request.nextUrl.clone();
   signinUrl.pathname = '/signin';
   signinUrl.searchParams.set('callbackUrl', canonicalPath);
   const response = NextResponse.redirect(signinUrl);
   response.cookies.set(LANGUAGE_COOKIE_NAME, detectedLocale, cookieOptions);
   return response;
  }

  // BUG A FIX: propagate the synced locale to THIS request, not just the next one.
  //
  // `response.cookies.set()` only writes a Set-Cookie header for the BROWSER to store
  // and send back on its NEXT request. It does NOT change what `cookies()` returns to
  // Server Components rendered as part of THIS request/response cycle. That means if the
  // DB language differs from the incoming cookie (e.g. changed on another device), the
  // very request that's supposed to fix it would still render with the stale locale in
  // `layout.tsx` (only the Navbar looked correct, since it re-fetches the user directly).
  //
  // The fix: mutate `request.cookies` in place (same object reference used downstream)
  // and forward it via `NextResponse.next({ request })`. Per Next.js's documented pattern,
  // this makes the corrected cookie value visible to `cookies()` calls in Server Components
  // rendered for THIS request, while the `response.cookies.set()` below still ensures the
  // browser persists it for future requests too.
  request.cookies.set(LANGUAGE_COOKIE_NAME, detectedLocale);

  // Build a pass-through response while forwarding the updated request headers.
  // We do NOT call next-intl's middleware here because this app does not use
  // locale-prefixed routes (no /[locale]/... segment). Rewriting to /en/... or
  // /fr/... would route into unknown paths and cause widespread 404s.
  const response = NextResponse.next({ request: { headers: request.headers } });

  // Always set the cookie to ensure it's in sync with:
  // 1. User's DB language (if authenticated and changed on another device)
  // 2. Browser's Accept-Language header (if not authenticated)
  response.cookies.set(LANGUAGE_COOKIE_NAME, detectedLocale, cookieOptions);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
