"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './navbar.module.scss';
import NavLink from '@/app/components/nav-link/nav-link';
import Avatar from '@/app/components/avatar/avatar';
import { Dropdown, DropdownTrigger } from '@/app/components/dropdown';
import { AccountDropdown } from './account-dropdown';
import { logoutAction } from '@/app/actions/auth';
import { User } from '@/lib/types';

interface NavbarAccountMenuProps {
  user: User | null;
}

export default function NavbarAccountMenu({ user }: NavbarAccountMenuProps) {
  const pathname = usePathname();

  return (
    <div className={styles['nav-account']}>
      {user && (
        <NavLink
          href={`/${user.username}`}
          label={user.name || user.username}
          active={pathname === `/${user.username}`}
          suffix={
            <Avatar
              initials={user.name ? user.name.charAt(0) : user.username.charAt(0)}
              size="32"
              alt={user.name}
            />
          }
        />
      )}

      <Dropdown>
        <DropdownTrigger asChild aria-label="Open account menu">
          <NavLink icon="more" />
        </DropdownTrigger>
        <AccountDropdown user={user} onLogout={logoutAction} />
      </Dropdown>
    </div>
  );
}
