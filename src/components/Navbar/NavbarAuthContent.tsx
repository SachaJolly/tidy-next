import React from 'react';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { api, ApiFetchError } from '@/lib/api';
import { User } from '@/lib/types';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Button from '@/components/Button/Button';
import NavbarAccountMenu from './NavbarAccountMenu';
import { localizePath } from '@/lib/locale-path';

export default async function NavbarAuthContent() {
  const t = await getTranslations('navbar');
  const locale = await getLocale();
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;

  if (!authToken) {
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
        <NavbarAccountMenu user={null} />
      </>
    );
  }

  try {
    const user = await api.auth.get<User>('/api/v1/me', {
      authorization: authToken,
      cache: 'no-store',
    });

    if (user) {
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
          <NavbarAccountMenu user={user} />
        </>
      );
    }
  } catch (error) {
    if (!(error instanceof ApiFetchError && error.status === 401)) {
      throw error;
    }
  }

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
      <NavbarAccountMenu user={null} />
    </>
  );
}
