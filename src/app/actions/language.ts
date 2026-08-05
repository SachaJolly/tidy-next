'use server';

import { cookies } from 'next/headers';
import {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_COOKIE_MAX_AGE,
  type Language,
} from '@/lib/language-mapper';
import { api } from '@/lib/api';

/**
 * Save language preference to cookie.
 * Server action that persists the language choice across sessions.
 *
 * The cookie is set regardless of auth state, ensuring language preference
 * persists even when the user is logged out.
 *
 * When the user is authenticated, the preference is also saved to their
 * user record in the database (handled by updateUserLanguageInDb).
 */
export async function saveLanguagePreference(language: Language): Promise<void> {
  const cookieStore = await cookies();

  // Save to cookie with 1-year expiration
  cookieStore.set(LANGUAGE_COOKIE_NAME, language, {
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
    httpOnly: false, // Allow client-side JS to read (for hydration, etc.)
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Change the user's language preference, enforcing the strict hierarchy of truth:
 * the database is the single source of truth for authenticated users.
 *
 * Flow:
 * - Authenticated (auth token present): update the DB FIRST via PATCH /api/v1/me.
 *   The cookie is only synced AFTER the DB write succeeds. This guarantees the
 *   cookie can never silently diverge from a value that failed to persist —
 *   if the API call throws, this function propagates the error so the caller
 *   (AccountDropdown, Settings page) can surface it and leave the previous
 *   language selected instead of lying about what was actually saved.
 * - Guest (no auth token): there is no DB record to update, so the cookie
 *   itself is the guest's source of truth and is written directly.
 */
export async function changeLanguage(language: Language): Promise<void> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value;

  if (authToken) {
    // DB FIRST. Let ApiFetchError propagate — we intentionally do NOT catch it
    // here so a failed save does not silently fall through to updating the cookie.
    await api.auth.patch(
      '/api/v1/me',
      { user: { language } },
      { authorization: authToken, cache: 'no-store' },
    );
  }

  // Reached only if the DB write succeeded (or there was no DB write to do).
  await saveLanguagePreference(language);
}

