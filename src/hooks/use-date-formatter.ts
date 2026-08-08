'use client';

import { useFormatter, useMessages } from 'next-intl';
import type { DateTimeFormatOptions } from 'use-intl';

import { DATE_FORMATS, type DateFormat } from '@/lib/date-formats';
import { useUser } from '@/providers/UserProvider';

/**
 * Returns a locale-aware, timezone-aware date formatter.
 *
 * Format options come from locales/{locale}/date.json > formats (same source
 * as useFormatter().dateTime(value, 'short')), so changing a format in the
 * JSON propagates everywhere automatically.
 *
 * The user's timezone (from UserProvider) is applied transparently — call sites
 * never need to think about it.
 *
 * DATE_FORMATS from lib/date-formats.ts is kept as a fallback for the rare case
 * where messages aren't loaded yet (e.g. Storybook without a provider).
 *
 * Usage:
 *   const formatDate = useDateFormatter();
 *   formatDate(item.updatedAt, 'short')   // → "8 août 2026" (fr) or "Aug 8, 2026" (en)
 *   formatDate(item.updatedAt, 'long')    // → "8 août 2026" (fr) or "August 8, 2026" (en)
 */
export function useDateFormatter() {
  const format = useFormatter();
  const messages = useMessages();
  const { user } = useUser();

  const timezone = user?.timezone ?? undefined;

  // Read format presets from the locale JSON (the source of truth).
  // Falls back to the static DATE_FORMATS if the message tree isn't loaded.
  const jsonFormats = (
    messages?.date as { formats?: Record<string, Intl.DateTimeFormatOptions> }
  )?.formats ?? {};

  return (value: Date | string | number, formatName: DateFormat = 'short'): string => {
    const date = value instanceof Date ? value : new Date(value as string | number);

    // Prefer the JSON-defined options so locale differences (fr vs en) apply.
    // Merge timezone on top — next-intl doesn't support preset + extra options
    // in a single call, so we resolve the options here and pass them inline.
    const baseOptions: Intl.DateTimeFormatOptions =
      jsonFormats[formatName] ?? DATE_FORMATS[formatName];

    const options: Intl.DateTimeFormatOptions = timezone
      ? { ...baseOptions, timeZone: timezone }
      : baseOptions;

    return format.dateTime(date, options as DateTimeFormatOptions);
  };
}
