import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/page-header/page-header';
import CollectionList from '@/components/collection-list/collection-list';
import Avatar from '@/components/avatar/avatar';
import styles from '@/components/page-header/page-header.module.scss';
import MetaGroup from '@/components/meta-group/meta-group';
import Meta from '@/components/meta/meta';
import Icon from '@/components/icon/icon';
import Section from '@/components/section/section';
import SectionHeader from '@/components/section-header/section-header';
import ListCard from '@/components/list-card/list-card';
import { api } from '@/lib/api';
import { List, User } from '@/lib/types';
import { getTranslations } from 'next-intl/server';

const PROFILE_PUBLIC_LISTS_LIMIT = 12;

type ProfileUser = User & {
  /**
   * The backend already enforces public-only profile data here, so the streamed
   * UI can render the count without ever mixing in private lists.
   */
  public_lists_count: number;
  publicLists: List[];
  avatar: string | null;
};

type ProfilePageData = {
  user: ProfileUser;
  t: Awaited<ReturnType<typeof getTranslations>>;
  common: Awaited<ReturnType<typeof getTranslations>>;
};

const getProfilePageData = cache(async (username: string): Promise<ProfilePageData> => {
  const t = await getTranslations('Profile');
  const common = await getTranslations('Common');
  const user = await api.public.get<ProfileUser>(
    `/api/v1/users/${username}?lists_limit=${PROFILE_PUBLIC_LISTS_LIMIT}`,
    {
      cache: 'force-cache',
      revalidate: 60,
    },
  );

  if (!user) {
    notFound();
  }

  return { user, t, common };
});

export async function ProfileHeaderSection({ username }: { username: string }) {
  const { user, t, common } = await getProfilePageData(username);

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
              <h1 className={styles['title']}>{user.name}</h1>
              <MetaGroup>
                <Meta>@{user.username}</Meta>
              </MetaGroup>
            </div>
            {user.bio && <p className={styles['caption']}>{user.bio}</p>}
          </div>
          <MetaGroup>
            <Meta>
              <Icon name="verified" size={16} />
              <span>{common('verifiedUser')}</span>
            </Meta>
            <Meta>
              <Icon name="list" size={16} />
              {t('publicLists', { count: user.public_lists_count })}
            </Meta>
          </MetaGroup>
        </div>
      </div>
    </PageHeader>
  );
}

export async function ProfileListsSection({ username }: { username: string }) {
  const { user, t } = await getProfilePageData(username);
  const publicLists = user.publicLists ?? [];

  if (publicLists.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionHeader title={t('publicLists', { count: publicLists.length })} />
      <CollectionList>
        {publicLists.map((list) => (
          <ListCard list={list} key={list.id} />
        ))}
      </CollectionList>
    </Section>
  );
}

export { getProfilePageData };
