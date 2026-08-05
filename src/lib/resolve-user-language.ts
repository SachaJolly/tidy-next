import { cookies } from 'next/headers';
import {
  LANGUAGE_COOKIE_NAME,
  toLanguage,
  type Language,
  type Locale,
} from './language-mapper';

/**
 * Resolve user's language preference from multiple sources (in order of priority):
 * 1. User's database preference (if authenticated)
 * 2. Cookie (persists across sessions, even when logged out)
 * 3. Browser's Accept-Language header
 * 4. Default 'en'
 */
export async function resolveUserLanguage(options: {
  userLanguageFromDb?: string | null; // User's language in database (if authenticated)
  acceptLanguage?: string | null; // Browser's Accept-Language header
}): Promise<Language> {
  const { userLanguageFromDb, acceptLanguage } = options;

  // Priority 1: User's database preference (if authenticated)
  if (userLanguageFromDb) {
    const normalized = userLanguageFromDb.toLowerCase();
    const language = toLanguage(normalized);
    if (language) return language;
  }

  // Priority 2: Cookie preference (persists when logged out)
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLanguage) {
    const language = toLanguage(cookieLanguage);
    if (language) return language;
  }

  // Priority 3: Browser's Accept-Language header (first preference)
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0]?.trim().split('-')[0];
    if (preferred === 'fr') return 'french';
    if (preferred === 'en') return 'english';
  }

  // Priority 4: Default to English
  return 'english';
}
