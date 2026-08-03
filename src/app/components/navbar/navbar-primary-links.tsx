"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import styles from './navbar.module.scss';
import NavLink from '@/app/components/nav-link/nav-link';
import { User } from '@/lib/types';
import { stripLocalePrefix } from '@/lib/locale-path';

interface NavbarPrimaryLinksProps {
  user: User | null;
}

export default function NavbarPrimaryLinks({ user }: NavbarPrimaryLinksProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Navbar');
  const normalizedPathname = stripLocalePrefix(pathname, locale);

  return (
    <div className={styles['nav-links']}>
      {user && (
        <NavLink
          href="/dashboard"
          label={t('dashboard')}
          active={normalizedPathname === '/dashboard'}
        />
      )}
      <NavLink href="/discover" label={t('discover')} active={normalizedPathname === '/discover'} />
      <NavLink href="/curators" label={t('curators')} active={normalizedPathname === '/curators'} />
      <NavLink href="/latest" label={t('latest')} active={normalizedPathname === '/latest'} />
    </div>
  );
}
