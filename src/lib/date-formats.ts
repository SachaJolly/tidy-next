/**
 * Named date format presets — the single source of truth for date formatting.
 *
 * Equivalent to Rails' `en.yml > date > formats` — formats are declared once
 * here and registered into next-intl so every component uses the same names:
 *   `format.dateTime(value, 'short')` in client/server components
 *   `formatDate(value, locale, 'short')` in non-intl contexts (e.g. actions)
 *
 * Add new formats here as the UI evolves; never inline Intl.DateTimeFormatOptions
 * in components.
 *
 * This file has no imports so it is safe to import from both server-only
 * modules (i18n.ts) and client components.
 */
export const DATE_FORMATS = {
  /** "Aug 8, 2026" — compact date for metadata footers, captions, timestamps */
  short: { year: 'numeric', month: 'short', day: 'numeric' },

  /** "August 8, 2026" — full month name for article headers, detail views */
  long: { year: 'numeric', month: 'long', day: 'numeric' },

  /** "08/08/2026" — numeric-only, useful for dense tables or tooltips */
  numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },

  /** "Aug 2026" — month + year only, e.g. album/publication date */
  monthYear: { year: 'numeric', month: 'short' },

  /** "Aug 8" — month + day only, e.g. recent activity in a feed */
  monthDay: { month: 'short', day: 'numeric' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateFormat = keyof typeof DATE_FORMATS;
