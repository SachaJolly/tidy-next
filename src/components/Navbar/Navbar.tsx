import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import styles from './navbar.module.scss';
import NavLink from '@/components/nav-link/nav-link';
import Icon from '@/components/icon/icon';
import { Logo } from '@/components/logo/logo';
import { getTranslations } from 'next-intl/server';
import NavbarPrimaryLinks from './navbar-primary-links';
import NavbarAuthContent from './navbar-auth-content';
import { NavbarAuthFallback } from '@/components/loading-skeletons';
import { api, ApiFetchError } from '@/lib/api';
import { User } from '@/lib/types';

/**
 * The navbar stays on the root layout, so it must render immediately even when
 * a page is still streaming. We keep the shell synchronous and isolate the
 * auth-specific fetch behind Suspense so slow user lookups do not freeze the UI.
 */
export default async function Navbar() {
  const t = await getTranslations('navbar');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;
  const isAuthenticated = await resolveNavbarSession(authToken);

  return (
    <nav className={styles['container']}>
      <div className={styles['content']}>
        <NavLink href="/" className="brand">
          <Logo variant="default" />
        </NavLink>

        <form action="/search" className={styles['search-container']}>
          <Icon name="search" />
          <input
            type="text"
            name="search"
            className={styles['search-input']}
            placeholder={t('searchPlaceholder')}
          />
        </form>

        <NavbarPrimaryLinks hasAuthToken={isAuthenticated} />

        <Suspense fallback={<NavbarAuthFallback />}>
          <NavbarAuthContent />
        </Suspense>
      </div>
    </nav>
  );
}

async function resolveNavbarSession(authToken: string | null): Promise<boolean> {
  if (!authToken) {
    return false;
  }

  // Presence of a cookie is not enough: expired/invalid tokens were keeping the
  // dashboard link visible. We validate the session with /me to match real auth
  // state and hide protected navigation when backend auth fails.
  try {
    const user = await api.auth.get<User>('/api/v1/me', {
      authorization: authToken,
      cache: 'no-store',
    });

    return !!user;
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 401) {
      return false;
    }

    throw error;
  }
}
