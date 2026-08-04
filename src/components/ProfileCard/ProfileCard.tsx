'use client';

import React from 'react';
import styles from './ProfileCard.module.scss';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup';
import Button from '@/components/Button/Button';
import Avatar from '@/components/Avatar/Avatar';
import MetaGroup from '@/components/MetaGroup/MetaGroup';
import Meta from '@/components/Meta/Meta';
import Icon from '@/components/Icon/Icon';
import ListCard from '@/components/ListCard/ListCard';
import type { List } from '@/lib/types';
import { useTranslations } from 'next-intl';

export interface ProfileCardData {
  id: string;
  name: string;
  handle: string;
  bio: string | null;
  listsCount: number;
  recentLists: List[];
}

export type ProfileCardEntry = ProfileCardData;

interface ProfileCardProps {
  profile: ProfileCardData;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const common = useTranslations('common');
  const t = useTranslations('ProfileCard');
  const { name, handle, bio, listsCount, recentLists } = profile;
  const displayName = name || handle;
  const initialsSource = displayName || handle || '?';

  return (
    <section className={styles['curator-list']}>
      <div className={styles['curator-meta-container']}>
        <div className={styles['curator-meta-content']}>
          <div className={styles['curator-meta-profile']}>
            <Avatar size="56" initials={initialsSource[0]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <h4 className={styles['title']}>{displayName}</h4>
              <MetaGroup>
                <Meta type="handle">@{handle}</Meta>
              </MetaGroup>
            </div>
          </div>
          {bio && <div className={styles['curator-meta-description']}>{bio}</div>}
          <MetaGroup orientation="vertical">
            <Meta>
              <Icon name="verified" size={16} />
              <span>{common('verifiedUser')}</span>
            </Meta>
            <Meta>
              <Icon name="list" size={16} />
              <span>{t('lists', { count: listsCount })}</span>
            </Meta>
          </MetaGroup>
        </div>
        <ButtonGroup>
          <Button label={t('follow')} size="small" variant="interactive" />
          <Button label={common('seeMore')} size="small" variant="interactive" tinted={true} />
        </ButtonGroup>
      </div>
      {recentLists.length > 0 && recentLists.map((list) => <ListCard key={list.id} list={list} />)}
    </section>
  );
};

export default ProfileCard;
