import { cookies } from 'next/headers';
import { type RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Asynchronously determines the authentication status by checking for an auth cookie.
 * This function must be awaited.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is authenticated.
 */
export async function getAuthStatus(): Promise<boolean> {
  // In some Next.js versions/contexts, cookies() can return a Promise.
  // We await it to be safe.
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('tidy_token');

  return !!tokenCookie;
}
