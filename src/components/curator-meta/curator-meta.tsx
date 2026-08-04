import React from 'react';
import styles from './curator-meta.module.scss';
import ButtonGroup from '@/components/button-group/button-group';
import Button from '@/components/button/button';
import Avatar from '@/components/avatar/avatar';
import MetaGroup from '@/components/meta-group/meta-group';
import Meta from '@/components/meta/meta';
import Icon from '@/components/icon/icon';
import ListCard from '@/components/list-card/list-card';
import type { List } from '@/lib/types';
import { getTranslations } from 'next-intl/server';

// Shape of a curator entry as returned by GET /api/v1/users/curators
// after transformApiData resolves the recentLists relationship from included.
export interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  listsCount: number;
  recentLists: List[];
}

export type CuratorEntry = Profile;

interface CuratorMetaProps {
  profile: Profile;
}

const CuratorMeta = async ({ profile }: CuratorMetaProps) => {
  const common = await getTranslations('common');
  const t = await getTranslations('curator-meta');
  const { name, username, bio, listsCount, recentLists } = profile;

  return (
    <section className={styles['curator-list']}>
      <div className={styles['curator-meta-container']}>
        <div className={styles['curator-meta-content']}>
          <div className={styles['curator-meta-profile']}>
            <Avatar size="56" initials={(name || username)[0]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <h4 className={styles['title']}>{name || username}</h4>
              <MetaGroup>
                <Meta type="handle">@{username}</Meta>
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

export default CuratorMeta;
