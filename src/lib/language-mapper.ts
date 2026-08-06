/**
 * Language preference mapping between display labels and locale codes.
 */

export type LanguagePreference = 'en' | 'fr';
export type Locale = 'en' | 'fr';

export const LANGUAGE_COOKIE_NAME = 'tidy_language';
export const LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const SUPPORTED_LANGUAGES: Record<LanguagePreference, string> = {
  en: 'English',
  fr: 'Français',
};

/**
 * A constant array of language options in the desired display order.
 * This centralizes the list for consistent use across the application.
 */
export const LANGUAGE_OPTIONS: LanguagePreference[] = ['en', 'fr'];
