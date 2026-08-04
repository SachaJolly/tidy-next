'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import styles from './Navbar.module.scss';
import NavLink from '@/components/NavLink/NavLink';
import { stripLocalePrefix } from '@/lib/locale-path';

interface NavbarPrimaryLinksProps {
  hasAuthToken: boolean;
}

export default function NavbarPrimaryLinks({ hasAuthToken }: NavbarPrimaryLinksProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navbar');
  const normalizedPathname = stripLocalePrefix(pathname, locale);
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuthToken);

  useEffect(() => {
    const abortController = new AbortController();

    // Root layout content can persist across client navigations. We re-check the
    // session on route changes so forced backend logout (token revoked server-side)
    // hides protected nav items without requiring a hard refresh.
    const syncAuthState = async () => {
      try {
        const response = await fetch('/api/session', {
          cache: 'no-store',
          signal: abortController.signal,
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const payload = (await response.json()) as { authenticated?: boolean };
        setIsAuthenticated(payload.authenticated === true);
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        setIsAuthenticated(false);
      }
    };

    void syncAuthState();

    return () => {
      abortController.abort();
    };
  }, [pathname]);

  return (
    <div className={styles['nav-links']}>
      {isAuthenticated && (
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
