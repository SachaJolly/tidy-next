import React from 'react';
import { cookies } from 'next/headers';
import styles from './navbar.module.scss';
import NavLink from '@/app/components/nav-link/nav-link';
import Icon from '@/app/components/icon/icon';
import { Logo } from '@/app/components/logo/logo';
import ButtonGroup from '@/components/button-group/button-group';
import Button from '@/components/button/button';
import { api, ApiFetchError } from '@/lib/api';
import { User } from '@/lib/types';
import NavbarAccountMenu from './navbar-account-menu';
import NavbarPrimaryLinks from './navbar-primary-links';

/**
 * Server-first navbar:
 * - reads the auth cookie on every server render
 * - fetches the current user on the server when a session exists
 * - reuses the shared API utility so we never duplicate auth logic
 *
 * This avoids the client router cache showing stale auth UI after soft
 * navigations, because the navbar now re-renders from server state.
 */
export default async function Navbar() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;

  let user: User | null = null;

  if (authToken) {
    // We pass the token explicitly so the shared API wrapper can forward the
    // Authorization header without the navbar re-implementing any fetch logic.
    try {
      user = await api.auth.get<User>('/api/v1/me', {
        authorization: authToken,
        cache: 'no-store',
      });
    } catch (error) {
      // Invalid or expired cookies should behave like "not signed in".
      // The middleware still protects private routes; the navbar only needs
      // to fall back to the public state.
      if (!(error instanceof ApiFetchError && error.status === 401)) {
        throw error;
      }
    }
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

        <NavbarPrimaryLinks user={user} />

        {user ? (
          <Button icon="add" label="Create a list" variant="interactive" tinted={true} href="/lists/new" />
        ) : (
          <ButtonGroup>
            <Button label="Signin" variant="default" href="/signin" />
            <Button icon="join" label="Join today" variant="interactive" tinted={true} href="/signup" />
          </ButtonGroup>
        )}

        <NavbarAccountMenu user={user} />
      </div>
    </nav>
  );
}
