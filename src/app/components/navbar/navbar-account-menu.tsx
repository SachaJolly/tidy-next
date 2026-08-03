"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './navbar.module.scss';
import NavLink from '@/app/components/nav-link/nav-link';
import Avatar from '@/app/components/avatar/avatar';
import { Dropdown } from '@/app/components/dropdown';
import { AccountDropdown } from './account-dropdown';
import { logoutAction } from '@/app/actions/auth';
import { User } from '@/lib/types';
import { stripLocalePrefix } from '@/lib/locale-path';

interface NavbarAccountMenuProps {
  user: User | null;
}

export default function NavbarAccountMenu({ user }: NavbarAccountMenuProps) {
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
              size="32"
              alt={user.name}
            />
          }
        />
      )}

      <Dropdown>
        <NavLink icon="more" aria-label="Open account menu" />
        <AccountDropdown user={user} onLogout={logoutAction} />
      </Dropdown>
    </div>
  );
}
