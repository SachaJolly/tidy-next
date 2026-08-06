'use server';

import { cookies } from 'next/headers';

import { THEME_COOKIE_MAX_AGE, THEME_COOKIE_NAME, type ThemePreference } from '@/lib/theme-mapper';

export async function saveThemePreference(theme: ThemePreference): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(THEME_COOKIE_NAME, theme, {
    maxAge: THEME_COOKIE_MAX_AGE,
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  });
}
