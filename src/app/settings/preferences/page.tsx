import React from 'react';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { api } from '@/lib/api';
import { changeLanguage } from '@/app/actions/language';
import { changeTheme } from '@/app/actions/theme';
import { changeTimezone } from '@/app/actions/timezone';
import { LANGUAGE_COOKIE_NAME, type LanguagePreference } from '@/lib/language-mapper';
import { THEME_COOKIE_NAME, normalizeThemePreference } from '@/lib/theme-mapper';
import { TIMEZONE_COOKIE_NAME, parseTimezone } from '@/lib/timezone-mapper';
import type { User } from '@/lib/types';

import LanguageSection from './LanguageSection';
import ThemeSection from './ThemeSection';
import TimezoneSection from './TimezoneSection';

export default async function PreferencesSettingsPage() {
  const t = await getTranslations('settings');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;
  let me: User | null = null;

  try {
    if (authToken) {
      me = await api.auth.get<User>('/api/v1/me', {
        authorization: authToken,
        cache: 'no-store',
      });
    }
  } catch {
    me = null;
  }

  const languageFromCookie = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const initialLanguage: LanguagePreference =
    me?.language === 'en' || me?.language === 'fr'
      ? me.language
      : languageFromCookie === 'en' || languageFromCookie === 'fr'
        ? languageFromCookie
        : 'en';

  const initialTheme = normalizeThemePreference(me?.theme ?? cookieStore.get(THEME_COOKIE_NAME)?.value ?? null);
  const initialTimezone = parseTimezone(me?.timezone) ?? parseTimezone(cookieStore.get(TIMEZONE_COOKIE_NAME)?.value) ?? null;

  return (
    <section>
      <h2 style={{ margin: 0 }}>{t('preferences.title')}</h2>
      <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('preferences.description')}</p>
      <ThemeSection initialTheme={initialTheme} onSave={changeTheme} />
      <LanguageSection initialLanguage={initialLanguage} onSave={changeLanguage} />
      <TimezoneSection initialTimezone={initialTimezone} onSave={changeTimezone} />
    </section>
  );
}

