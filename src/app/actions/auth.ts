'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isProtectedRoute } from '@/lib/auth-routes';

/**
 * Atomically clears the session and routes based on where the user is.
 *
 * WHY CONDITIONAL SERVER-SIDE REDIRECT?
 * A client-side logout has a race condition: deleting the cookie and then
 * calling router.push() leaves a window where the Middleware sees an
 * unauthenticated request to the protected page and wrongly redirects to
 * /signin. Bundling the Set-Cookie + Location headers into one HTTP response
 * via a Server Action eliminates that window entirely.
 *
 * - Protected page: cookies cleared + redirect('/discover') in one response.
 *   The browser navigates away before the Middleware ever sees the page again.
 * - Public page: cookies cleared + revalidatePath so server components
 *   (Navbar, etc.) re-render in the unauthenticated state. The client then
 *   calls router.refresh() to apply the new cache.
 */
export async function logoutAction(currentPathname: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('tidy_token');
  cookieStore.delete('tidy_user');

  if (isProtectedRoute(currentPathname)) {
    // redirect() throws a NEXT_REDIRECT sentinel — execution stops here.
    // Both Set-Cookie and Location headers go to the client in one response.
    redirect('/discover');
  }

  revalidatePath('/', 'layout');
}

