/**
 * Single source of truth for route-level auth rules.
 * Imported by both Middleware (Edge runtime) and client components so the
 * same logic is never duplicated or allowed to drift.
 */

// Pages that provide no meaningful context to return to after a successful
// login (home/discover are public landing pages; auth pages would loop).
// Post-login navigation falls back to /dashboard for any of these.
export const LOGIN_REDIRECT_EXCEPTIONS = [
  '/',
  '/discover',
  '/latest',
  '/curators',
  '/signin',
  '/signup',
] as const;

// URL prefixes that require a valid auth token.
// Used by Middleware to protect server-side navigation AND by logout() to
// decide whether the user needs to be redirected away after clearing their session.
export const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/lists/new',
  '/settings',
] as const;

/** Returns true when the pathname matches any protected route prefix. */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));
}
