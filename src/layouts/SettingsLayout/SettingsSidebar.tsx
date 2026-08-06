'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

import Icon from '@/components/Icon/Icon';
import { localizePath, stripLocalePrefix } from '@/lib/locale-path';

import styles from './SettingsSidebar.module.scss';

const SETTINGS_ROUTES = [
  { href: '/settings/profile', labelKey: 'sidebar.profile', icon: 'person' },
  { href: '/settings/preferences', labelKey: 'sidebar.preferences', icon: 'palette' },
  { href: '/settings/notifications', labelKey: 'sidebar.notifications', icon: 'notification' },
  { href: '/settings/account', labelKey: 'sidebar.account', icon: 'settings' },
  { href: '/settings/security', labelKey: 'sidebar.security', icon: 'private' },
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
      <nav className={styles.nav}>
        {SETTINGS_ROUTES.map((route) => (
          <Link
            key={route.href}
            href={localizePath(route.href, locale)}
            className={`${styles.navLink} ${isRouteActive(route.href) ? styles.navLinkActive : ''}`}
          >
            <Icon name={route.icon} size={20} aria-hidden />
            <span>{t(route.labelKey)}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
