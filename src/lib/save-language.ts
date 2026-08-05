'use server';

import { cookies } from 'next/headers';
import {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_COOKIE_MAX_AGE,
  toLocale,
  type Language,
} from './language-mapper';

/**
 * Save language preference to cookie (and DB if user is authenticated).
 * This is a server action that persists the language choice across sessions.
 *
 * The cookie is set regardless of auth state, ensuring language preference
 * persists even when the user is logged out.
 *
 * When the user is authenticated, the preference is also saved to their
 * user record in the database (handled by settings endpoint).
 */
export async function saveLanguagePreference(language: Language): Promise<void> {
  const cookieStore = await cookies();

  // Convert display language to locale code ('english' -> 'en')
  const locale = toLocale(language);

  // Save to cookie with 1-year expiration
  cookieStore.set(LANGUAGE_COOKIE_NAME, locale, {
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
    httpOnly: false, // Allow client-side JS to read (for hydration, etc.)
    sameSite: 'lax',
    path: '/',
  });
}

export type { Language };
