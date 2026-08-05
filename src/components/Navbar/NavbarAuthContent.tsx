import React from 'react';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import { api, ApiFetchError } from '@/lib/api';
import { localizePath } from '@/lib/locale-path';
import { User } from '@/lib/types';
import { resolveUserLanguage } from '@/lib/resolve-user-language';
import { LANGUAGE_COOKIE_NAME } from '@/lib/language-mapper';

import NavbarAccountMenu from './NavbarAccountMenu';

export default async function NavbarAuthContent() {
  const t = await getTranslations('navbar');
  const locale = await getLocale();
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value ?? null;

  if (!authToken) {
    // User is not authenticated: resolve language from cookie or browser default
    const initialLanguage = await resolveUserLanguage({ userLanguageFromDb: null, acceptLanguage: null });
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
        <NavbarAccountMenu user={null} initialLanguage={initialLanguage} />
      </>
    );
  }

  try {
    const user = await api.auth.get<User>('/api/v1/me', {
      authorization: authToken,
      cache: 'no-store',
    });

    if (user) {
      // User is authenticated: resolve language from DB preference or cookie
      const initialLanguage = await resolveUserLanguage({ userLanguageFromDb: user.language ?? null });
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
          <NavbarAccountMenu user={user} initialLanguage={initialLanguage} />
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
      <NavbarAccountMenu user={null} initialLanguage={initialLanguage} />
    </>
  );
}
