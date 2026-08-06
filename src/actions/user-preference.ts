'use server';

import { cookies } from 'next/headers';

import { api } from '@/lib/api';

/**
 * Describes how a single user preference is stored on the backend and in the cookie.
 *
 * @template T  The TypeScript type of the preference value (e.g. Language, ThemePreference).
 */
export interface UserPreferenceConfig<T = string> {
  /** Field name on the Rails User model (sent as `{ user: { [dbField]: value } }`). */
  dbField: string;
  /**
   * Optional transform applied to the value before sending it to the DB.
   * Example: theme values must be uppercased ('dark' → 'DARK') to match the
   * Rails enum definition.
   */
  dbTransform?: (value: T) => unknown;
  /** Cookie name used to persist the preference on the client. */
  cookieName: string;
  /** Cookie expiry in seconds (use a constant from the mapper file). */
  cookieMaxAge: number;
  /**
   * Optional transform applied to the value before writing it to the cookie.
   * Defaults to `String(value)`.
   */
  cookieTransform?: (value: T) => string;
}

/**
 * Persists a user preference following the strict DB-first hierarchy:
 *
 * 1. Authenticated user → PATCH /api/v1/me FIRST (DB is the source of truth).
 *    The cookie is only written AFTER the DB write succeeds.
 *    If the DB call throws, the error propagates so the caller can rollback
 *    any optimistic UI state — the cookie is never silently out of sync.
 *
 * 2. Guest user → write directly to the cookie (only source of truth available).
 *
 * This single function replaces all per-preference `changeX` helpers that share
 * the same structure (changeLanguage, changeTheme, …).
 */
export async function changeUserPreference<T>(
  value: T,
  config: UserPreferenceConfig<T>,
): Promise<void> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value;

  if (authToken) {
    // DB FIRST — do not catch; let errors propagate to the caller.
    const dbValue = config.dbTransform ? config.dbTransform(value) : value;
    await api.auth.patch(
      '/api/v1/me',
      { user: { [config.dbField]: dbValue } },
      { authorization: authToken, cache: 'no-store' },
    );
  }

  // Only reached when the DB write succeeded (or there was no DB write to do).
  await saveCookiePreference(value, config);
}

/**
 * Persists a preference value to a cookie only — no DB write.
 *
 * Use this when the DB has already been updated separately (e.g. in
 * `updatePreferencesSettings` which batches multiple fields into one PATCH)
 * and you only need to sync the resulting value to the browser cookie.
 */
export async function saveCookiePreference<T>(
  value: T,
  config: Pick<UserPreferenceConfig<T>, 'cookieName' | 'cookieMaxAge' | 'cookieTransform'>,
): Promise<void> {
  const cookieStore = await cookies();
  const cookieValue = config.cookieTransform ? config.cookieTransform(value) : String(value);

  cookieStore.set(config.cookieName, cookieValue, {
    maxAge: config.cookieMaxAge,
    httpOnly: false, // readable by client JS for hydration
    sameSite: 'lax',
    path: '/',
  });
}
