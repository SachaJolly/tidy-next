'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import Avatar from '@/components/Avatar/Avatar';
import Button from '@/components/Button/Button';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Meta from '@/components/Meta/Meta';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import PageHeader from '@/components/PageHeader/PageHeader';
import type { List, User } from '@/lib/types';

import styles from './ProfileHeader.module.scss';

export type ProfileUser = User & {
  public_lists_count: number;
  publicLists: List[];
  avatar: string | null;
  emailConfirmed?: boolean;
  unconfirmedProfilePublicVisible?: boolean;
};

interface ProfileHeaderProps {
  user: ProfileUser;
  showEdit: boolean;
}

export default function ProfileHeader({
  user,
  showEdit,
}: ProfileHeaderProps) {
  const common = useTranslations('common');
  const profile = useTranslations('profile');

  return (
    <PageHeader>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
        <Avatar
          initials={user.name.charAt(0)}
          size="96"
          src={user.avatar ?? undefined}
          alt={user.name}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <h1 className={styles.title}>{user.name}</h1>
              <MetaGroup>
                <Meta>@{user.username}</Meta>
                {user.pronouns && <Meta>{user.pronouns}</Meta>}
              </MetaGroup>
            </div>
            {user.bio && <p className={styles.caption}>{user.bio}</p>}
          </div>
          <MetaGroup>
            <Meta icon="verified" label={common('verifiedUser')} />
            <Meta icon="list" label={profile('publicLists', { count: user.public_lists_count })} />
          </MetaGroup>
          {showEdit && (
            <ButtonGroup>
              <Button label="Edit profile" href="/settings" />
            </ButtonGroup>
          )}
        </div>
      </div>
    </PageHeader>
  );
}
