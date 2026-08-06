/**
 * Timezone preference utilities.
 *
 * Timezones are stored as IANA strings (e.g. "Europe/Paris", "America/New_York").
 * A NULL value in the DB means "user has never set a preference — fall back to
 * the browser's local timezone at display time".
 *
 * We purposely do NOT store a default in the DB so we can distinguish
 * "user explicitly chose UTC" from "user never set anything".
 */

export const TIMEZONE_COOKIE_NAME = 'tidy_timezone';
export const TIMEZONE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/** Sentinel value used when no timezone is stored (shows "Auto" in the UI). */
export const TIMEZONE_AUTO = 'auto' as const;

export type TimezonePreference = string | typeof TIMEZONE_AUTO;

/**
 * Validates that a string looks like a plausible IANA timezone identifier
 * (e.g. "Europe/Paris", "UTC", "America/New_York", "Asia/Kolkata").
 * Returns null for blank, 'auto', or obviously invalid strings.
 */
export function parseTimezone(value: string | null | undefined): string | null {
  if (!value || value === TIMEZONE_AUTO) return null;
  // IANA zones contain only letters, digits, underscores, hyphens, and slashes.
  if (!/^[A-Za-z0-9_\-/+]+$/.test(value)) return null;
  return value;
}

/**
 * Formats a timezone IANA key for display in the UI.
 *
 * Examples:
 *   "Europe/Paris"      → "Europe/Paris"
 *   "America/New_York"  → "America/New_York"
 *   null / 'auto'       → "Auto"
 *
 * We intentionally omit the UTC offset here: offsets change with DST
 * and are expensive to compute server-side without a date. The settings
 * page (which has full client-side Intl) is the right place for rich labels.
 */
export function formatTimezoneLabel(timezone: string | null | undefined): string {
  const parsed = parseTimezone(timezone);
  if (!parsed) return 'Auto';
  return parsed;
}
