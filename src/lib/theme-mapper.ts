export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_COOKIE_NAME = 'tidy_theme';
export const THEME_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export function parseThemePreference(value: string | null | undefined): ThemePreference | null {
  const normalized = value?.toLowerCase();

  if (normalized === 'light' || normalized === 'dark' || normalized === 'system') {
    return normalized;
  }

  return null;
}

export function normalizeThemePreference(value: string | null): ThemePreference {
  return parseThemePreference(value) ?? 'system';
}

export function resolveColorSchemeFromTheme(theme: ThemePreference): 'light' | 'dark' | null {
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  return null;
}
