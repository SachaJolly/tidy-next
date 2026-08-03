import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import styles from './navbar.module.scss';
import NavLink from '@/app/components/nav-link/nav-link';
import Icon from '@/app/components/icon/icon';
import { Logo } from '@/app/components/logo/logo';
import { getTranslations } from 'next-intl/server';
import NavbarPrimaryLinks from './navbar-primary-links';
import NavbarAuthContent from './navbar-auth-content';
import { NavbarAuthFallback } from '@/app/components/loading-skeletons';

/**
 * The navbar stays on the root layout, so it must render immediately even when
 * a page is still streaming. We keep the shell synchronous and isolate the
 * auth-specific fetch behind Suspense so slow user lookups do not freeze the UI.
 */
export default async function Navbar() {
  const t = await getTranslations('Navbar');
  const cookieStore = await cookies();
  const hasAuthToken = !!cookieStore.get('tidy_token');

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

        <NavbarPrimaryLinks hasAuthToken={hasAuthToken} />

        <Suspense fallback={<NavbarAuthFallback />}>
          <NavbarAuthContent />
        </Suspense>
      </div>
    </nav>
  );
}
