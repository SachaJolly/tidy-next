import { cookies } from 'next/headers';
import {
  LANGUAGE_COOKIE_NAME,
  type Language,
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
  if (userLanguageFromDb === 'en' || userLanguageFromDb === 'fr') {
    return userLanguageFromDb;
  }

  // Priority 2: Cookie preference (persists when logged out)
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLanguage === 'en' || cookieLanguage === 'fr') {
    return cookieLanguage;
  }

  // Priority 3: Browser's Accept-Language header (first preference)
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0]?.trim().split('-')[0];
    if (preferred === 'fr') return 'fr';
    if (preferred === 'en') return 'en';
  }

  // Priority 4: Default to English
  return 'en';
}
