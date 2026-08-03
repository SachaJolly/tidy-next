import React from 'react';
import { cookies } from 'next/headers';
import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import CollectionList from '@/components/collection-list/collection-list';
import Section from '@/components/section/section';
import SectionHeader from '@/components/section-header/section-header';
import ListCard from '@/components/list-card/list-card';
import Hero from '@/components/hero/hero';

import { api } from '@/lib/api';
import { List } from '@/lib/types';
import { getTranslations } from 'next-intl/server';

const LATEST_LIMIT = 32;

export default async function Latest() {
  const t = await getTranslations('Latest');
  // Public page stays accessible to everyone; we only use the auth cookie to
  // decide whether to show the marketing hero.
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('tidy_token');

  // Latest remains a public page, but the fetch is still centrally cached so
  // identical requests collapse together across renders.
  const latestLists = await api.public.get<List[]>(`/api/v1/lists/latest?limit=${LATEST_LIMIT}`, {
    cache: 'force-cache',
    revalidate: 60,
  });

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <Page>
        <PageHeader
          title={t('title')}
          caption={t('caption')}
        />
        <Section>
          <SectionHeader title={t('section')} />
          <CollectionList>
            {latestLists.map((list) => (
              <ListCard list={list} key={list.id} />
            ))}
          </CollectionList>
        </Section>
      </Page>
    </>
  );
}
