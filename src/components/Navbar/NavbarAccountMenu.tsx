'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './Navbar.module.scss';
import NavLink from '@/components/NavLink/NavLink';
import Avatar from '@/components/Avatar/Avatar';
import { Dropdown } from '@/components/Dropdown';
import { AccountDropdown } from './AccountDropdown';
import { logoutAction } from '@/app/actions/auth';
import { User } from '@/lib/types';
import { stripLocalePrefix } from '@/lib/locale-path';
import { type Language } from '@/lib/language-mapper';
import { type ThemePreference } from '@/lib/theme-mapper';

interface NavbarAccountMenuProps {
  user: User | null;
  initialLanguage: Language;
  initialTheme: ThemePreference;
}

export default function NavbarAccountMenu({ user, initialLanguage, initialTheme }: NavbarAccountMenuProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const normalizedPathname = stripLocalePrefix(pathname, locale);

  return (
    <div className={styles['nav-account']}>
      {user && (
        <NavLink
          href={`/${user.username}`}
          label={user.name}
          active={normalizedPathname === `/${user.username}`}
          suffix={
            <Avatar
              initials={user.name.charAt(0)}
              src={user.avatar ?? undefined}
              size="32"
              alt={user.name}
            />
          }
        />
      )}

      <Dropdown>
        <NavLink icon="more" aria-label="Open account menu" />
        <AccountDropdown user={user} initialLanguage={initialLanguage} initialTheme={initialTheme} onLogout={logoutAction} />
      </Dropdown>
    </div>
  );
}
