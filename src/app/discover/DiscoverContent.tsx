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

type DiscoverPayload = {
  featuredLists: List[];
  trendingLists: List[];
};

const FEATURED_LIMIT = 9;
const TRENDING_LIMIT = 32;

export default async function DiscoverContent() {
  const t = await getTranslations('discover');

  // This auth check only decides whether we show the marketing hero. It stays
  // inside the streamed content so the page shell can paint immediately.
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('tidy_token');

  // Discover still uses one cacheable public request. The difference is that
  // the request now lives in a streamed child rather than blocking the route.
  const { featuredLists, trendingLists } = await api.public.get<DiscoverPayload>(
    `/api/v1/lists/discover?featured_limit=${FEATURED_LIMIT}&trending_limit=${TRENDING_LIMIT}`,
    {
      cache: 'force-cache',
      revalidate: 60,
    },
  );

  return (
    <>
      {!isAuthenticated && <Hero />}
      <PageLayout>
        <PageHeader title={t('title')} caption={t('caption')} />
        <Section>
          <SectionHeader title={t('featured')} />
          <CollectionList>
            {featuredLists.map((list, index) => (
              <ListCard list={list} bigger={index === 0} key={list.id} />
            ))}
          </CollectionList>
        </Section>
        <Section>
          <SectionHeader title={t('trending')} />
          <CollectionList>
            {trendingLists.map((list) => (
              <ListCard list={list} key={list.id} />
            ))}
          </CollectionList>
        </Section>
      </PageLayout>
    </>
  );
}
