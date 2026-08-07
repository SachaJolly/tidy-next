'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Icon from '@/components/Icon/Icon';
import NavLink from '@/components/NavLink/NavLink';
import { Dropdown } from '@/components/Dropdown';
import { Logo } from '@/components/Logo/Logo';
import { useUser } from '@/providers/UserProvider';
import { NavbarActionsSkeleton } from './NavbarActions.skeleton';

import NavbarActions from './NavbarActions';
import NavbarOptions from './NavbarOptions';

import styles from './Navbar.module.scss';

export default function Navbar() {
  const t = useTranslations('navbar');
  const pathname = usePathname();
  const { user } = useUser();

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

        <div className={styles['nav-links']}>
          {user && (
            <NavLink href="/dashboard" label={t('dashboard')} active={pathname === '/dashboard'} />
          )}
          <NavLink href="/discover" label={t('discover')} active={pathname === '/discover'} />
          <NavLink href="/curators" label={t('curators')} active={pathname === '/curators'} />
          <NavLink href="/latest" label={t('latest')} active={pathname === '/latest'} />
        </div>

        <Suspense fallback={<NavbarActionsSkeleton />}>
          <NavbarActions />
        </Suspense>

        <Dropdown>
          <NavLink icon="more" aria-label="Open account menu" />
          <NavbarOptions />
        </Dropdown>
      </div>
    </nav>
  );
}
