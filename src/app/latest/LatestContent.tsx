import React from 'react';
import { cookies } from 'next/headers';
import PageLayout from '@/layouts/PageLayout';
import PageHeader from '@/components/PageHeader/PageHeader';
import CollectionList from '@/components/CollectionList/CollectionList';
import Section from '@/components/Section/Section';
import SectionHeader from '@/components/SectionHeader/SectionHeader';
import ListCard from '@/components/ListCard/ListCard';
import Hero from '@/components/Hero/Hero';
import { api } from '@/lib/api';
import { List } from '@/lib/types';
import { getTranslations } from 'next-intl/server';

const LATEST_LIMIT = 32;

export default async function LatestContent() {
  const t = await getTranslations('latest');
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('tidy_token');

  // Latest is public and cacheable; the heavy fetch now streams independently
  // instead of holding the whole route response open.
  const latestLists = await api.public.get<List[]>(`/api/v1/lists/latest?limit=${LATEST_LIMIT}`, {
    cache: 'force-cache',
    revalidate: 60,
  });

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <PageLayout>
        <PageHeader title={t('title')} caption={t('caption')} />
        <Section>
          <SectionHeader title={t('section')} />
          <CollectionList>
            {latestLists.map((list) => (
              <ListCard list={list} key={list.id} />
            ))}
          </CollectionList>
        </Section>
      </PageLayout>
    </>
  );
}
