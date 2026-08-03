import { notFound } from 'next/navigation';
import React from 'react';

import Page from '@/app/layouts/page';
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

import { api, ApiFetchError } from '@/lib/api';
import { List, User } from '@/lib/types';
import { getTranslations } from 'next-intl/server';

const PROFILE_PUBLIC_LISTS_LIMIT = 12;

type ProfileUser = User & {
  /**
   * The backend exposes a dedicated public counter so the UI never accidentally
   * mixes in private data. This is the only count the profile page is allowed
   * to render.
   */
  public_lists_count: number;
  publicLists: List[];
  avatar: string | null;
};

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  // Next.js App Router passes dynamic route params as a Promise in this setup.
  // We unwrap them first so the route can safely use the username before any
  // data fetching or rendering work starts.
  const { username } = await params;

  try {
    const t = await getTranslations('Profile');
    const common = await getTranslations('Common');
    // One public request is enough here because Rails returns the profile
    // snapshot plus the 12 public lists already attached to the user payload.
    const user = await api.public.get<ProfileUser>(`/api/v1/users/${username}?lists_limit=${PROFILE_PUBLIC_LISTS_LIMIT}`, {
      cache: 'force-cache',
      revalidate: 60,
    });

    if (!user) {
      notFound();
    }

    const publicLists = user.publicLists ?? [];

    return (
      <Page>
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
        {publicLists.length > 0 && (
          <Section>
            <SectionHeader title={t('publicLists', { count: publicLists.length })} />
            <CollectionList>
              {publicLists.map((list) => (
                <ListCard list={list} key={list.id} />
              ))}
            </CollectionList>
          </Section>
        )}
      </Page>
    );
  } catch (error: unknown) {
    if (error instanceof ApiFetchError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
