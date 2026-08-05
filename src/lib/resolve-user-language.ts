'use server';

import { cookies } from 'next/headers';
import {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_COOKIE_MAX_AGE,
  type Language,
} from './language-mapper';

/**
 * Resolve user's language preference.
 *
 * Priority order:
 * 1. User's database preference (if authenticated)
 * 2. NEXT_LOCALE cookie (set by middleware)
 * 3. Default to English
 *
 * Note: The middleware guarantees NEXT_LOCALE is always set, so we don't need
 * to resolve Accept-Language here. Cookie management is handled by middleware.
 */
export async function resolveUserLanguage(options: {
  userLanguageFromDb?: string | null;
  acceptLanguage?: string | null;
}): Promise<Language> {
  const { userLanguageFromDb } = options;
  const cookieStore = await cookies();

  // Priority 1: User's database preference (if authenticated)
  if (userLanguageFromDb === 'en' || userLanguageFromDb === 'fr') {
    return userLanguageFromDb;
  }

  // Priority 2: NEXT_LOCALE cookie (always set by middleware)
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLanguage === 'en' || cookieLanguage === 'fr') {
    return cookieLanguage;
  }

  // Default to English (shouldn't reach here due to middleware guarantee)
  return 'en';
}
