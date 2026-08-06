import React from 'react';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import { api, ApiFetchError } from '@/lib/api';
import { localizePath } from '@/lib/locale-path';
import { User } from '@/lib/types';
import { resolveUserLanguage } from '@/lib/resolve-user-language';
import { THEME_COOKIE_NAME, normalizeThemePreference, type ThemePreference } from '@/lib/theme-mapper';

import NavbarAccountMenu from './NavbarAccountMenu';

export default async function NavbarAuthContent() {
  const t = await getTranslations('navbar');
  const locale = await getLocale();
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;
  const cookieTheme = normalizeThemePreference(cookieStore.get(THEME_COOKIE_NAME)?.value ?? null);

  if (!authToken) {
    // User is not authenticated: resolve language from cookie or browser default
    const initialLanguage = await resolveUserLanguage({ userLanguageFromDb: null, acceptLanguage: null });
    const initialTheme: ThemePreference = cookieTheme;
    return (
      <>
        <ButtonGroup>
          <Button label={t('signin')} variant="default" href={localizePath('/signin', locale)} />
          <Button
            icon="join"
            label={t('joinToday')}
            variant="interactive"
            tinted={true}
            href={localizePath('/signup', locale)}
          />
        </ButtonGroup>
        <NavbarAccountMenu user={null} initialLanguage={initialLanguage} initialTheme={initialTheme} />
      </>
    );
  }

  try {
    const user = await api.auth.get<User>('/api/v1/me', {
      authorization: authToken,
      cache: 'no-store',
    });

    if (user) {
      // User is authenticated: use database language preference directly
      // (middleware already synced it to cookie, but display the DB value which is source-of-truth)
      const userLanguage = (user.language === 'en' || user.language === 'fr') 
        ? user.language 
        : 'en';

      // NOTE: Multi-Device Reconciliation
      // When user fetches their profile on page load, the middleware has already synced
      // the DB language to the cookie (see middleware.ts lines 91-94).
      // The middleware runs on every request and handles all cookie updates.
      // No need to modify cookies here - this is a Server Component, not a Server Action.
      // 
      // Middleware logic ensures:
      // - Authenticated users: DB language (user.language) synced to cookie on every request
      // - Guest users: Accept-Language header synced to cookie
      // - Multi-device sync: If user changes language on Device A, Device B's next request
      //   will fetch the updated user.language from DB and update the cookie.

      const userTheme = normalizeThemePreference(user.theme ?? cookieTheme);

      return (
        <>
          <Button
            icon="add"
            label={t('createList')}
            variant="interactive"
            tinted={true}
            href="?modal=new-list"
            scroll={false}
          />
          <NavbarAccountMenu user={user} initialLanguage={userLanguage} initialTheme={userTheme} />
        </>
      );
    }
  } catch (error) {
    if (!(error instanceof ApiFetchError && error.status === 401)) {
      throw error;
    }
  }

  // If we reach here, user is not authenticated (token invalid/missing)
  const initialLanguage = await resolveUserLanguage({ userLanguageFromDb: null });
  const initialTheme: ThemePreference = cookieTheme;
  return (
    <>
      <ButtonGroup>
        <Button label={t('signin')} variant="default" href={localizePath('/signin', locale)} />
        <Button
          icon="join"
          label={t('joinToday')}
          variant="interactive"
          tinted={true}
          href={localizePath('/signup', locale)}
        />
      </ButtonGroup>
      <NavbarAccountMenu user={null} initialLanguage={initialLanguage} initialTheme={initialTheme} />
    </>
  );
}
