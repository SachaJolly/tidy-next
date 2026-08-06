'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { localizePath, stripLocalePrefix } from '@/lib/locale-path';

import styles from './SettingsSidebar.module.scss';

const SETTINGS_ROUTES = [
  { href: '/settings/profile', labelKey: 'sidebar.profile' },
  { href: '/settings/preferences', labelKey: 'sidebar.preferences' },
  { href: '/settings/account', labelKey: 'sidebar.account' },
  { href: '/settings/security', labelKey: 'sidebar.security' },
] as const;

export default function SettingsSidebar() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const pathname = usePathname();
  const normalizedPathname = stripLocalePrefix(pathname, locale);

  const isRouteActive = (href: string) => {
    return normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);
  };

  return (
    <aside className={styles.sidebar} aria-label={t('sidebar.title')}>
      <p className={styles.sidebarTitle}>{t('sidebar.title')}</p>
      <nav className={styles.nav}>
        {SETTINGS_ROUTES.map((route) => (
          <Link
            key={route.href}
            href={localizePath(route.href, locale)}
            className={`${styles.navLink} ${isRouteActive(route.href) ? styles.navLinkActive : ''}`}
          >
            {t(route.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
