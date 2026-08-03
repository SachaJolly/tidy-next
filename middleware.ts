import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { isProtectedRoute } from './src/lib/auth-routes';
import { resolveLocaleFromRequest, routing } from './src/i18n-routing';

/**
 * Route guard executed before the app renders.
 *
 * Why middleware still matters even with Server Components:
 * - It prevents unauthenticated users from ever reaching protected pages.
 * - It runs before the request hits the page tree, so redirects are instant.
 * - It complements the server-rendered navbar by keeping navigation honest.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const intlMiddleware = createMiddleware(routing);

  const pathSegments = pathname.split('/').filter(Boolean);
  const maybeLocale = pathSegments[0];
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const acceptLanguage = request.headers.get('accept-language')?.toLowerCase() ?? '';
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

  const token = request.cookies.get('tidy_token')?.value;

  if (hasLocalePrefix) {
   const response = NextResponse.redirect(new URL(canonicalPath, request.url));
   response.cookies.set('NEXT_LOCALE', detectedLocale, { path: '/' });
   return response;
  }

  // The auth guard runs first so protected pages never render for anonymous
  // users. We still persist the detected locale so the next request renders in
  // the user's language without exposing locale prefixes in the URL.
  if (isProtectedRoute(pathnameWithoutLocale) && !token) {
   const signinUrl = request.nextUrl.clone();
   signinUrl.pathname = '/signin';
   signinUrl.searchParams.set('callbackUrl', canonicalPath);
   const response = NextResponse.redirect(signinUrl);
   response.cookies.set('NEXT_LOCALE', detectedLocale, { path: '/' });
   return response;
  }

  // next-intl owns locale detection, redirects, and the locale cookie. By
  // delegating to it after auth checks, we keep the existing protection logic
  // intact while serving one canonical URL per page.
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
