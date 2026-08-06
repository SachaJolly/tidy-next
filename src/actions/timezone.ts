'use server';

import {
  TIMEZONE_COOKIE_NAME,
  TIMEZONE_COOKIE_MAX_AGE,
  type TimezonePreference,
} from '@/lib/timezone-mapper';
import { changeUserPreference, saveCookiePreference, type UserPreferenceConfig } from './user-preference';

// NULL is a valid DB value ("not set") — we do not store a transform here.
// The value is always a raw IANA string or null; null means "Auto" on the client.
const TIMEZONE_CONFIG: UserPreferenceConfig<string> = {
  dbField: 'timezone',
  cookieName: TIMEZONE_COOKIE_NAME,
  cookieMaxAge: TIMEZONE_COOKIE_MAX_AGE,
};

/**
 * Persists the timezone preference to the cookie only (no DB write).
 * Pass null to clear the cookie (= Auto).
 */
export async function saveTimezonePreference(timezone: TimezonePreference | null): Promise<void> {
  if (!timezone || timezone === 'auto') return; // null/auto = no cookie needed
  await saveCookiePreference(timezone, TIMEZONE_CONFIG);
}

/**
 * Changes the user's timezone preference using the DB-first hierarchy.
 * Pass null to clear the stored timezone (reverts to Auto).
 * See `changeUserPreference` in user-preference.ts for the full flow.
 */
export async function changeTimezone(timezone: string | null): Promise<void> {
  await changeUserPreference(timezone ?? '', { ...TIMEZONE_CONFIG, dbField: 'timezone' });
}
