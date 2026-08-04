/**
 * Formats dates with the active locale so translated copy can stay focused on
 * sentence structure while the browser handles localized month/day names.
 */
export function formatDate(
  value: string | number | Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, options).format(date);
}
