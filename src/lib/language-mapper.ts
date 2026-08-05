/**
 * Language preference mapping between display labels and locale codes.
 * - Display labels (UI): 'english', 'french', etc. (for dropdown values)
 * - Locale codes (DB/Cookie): 'en', 'fr', etc. (for routing and i18n)
 */

export type Language = 'english' | 'french';
export type Locale = 'en' | 'fr';

export const LANGUAGE_TO_LOCALE: Record<Language, Locale> = {
  english: 'en',
  french: 'fr',
};

export const LOCALE_TO_LANGUAGE: Record<Locale, Language> = {
  en: 'english',
  fr: 'french',
};

export const LANGUAGE_COOKIE_NAME = 'tidy_language';
export const LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Convert language display value to locale code.
 * @example toLocale('english') => 'en'
 */
export function toLocale(language: Language | string): Locale {
  const normalized = language.toLowerCase();
  return LANGUAGE_TO_LOCALE[normalized as Language] || 'en';
}

/**
 * Convert locale code to language display value.
 * @example toLanguage('en') => 'english'
 */
export function toLanguage(locale: Locale | string): Language {
  const normalized = locale.toLowerCase();
  return LOCALE_TO_LANGUAGE[normalized as Locale] || 'english';
}
