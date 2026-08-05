/**
 * Language preference type aligned with database and locale codes.
 * No conversion needed - same values used everywhere.
 */

export type Language = 'en' | 'fr';
export type Locale = 'en' | 'fr';

export const LANGUAGE_COOKIE_NAME = 'tidy_language';
export const LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const SUPPORTED_LANGUAGES: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
};

