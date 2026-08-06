export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_COOKIE_NAME = 'tidy_theme';
export const THEME_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export function normalizeThemePreference(value: string | null): ThemePreference {
  const normalized = value?.toLowerCase();

  if (normalized === 'light' || normalized === 'dark' || normalized === 'system') {
    return normalized;
  }

  return 'system';
}
