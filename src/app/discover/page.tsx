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

type DiscoverPayload = {
  featuredLists: List[];
  trendingLists: List[];
};

export default async function Discover() {
  // Public page stays accessible to everyone; we only use the auth cookie to
  // decide whether to show the marketing hero.
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('tidy_token');

  // Discover used to call two endpoints. The Rails controller now aggregates
  // both sections into a single public payload, which is then cached by Next.
  const { featuredLists, trendingLists } = await api.public.get<DiscoverPayload>(
    '/api/v1/lists/discover',
    {
      cache: 'force-cache',
      revalidate: 60,
    },
  );

  const featuredToDisplay = featuredLists.slice(0, 9);
  const trendingToDisplay = trendingLists.slice(0, 32);

  return (
    <>
      {!isAuthenticated && <Hero />}
      <Page>
        <PageHeader
          title="Discover"
          caption="Explore and discover the most popular lists on TidyCards."
        />
        <Section>
          <SectionHeader title="From our pick" />
          <CollectionList>
            {featuredToDisplay.map((list, index) => (
              <ListCard list={list} bigger={index === 0} key={list.id} />
            ))}
          </CollectionList>
        </Section>
        <Section>
          <SectionHeader title="Trending" />
          <CollectionList>
            {trendingToDisplay.map((list) => (
              <ListCard list={list} key={list.id} />
            ))}
          </CollectionList>
        </Section>
      </Page>
    </>
  );
}
