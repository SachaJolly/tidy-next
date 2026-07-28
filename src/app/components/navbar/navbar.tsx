'use client';

import React from 'react';
import styles from './navbar.module.scss';
import NavLink from '@/app/components/nav-link/nav-link';
import { usePathname } from 'next/navigation';
import Icon from '@/app/components/icon/icon';
import Avatar from '@/app/components/avatar/avatar';
import { Logo } from '@/app/components/logo/logo';
import { useAuth } from '@/contexts/AuthContext';
import { AccountDropdown } from './account-dropdown';
import { Dropdown, DropdownTrigger } from '@/app/components/dropdown';
import ButtonGroup from "@/components/button-group/button-group";
import Button from "@/components/button/button";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <nav className={styles['container']}>
        <div className={styles['content']} />
      </nav>
    );
  }

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
            placeholder="Search on Tidycards…"
          />
        </form>

        <div className={styles['nav-links']}>
          {isAuthenticated && (
            <NavLink href="/dashboard" label="Dashboard" active={pathname === '/dashboard'} />
          )}
          <NavLink href="/discover" label="Discover" active={pathname === '/discover'} />
          <NavLink href="/curators" label="Curators" active={pathname === '/curators'} />
          <NavLink href="/latest" label="Latest" active={pathname === '/latest'} />
        </div>

        {isAuthenticated && user ? (
          <Button icon="add" label="Create a list" variant="interactive" tinted={true} href="/lists/new" />
        ) : (
          <ButtonGroup>
            <Button label="Signin" variant="default" href="/signin" />
            <Button icon="join" label="Join today" variant="interactive" tinted={true} href="/signup" />
          </ButtonGroup>
        )}

        <div className={styles['nav-account']}>
          {/* Profile link — authenticated users only */}
          {isAuthenticated && user && (
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

          {/* Account dropdown — visible for everyone */}
          <Dropdown>
            <DropdownTrigger asChild>
              <NavLink icon="more" />
            </DropdownTrigger>
            <AccountDropdown user={user ?? null} onLogout={logout} />
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}
