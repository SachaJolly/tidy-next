'use server';

import { THEME_COOKIE_MAX_AGE, THEME_COOKIE_NAME, type ThemePreference } from '@/lib/theme-mapper';
import { changeUserPreference, saveCookiePreference, type UserPreferenceConfig } from './user-preference';

// Theme values are stored uppercase in the Rails enum ('LIGHT', 'DARK', 'SYSTEM')
// but represented lowercase in the frontend ('light', 'dark', 'system').
const THEME_CONFIG: UserPreferenceConfig<ThemePreference> = {
  dbField: 'theme',
  dbTransform: (v) => v.toUpperCase(),
  cookieName: THEME_COOKIE_NAME,
  cookieMaxAge: THEME_COOKIE_MAX_AGE,
};

/**
 * Persists the theme preference to the cookie only (no DB write).
 * Use after a batch DB update that already included the theme field,
 * e.g. in `updatePreferencesSettings`.
 */
export async function saveThemePreference(theme: ThemePreference): Promise<void> {
  await saveCookiePreference(theme, THEME_CONFIG);
}

/**
 * Changes the user's theme preference using the DB-first hierarchy.
 * See `changeUserPreference` in user-preference.ts for the full flow.
 */
export async function changeTheme(theme: ThemePreference): Promise<void> {
  await changeUserPreference(theme, THEME_CONFIG);
}
