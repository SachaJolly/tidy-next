import React from 'react';
import Page from '@/components/page/page';
import PageHeader from '@/components/page-header/page-header';
import CollectionList from '@/components/collection-list/collection-list';
import Section from '@/components/section/section';
import SectionHeader from '@/components/section-header/section-header';
import ListCard from '@/components/list-card/list-card';
import Hero from '@/components/hero/hero';

import { api } from '@/lib/api';
import { List } from '@/lib/types';

import { getAuthStatus } from '@/lib/auth';

const Discover = async () => {
  // We now await the getAuthStatus function, as it correctly handles the async nature of cookies().
  const isAuthenticated = await getAuthStatus();

  const featuredLists = await api.get<List[]>('/api/v1/lists/featured');
  const trendingLists = await api.get<List[]>('/api/v1/lists/trending');

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
};

export default Discover;
