import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute } from '@/lib/auth-routes';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through immediately if this is not a protected route — avoids
  // any performance cost for the vast majority of requests.
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('tidy_token')?.value;

  if (!token) {
    // Preserve the originally requested path so the login page can return
    // the user there after a successful authentication.
    const signinUrl = request.nextUrl.clone();
    signinUrl.pathname = '/signin';
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Explicitly exclude static assets, Next.js build output, images, and API
  // routes from the proxy. Matching these would cause broken responses or —
  // for /signin itself — an infinite redirect loop.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
