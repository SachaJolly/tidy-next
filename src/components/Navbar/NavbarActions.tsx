'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import Avatar from '@/components/Avatar/Avatar';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import NavLink from '@/components/NavLink/NavLink';
import { useUser } from '@/providers/UserProvider';

import styles from './Navbar.module.scss';

export default function NavbarActions() {
  const t = useTranslations('navbar');
  const { user } = useUser();

  if (!user) {
    return (
      <div className={styles['nav-account']}>
        <ButtonGroup>
          <Button label={t('signin')} variant="default" href="/signin" />
          <Button icon="join" label={t('joinToday')} variant="interactive" tinted={true} href="/signup" />
        </ButtonGroup>
      </div>
    );
  }

  return (
    <div className={styles['nav-account']}>
      <Button icon="add" label={t('createList')} variant="interactive" tinted={true} href="?modal=new-list" scroll={false} />
      <NavLink href={`/${user.username}`}>
        <span>{user.name}</span>
        <Avatar
          initials={user.name.charAt(0)}
          src={user.avatar ?? undefined}
          size="32"
          alt={user.name}
        />
      </NavLink>
    </div>
  );
}
