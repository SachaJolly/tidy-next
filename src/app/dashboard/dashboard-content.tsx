import React from 'react';
import { redirect } from 'next/navigation';
import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import CollectionList from '@/components/collection-list/collection-list';
import Section from '@/components/section/section';
import SectionHeader from '@/components/section-header/section-header';
import ListCard from '@/components/list-card/list-card';
import MetaGroup from '@/components/meta-group/meta-group';
import Meta from '@/components/meta/meta';
import { api, ApiFetchError } from '@/lib/api';
import { List, User } from '@/lib/types';
import { getTranslations } from 'next-intl/server';

const DASHBOARD_LIST_LIMIT = 32;

export default async function DashboardContent() {
  const t = await getTranslations('Dashboard');

  // Protected routes fail closed inside the streamed child. The page shell is
  // already visible, so the user never stares at a blank screen while auth is
  // being resolved.
  try {
    const lists = await getDashboardLists();

    if (!lists) {
      redirect('/signin');
    }

    return (
      <Page>
        <PageHeader title={t('title')} caption={t('caption')} />
        <Section>
          <SectionHeader title={t('myLists')}>
            <MetaGroup>
              <Meta>{t('defaultCollection')}</Meta>
              <Meta>{t('onlyPublicVisible')}</Meta>
            </MetaGroup>
          </SectionHeader>
          <CollectionList>
            {lists.length > 0 ? (
              lists.map((list) => (
                <ListCard
                  list={list}
                  key={list.id}
                  isAuthor={true}
                />
              ))
            ) : (
              <p>{t('emptyLists')}</p>
            )}
          </CollectionList>
        </Section>
      </Page>
    );
  } catch (error: unknown) {
    if (error instanceof ApiFetchError && error.status === 401) {
      redirect('/signin');
    }

    throw error;
  }
}

async function getDashboardLists(): Promise<List[] | null> {
  try {
    return await api.auth.get<List[]>(`/api/v1/me/lists?limit=${DASHBOARD_LIST_LIMIT}`, {
      cache: 'no-store',
    });
  } catch (error) {
    if (!(error instanceof ApiFetchError && error.status === 404)) {
      throw error;
    }

    // Some environments expose the current user profile but not the dedicated
    // dashboard collection endpoint. In that case we fall back to the profile
    // snapshot and hydrate the list section from the public relationship data
    // instead of crashing the whole page.
    const me = await api.auth.get<User>('/api/v1/me', {
      cache: 'no-store',
    });

    if (!me) {
      return null;
    }

    return getFallbackProfileLists(me.username);
  }
}

async function getFallbackProfileLists(username: string): Promise<List[] | null> {
  try {
    type ProfilePayload = {
      publicLists?: List[];
    };

    const profile = await api.public.get<ProfilePayload>(
      `/api/v1/users/${username}?lists_limit=${DASHBOARD_LIST_LIMIT}`,
      {
        cache: 'no-store',
      },
    );

    return profile?.publicLists ?? [];
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 404) {
      return [];
    }

    throw error;
  }
}
