'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './Navbar.module.scss';
import NavLink from '@/components/NavLink/NavLink';
import Avatar from '@/components/Avatar/Avatar';
import { Dropdown } from '@/components/Dropdown';
import { AccountDropdown } from './AccountDropdown';
import { logoutAction } from '@/actions/auth';
import { User } from '@/lib/types';
import { stripLocalePrefix } from '@/lib/locale-path';
import { type LanguagePreference } from '@/lib/language-mapper';
import { type ThemePreference } from '@/lib/theme-mapper';

interface NavbarAccountMenuProps {
  user: User | null;
  initialLanguage: LanguagePreference;
  initialTheme: ThemePreference;
  initialTimezone: string | null;
}

export default function NavbarAccountMenu({ user, initialLanguage, initialTheme, initialTimezone }: NavbarAccountMenuProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const normalizedPathname = stripLocalePrefix(pathname, locale);

  const handleLogout = async () => {
    await logoutAction();
    // After the server action completes and cookies are cleared,
    // refresh the router to clear the client-side cache and fetch new server components.
    router.refresh();
  };

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
        <AccountDropdown user={user} initialLanguage={initialLanguage} initialTheme={initialTheme} initialTimezone={initialTimezone} onLogout={handleLogout} />
      </Dropdown>
    </div>
  );
}
