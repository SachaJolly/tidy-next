'use server';

import {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_COOKIE_MAX_AGE,
  type LanguagePreference,
} from '@/lib/language-mapper';
import { changeUserPreference, saveCookiePreference, type UserPreferenceConfig } from './user-preference';

// Centralised config for the language preference — single source of truth for
// field names, cookie name and expiry used by both save and change flows.
const LANGUAGE_CONFIG: UserPreferenceConfig<LanguagePreference> = {
  dbField: 'language',
  cookieName: LANGUAGE_COOKIE_NAME,
  cookieMaxAge: LANGUAGE_COOKIE_MAX_AGE,
};

/**
 * Persists the language preference to the cookie only (no DB write).
 * Use after a batch DB update that already included the language field,
 * e.g. in `updatePreferencesSettings`.
 */
export async function saveLanguagePreference(language: LanguagePreference): Promise<void> {
  await saveCookiePreference(language, LANGUAGE_CONFIG);
}

/**
 * Changes the user's language preference using the DB-first hierarchy.
 * See `changeUserPreference` in user-preference.ts for the full flow.
 */
export async function changeLanguage(language: LanguagePreference): Promise<void> {
  await changeUserPreference(language, LANGUAGE_CONFIG);
}

