/**
 * Fallback date format presets for use outside of a next-intl request context
 * (Server Actions, API routes, utility functions).
 *
 * The authoritative formats for the UI live in locales/{locale}/date.json > formats
 * and are loaded by next-intl via i18n.ts. These are the locale-agnostic defaults.
 */
import { DATE_FORMATS, type DateFormat } from './date-formats';

export { DATE_FORMATS, type DateFormat } from './date-formats';

/**
 * Formats a date using a named preset and an explicit locale.
 *
 * Use this only when outside of a next-intl request context
 * (e.g. in Server Actions, API routes, Server Components without getFormatter).
 * Inside client components, prefer `useFormatter().dateTime(value, 'short')` instead.
 *
 * @param value    - ISO string, Unix timestamp (ms), or Date object
 * @param locale   - BCP 47 locale tag, e.g. 'fr-FR' or navigator.language
 * @param format   - Named preset (default: 'short'), or a raw Intl.DateTimeFormatOptions
 * @param timeZone - Optional IANA timezone override, e.g. 'Europe/Paris'
 */
export function formatDate(
  value: string | number | Date,
  locale: string,
  format: DateFormat | Intl.DateTimeFormatOptions = 'short',
  timeZone?: string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const base: Intl.DateTimeFormatOptions =
    typeof format === 'string' ? DATE_FORMATS[format] : format;
  const options: Intl.DateTimeFormatOptions = timeZone ? { ...base, timeZone } : base;

  return new Intl.DateTimeFormat(locale, options).format(date);
}
