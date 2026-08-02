"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './navbar.module.scss';
import NavLink from '@/app/components/nav-link/nav-link';
import { User } from '@/lib/types';

interface NavbarPrimaryLinksProps {
  user: User | null;
}

export default function NavbarPrimaryLinks({ user }: NavbarPrimaryLinksProps) {
  const pathname = usePathname();

  return (
    <div className={styles['nav-links']}>
      {user && (
        <NavLink
          href="/dashboard"
          label="Dashboard"
          active={pathname === '/dashboard'}
        />
      )}
      <NavLink href="/discover" label="Discover" active={pathname === '/discover'} />
      <NavLink href="/curators" label="Curators" active={pathname === '/curators'} />
      <NavLink href="/latest" label="Latest" active={pathname === '/latest'} />
    </div>
  );
}
