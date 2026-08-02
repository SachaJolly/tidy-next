import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute } from './src/lib/auth-routes';

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

  // Public routes should stay cheap: no cookie lookup, no redirect work.
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('tidy_token')?.value;

  if (!token) {
    const signinUrl = request.nextUrl.clone();
    signinUrl.pathname = '/signin';
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
